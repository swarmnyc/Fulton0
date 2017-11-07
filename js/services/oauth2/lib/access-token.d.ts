export interface OAuth2AccessToken {
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresOn: Date;
    refreshTokenExpiresOn?: Date;
    clientId: string;
    scope?: string[];
    authorizationCode?: string;
    userId?: string;
}
