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

export default IAdapter