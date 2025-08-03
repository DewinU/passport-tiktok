"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const passport_oauth2_1 = __importStar(require("passport-oauth2"));
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
 * @param {TikTokStrategyOptions} options
 * @param {VerifyFunction} verify
 * @api public
 */
class Strategy extends passport_oauth2_1.default {
    constructor(options, verify) {
        const strategyOptions = {
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
    authenticate(req, options) {
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
    authorizationParams(_options) {
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
    tokenParams(_options) {
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
    userProfile(accessToken, done) {
        const profileFields = 'open_id,avatar_url,display_name';
        const url = `${this._profileURL}?fields=${profileFields}`;
        this._oauth2.get(url, accessToken, (err, body, _res) => {
            if (err) {
                return done(new passport_oauth2_1.InternalOAuthError('Failed to fetch user profile', err));
            }
            let json;
            try {
                json = JSON.parse(body);
            }
            catch (ex) {
                return done(new Error('Failed to parse user profile'));
            }
            if (!json || !json.data || !json.data.user) {
                return done(new Error('Invalid TikTok response: missing user data'));
            }
            const user = json.data.user;
            if (!user.open_id) {
                return done(new Error('Invalid TikTok response: missing open_id'));
            }
            const profile = {
                provider: 'tiktok',
                open_id: user.open_id,
                username: user.username || null,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
                _raw: body,
                _json: json
            };
            done(null, profile);
        });
    }
}
exports.default = Strategy;
//# sourceMappingURL=strategy.js.map