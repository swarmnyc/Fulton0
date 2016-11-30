export * from './router';
export * from './route';
export * from './request-handler';
export * from './app';
export * from './request-handler';
export * from './loader';
export * from './config-loader';
export * from './route-loader';
export * from './service-loader';
export * from './service';
export * from './model';
export * from './oauth-grants';
export * from './schema';

interface DeserializedObject {
  [K: string]: any
}

interface SerializedObject {
  [K: string]: any
}

export interface IAdapter {
  serialize: (input: DeserializedObject) => SerializedObject
  deserialize: (input: SerializedObject) => DeserializedObject
}

export class AdapterError extends Error {}