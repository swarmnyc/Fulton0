export interface IOAuthAccessTokenObject {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresOn: Date;
    refreshTokenExpiresOn?: Date;
    clientId: string;
    scope?: OAuthScope;
    [OptionalProperties: string]: any;
}
export interface IOAuthAccessTokenDefinition {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresOn: Date;
    refreshTokenExpiresOn?: Date;
    clientId?: string;
    scope?: OAuthScope;
    [OptionalProperties: string]: any;
}
export interface IOAuthClientObject {
    id: ClientId;
    secret: ClientSecret;
    grants?: string[];
    redirectUris?: string[];
}
export interface IUserObject {
    id: any;
    [K: string]: any;
}
export declare type ClientId = number | string;
export declare type ClientSecret = string;
export declare type OAuthScope = string[];
export declare type BearerToken = string;
export declare type RefreshToken = string;
export declare type OAuthAuthCode = string;
export interface OAuthAuthObject {
    authorizationCode: OAuthAuthCode;
}
export interface GenericGrant {
    getAccessToken: (token: BearerToken) => Promise<IOAuthAccessTokenObject>;
    getClient: (id: ClientId, secret: ClientSecret) => Promise<IOAuthClientObject>;
    saveToken: (token: IOAuthAccessTokenObject, user: IUserObject, client: IOAuthClientObject, scope?: OAuthScope) => Promise<IOAuthAccessTokenObject>;
    generateAccessToken?: () => Promise<BearerToken>;
    generateAuthorizationCode?: () => Promise<OAuthAuthCode>;
    generateRefreshToken?: () => Promise<RefreshToken>;
    revokeAuthroizationCode?: () => Promise<IOAuthAccessTokenObject>;
    saveAuthorizationCode?: (authCode: OAuthAuthCode) => Promise<OAuthAuthObject>;
    validateScope?: (token: IOAuthAccessTokenObject, scope: OAuthScope) => Promise<boolean>;
}
export interface ClientCredentialsGrant extends GenericGrant {
    getUserFromClient: (id: ClientId, secret: ClientSecret) => Promise<IUserObject>;
}
export interface PasswordGrant extends GenericGrant {
    getUser: (username: string, password: string) => Promise<IUserObject>;
}
export interface RefreshTokenGrant extends ClientCredentialsGrant {
    getRefreshToken: (refreshToken: string) => Promise<IOAuthAccessTokenObject>;
    revokeToken: (token: IOAuthAccessTokenObject) => Promise<IOAuthAccessTokenObject>;
}
