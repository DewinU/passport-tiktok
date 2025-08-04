import OAuth2Strategy, { StrategyOptions as OAuth2StrategyOptions, InternalOAuthError } from 'passport-oauth2';
import { TikTokBasicProfile, TikTokExtendedProfile, TikTokStrategyOptions, VerifyFunction } from '../types';

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
 *         scope: ['user.info.basic']
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate({ tiktokId: profile.id }, function (err, user) {
 *           return cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {TikTokStrategyOptions} options
 * @param {VerifyFunction} verify
 * @api public
 */
class Strategy extends OAuth2Strategy {
  private _clientKey: string;
  private _profileURL: string;
  private _scope: string | string[];

  constructor(options: TikTokStrategyOptions, verify: VerifyFunction) {
    const strategyOptions: OAuth2StrategyOptions = {
      ...options,
      authorizationURL: options.authorizationURL || 'https://www.tiktok.com/v2/auth/authorize',
      tokenURL: options.tokenURL || 'https://open.tiktokapis.com/v2/oauth/token/',
      scopeSeparator: options.scopeSeparator || ',',
      scope: options.scope || ['user.info.basic']
    };
    
    if (!options.clientKey) {
      throw new TypeError('TikTokStrategy requires a clientKey option');
    }
    
    super(strategyOptions, verify);
    
    this._clientKey = options.clientKey;
    this._scope = options.scope || ['user.info.basic'];
    this._profileURL = options.profileURL || 'https://open.tiktokapis.com/v2/user/info/';
    this.name = 'tiktok';
    this._oauth2.useAuthorizationHeaderforGET(true);
  }

  /**
   * Authenticate request by delegating to TikTok using OAuth 2.0.
   *
   * @param {Object} req
   * @param {Object} options
   * @api protected
   */
  authenticate(req: any, options?: any): void {
    // Call the parent authenticate method
    super.authenticate(req, options);
  }

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * @param {Object} _options
   * @return {Object}
   * @api protected
   */
  authorizationParams(_options?: any): { client_key: string } {
    return {
      client_key: this._clientKey
    };
  }

  /**
   * Return extra parameters to be included in the token request.
   *
   * @param {Object} _options
   * @return {Object}
   * @api protected
   */
  tokenParams(_options?: any): { client_key: string } {
    return {
      client_key: this._clientKey
    };
  }

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
  userProfile(accessToken: string, done: (error: any, profile?: any) => void): void {
    // Check if we have the profile scope
    const hasProfileScope = this._scope.includes('user.info.profile');
    
    const profileFields = hasProfileScope 
        ? 'open_id,avatar_url,display_name,username'
        : 'open_id,avatar_url,display_name';
    
    const url = `${this._profileURL}?fields=${profileFields}`;
    
    this._oauth2.get(url, accessToken, (err: any, body: any, _res: any) => {
        if (err) {
            return done(new InternalOAuthError('Failed to fetch user profile', err));
        }
        
        let json: any;
        try {
            json = JSON.parse(body);
        } catch (ex) {
            return done(new Error('Failed to parse user profile'));
        }
        
        if (!json || !json.data || !json.data.user) {
            return done(new Error('Invalid TikTok response: missing user data'));
        }
        
        const user = json.data.user;
        
        if (!user.open_id) {
            return done(new Error('Invalid TikTok response: missing open_id'));
        }

        const baseProfile = {
            provider: 'tiktok' as const,
            openId: user.open_id,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            _raw: body,
            _json: json
        };

        // Return extended profile if we have username, basic profile otherwise
        if (hasProfileScope && user.username) {
            const extendedProfile: TikTokExtendedProfile = {
                ...baseProfile,
                username: user.username,
            };
            done(null, extendedProfile);
        } else {
            const basicProfile: TikTokBasicProfile = baseProfile;
            done(null, basicProfile);
        }
    });
  }
}

export default Strategy; 