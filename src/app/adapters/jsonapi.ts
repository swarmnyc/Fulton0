import { IAdapter } from '../lib';
import { keys as _keys, map as _map, kebabCase as _kebabCase, find as _find, assign as _assign, set as _set, get as _get, forEach as _forEach } from 'lodash';

interface GenericObject {
  [K: string]: any
}

interface SerializedJSONAPIObject {
  id: string;
  type: string;
  attributes: JSONAPIAttributes;
  relationships: JSONAPIRelationships;
  links?: JSONAPILinksObject|JSONAPILinksObject[];
  included?: JSONAPICompoundDocument|JSONAPICompoundDocument[];
}

interface JSONAPIAttributes {
  [K: string]: string|number|string[]|number[]|boolean|boolean[]; 
}

interface JSONAPIRelationships {
  [Rel: string]: JSONAPIRelationship;
}

interface JSONAPIRelationship {
  data: JSONAPIRelationshipData|JSONAPIRelationshipData[];
  links: JSONAPILinksObject|JSONAPILinksObject[];
}

interface JSONAPIRelationshipData {
  id: string|number;
  type: string;
}

interface JSONAPILinksObject {
  [linkType: string]: JSONAPILink  
}

interface JSONAPILink {
  link: string
}

interface JSONAPICompoundDocument {
  [attr: string]: string|number|string[]|number[]|boolean|boolean[]
}

interface IRelationshipDefinition {
  type: string,
  path: string  
}

interface IJSONAPIAdapter extends IAdapter {
  relationships: IRelationshipDefinition[];
  type: string;
  serialize(input: GenericObject): SerializedJSONAPIObject;
  deserialize(input: SerializedJSONAPIObject): GenericObject;
}

class AdapterError extends Error {
  static type = 'AdapterError'
}

interface IAdapterOptions {
  type: string;
  idPath?: string;
  relationships?: IRelationshipDefinition[]
}

export class JSONAPIAdapter implements IJSONAPIAdapter {
  private rels: IRelationshipDefinition[]
  idPath: string;
  type: string;
  
  constructor(options: IAdapterOptions) {
    this.rels = options.relationships;
    this.idPath = options.idPath || '_id';
    this.type = options.type;
  }

  get relationships() {
    return this.rels;
  }

  public serialize = (input: GenericObject) => {
    const idPath: string = this.idPath;
    const oType = this.type;
    const relationships: IRelationshipDefinition[] = this.relationships || [];
    let output: SerializedJSONAPIObject;
    function _serialize(o: GenericObject) {
      let j: SerializedJSONAPIObject = { type: oType, id: null, attributes: {}, relationships: {} }; 
      _forEach(o, (value: any, key: string) => {
        const rel = _find(relationships, { path: key });
        const preamble = rel ? 'relationships' : 'attributes';
        const val = rel ? { data: { type: _get(rel, 'type'), id: value }} : value;   
        if (key === idPath) {
          _set(j, 'id', value);
        } else {
          _set(j, `${preamble}.${_kebabCase(key)}`, val);
        }
      });
      if (_keys(j.relationships).length === 0) {
        delete j.relationships;
      }
      return j;
    }
    output = _serialize(input);    
    return output;
  }

  public deserialize = (input: SerializedJSONAPIObject) => {
    let data = _get(input, 'data');
    let output: GenericObject = {};
    let attrs: any, relationships: any;    

    if (!data) {
      throw new AdapterError(`Data provided to deserializer is not in JSON API format`);
    }

    attrs = _get(data, 'attributes');
    relationships = _get(data, 'relationships');

    _assign(output, attrs, relationships);
    return output;
  }
}

export default JSONAPIAdapter