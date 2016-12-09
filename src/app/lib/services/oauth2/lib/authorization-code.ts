import { OAuth2User, OAuth2Client } from '.';

export interface OAuth2AuthorizationCode {
  client: OAuth2Client
  user: OAuth2User
  expiresAt: Date
  redirectUri: string
  scope?: string[]
  authorizationCode: string
}