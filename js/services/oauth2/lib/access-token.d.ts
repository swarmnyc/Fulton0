export interface OAuth2AccessToken {
    access_token: string;
    refresh_token?: string;
    accessTokenExpiresOn: Date;
    refresh_token_expires_on?: Date;
    client_id: string;
    scope?: string[];
    authorization_code?: string;
    user_id?: string;
}
