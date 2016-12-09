export interface OAuth2Client {
  id: string
  secret: string
  grants?: string[]
  redirectUris?: string[]
}