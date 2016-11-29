export namespace OAuthGrants {
    export interface IOAuthAccessTokenObject {
        accessToken: string
        refreshToken?: string
        accessTokenExpiresOn: Date
        refreshTokenExpiresOn?: Date
        clientId: string
        scope?: OAuthScope
        [OptionalProperties: string]: any
    }

    export interface IOAuthClientObject {
        id: ClientId
        secret: ClientSecret
        grants?: string[]
        redirectUris?: string[]
    }

    interface IUserObject {
        id: any
        [K: string]: any
    }

    type ClientId = number | string
    type ClientSecret = string
    type OAuthScope = string[]
    type BearerToken = string

    export interface ClientCredentialsGrant {
        getAccessToken: (token: BearerToken) => Promise<IOAuthAccessTokenObject>
        getClient: (id: ClientId, secret: ClientSecret) => Promise<IOAuthClientObject>
        getUserFromClient: (id: ClientId, secret: ClientSecret) => Promise<IUserObject>
        saveToken: (token: IOAuthAccessTokenObject, user: IUserObject, client: IOAuthClientObject, scope?: OAuthScope) => Promise<IOAuthAccessTokenObject>
        validateScope?: (token: IOAuthAccessTokenObject, scope: OAuthScope) => Promise<boolean> 
    }

    export interface PasswordGrant {
        getAccessToken: (token: BearerToken) => Promise<IOAuthAccessTokenObject>
        getClient: (id: ClientId, secret: ClientSecret) => Promise<IOAuthClientObject>
        getUser: (username: string, password: string) => Promise<IUserObject>
        saveToken: (token: IOAuthAccessTokenObject, client: IOAuthClientObject, user: IUserObject, scope?: OAuthScope) => Promise<IOAuthAccessTokenObject>
        validateScope?: (token: IOAuthAccessTokenObject, scope: OAuthScope) => Promise<boolean>
    }

    export interface RefreshTokenGrant extends ClientCredentialsGrant {
        getRefreshToken: (refreshToken: string) => Promise<IOAuthAccessTokenObject>
        revokeToken: (token: IOAuthAccessTokenObject) => Promise<IOAuthAccessTokenObject>
    }
}

export default OAuthGrants