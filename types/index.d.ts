import { Strategy as OAuth2Strategy, StrategyOptions as OAuth2StrategyOptions } from 'passport-oauth2';



// Basic profile (Login Kit only)
export interface TikTokBasicProfile {
    provider: 'tiktok';
    openId: string;
    displayName: string;
    avatarUrl: string;
    _raw: string;
    _json: {
        data: {
            user: {
                open_id: string;
                display_name: string;
                avatar_url: string;
            };
        };
    };
}

// Extended profile (with additional permissions)
export interface TikTokExtendedProfile extends TikTokBasicProfile {
    username: string;
    _json: {
        data: {
            user: {
                open_id: string;
                username: string;
                display_name: string;
                avatar_url: string;
            };
        };
    };
}


export interface TikTokStrategyOptions extends OAuth2StrategyOptions {
    clientKey: string;
    profileURL?: string;
    authorizationURL?: string;
    tokenURL?: string;
}

export interface VerifyCallback {
    (error: any, user?: any, info?: any): void;
}

export interface VerifyFunction {
    (accessToken: string, refreshToken: string, profile: TikTokProfile, verified: VerifyCallback): void;
}

export class Strategy extends OAuth2Strategy {
    constructor(options: TikTokStrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: any, options?: any): void;
    userProfile(accessToken: string, done: (error: any, profile?: TikTokProfile) => void): void;
    authorizationParams(options: any): { client_key: string };
    tokenParams(options: any): { client_key: string };
}

export default Strategy;