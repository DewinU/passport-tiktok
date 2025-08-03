import { Strategy as OAuth2Strategy, StrategyOptions as OAuth2StrategyOptions } from 'passport-oauth2';

export interface TikTokProfile {
    provider: 'tiktok';
    open_id: string;
    username: string | null;
    displayName: string;
    avatarUrl: string;
    _raw: string;
    _json: {
        data: {
            user: {
                open_id: string;
                username?: string;
                display_name: string;
                avatar_url: string;
            };
        };
    };
}

export interface TikTokStrategyOptions extends OAuth2StrategyOptions {
    clientKey: string;
    profileURL?: string;
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