interface DeserializedObject {
  [K: string]: any
}

interface SerializedObject {
  [K: string]: any
}

class AdapterError extends Error {
  static type = 'AdapterError'
}

export interface IAdapter {
  serialize: (input: DeserializedObject) => SerializedObject
  deserialize: (input: SerializedObject) => DeserializedObject
}

export default IAdapter