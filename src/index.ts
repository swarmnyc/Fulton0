export * from './router';
export * from './request-handler';
export * from './app';
export * from './request-handler';
export * from './loader';
export * from './route-loader';
export * from './service-loader';
export * from './service';
export * from './model';
export * from './oauth-grants';
export * from './schema';
export * from './context';
export * from './services/logger';
export * from './services/mongodb';
export * from './services/oauth2';
export * from './services/redis';
export * from './routers/jsonapi';
export interface DeserializedObject {
  [K: string]: any
}

export interface SerializedObject {
  [K: string]: any
}

export interface IAdapter {
  serialize: (input: DeserializedObject) => SerializedObject
  deserialize: (input: SerializedObject) => DeserializedObject
}

export class AdapterError extends Error {}