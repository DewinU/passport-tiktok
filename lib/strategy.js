const OAuth2Strategy = require('passport-oauth2');
const util = require('util');
const { InternalOAuthError } = require('passport-oauth2');

/**
 * `Strategy` constructor.
 *
 * The TikTok authentication strategy authenticates requests by delegating to
 * TikTok using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid. If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`        your TikTok application's Client ID
 *   - `clientSecret`    your TikTok application's Client Secret
 *   - `clientKey`       your TikTok application's Client Key
 *   - `callbackURL`     URL to which TikTok will redirect the user after granting authorization
 *   - `scope`           array of permission scopes to request
 *
 * Examples:
 *
 *     passport.use(new TikTokStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret',
 *         clientKey: 'your-client-key',
 *         callbackURL: 'https://www.example.net/auth/tiktok/callback',
 *         scope: ['user.info.basic','user.info.profile', 'user.info.stats', 'video.list']
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate({ tiktokId: profile.id }, function (err, user) {
 *           return cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.tiktok.com/v2/auth/authorize';
  options.tokenURL = options.tokenURL || 'https://open.tiktokapis.com/v2/oauth/token/';
  options.scopeSeparator = options.scopeSeparator || ',';
  
  if (!options.clientKey) {
    throw new TypeError('TikTokStrategy requires a clientKey option');
  }
  
  this._clientKey = options.clientKey;
  this._profileURL = options.profileURL || 'https://open.tiktokapis.com/v2/user/info/';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'tiktok';
  this._oauth2.useAuthorizationHeaderforGET(true);
}

// Inherit from `OAuth2Strategy`
util.inherits(Strategy, OAuth2Strategy);

/**
 * Authenticate request by delegating to TikTok using OAuth 2.0.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  // Call the parent authenticate method
  OAuth2Strategy.prototype.authenticate.call(this, req, options);
};

/**
 * Return extra parameters to be included in the authorization request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function(options) {
  return {
    client_key: this._clientKey
  };
};

/**
 * Return extra parameters to be included in the token request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.tokenParams = function(options) {
  return {
    client_key: this._clientKey
  };
};

/**
 * Retrieve user profile from TikTok.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `tiktok`
 *   - `id`               the user's TikTok open_id
 *   - `username`         the user's TikTok username
 *   - `displayName`      the user's display name
 *   - `avatarUrl`        the URL of the user's profile picture
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  const profileFields = 'open_id,avatar_url,display_name';
  const url = `${this._profileURL}?fields=${profileFields}`;
  
  this._oauth2.get(url, accessToken, function(err, body, res) {
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    let json;
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    if (!json || !json.data || !json.data.user) {
      return done(new Error('Invalid TikTok response'));
    }
    
    const user = json.data.user;
    
    const profile = {
      provider: 'tiktok',
      id: user.open_id,
      username: user.username || null,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      _raw: body,
      _json: json
    };
    
    done(null, profile);
  });
};

// Expose constructor
module.exports = Strategy;