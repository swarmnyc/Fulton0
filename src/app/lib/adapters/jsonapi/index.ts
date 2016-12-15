import { IAdapter } from '../..';
import { keys as _keys, map as _map, kebabCase as _kebabCase, find as _find, assign as _assign, set as _set, get as _get, forEach as _forEach } from 'lodash';

interface GenericObject {
  [K: string]: any
}

interface SerializedJSONAPIObject {
  id: string;
  type: string;
  attributes: JSONAPIAttributes;
  relationships?: JSONAPIRelationships;
  links?: JSONAPILinksObject|JSONAPILinksObject[];
  included?: JSONAPICompoundDocument|JSONAPICompoundDocument[];
}

interface SerializedJSONAPIPackage {
  data: SerializedJSONAPIObject | SerializedJSONAPIObject[]
  links?: JSONAPILinksObject
}

interface JSONAPIAttributes {
  [K: string]: string|number|string[]|number[]|boolean|boolean[]; 
}

interface JSONAPIRelationships {
  [Rel: string]: JSONAPIRelationship;
}

interface JSONAPIRelationship {
  data: JSONAPIRelationshipData|JSONAPIRelationshipData[];
  links: JSONAPILinksObject;
}

interface JSONAPIRelationshipData {
  id: string|number;
  type: string;
}

interface JSONAPILinksObject {
  [linkType: string]: string
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
  serialize(input: GenericObject | GenericObject[]): SerializedJSONAPIPackage;
  deserialize(input: SerializedJSONAPIPackage): GenericObject | GenericObject[];
}

class AdapterError extends Error {
  static type = 'AdapterError'
}

interface IAdapterOptions {
  type: string;
  idPath?: string;
  relationships?: IRelationshipDefinition[]
  namespace?: string
}

export class JSONAPIAdapter implements IJSONAPIAdapter {
  private rels: IRelationshipDefinition[]
  idPath: string;
  type: string;
  namespace: string;
  
  constructor(options: IAdapterOptions) {
    this.rels = options.relationships;
    this.idPath = options.idPath || '_id';
    this.namespace = options.namespace;
    this.type = options.type;
  }

  get relationships() {
    return this.rels;
  }

  protected _serialize(o: GenericObject) {
    const idPath: string = this.idPath;
    const oType = this.type;
    const namespace = !!this.namespace ? `/${this.namespace}` : '';
    const oId = _get(o, idPath);
    const relationships: IRelationshipDefinition[] = this.relationships || [];
      let j: SerializedJSONAPIObject = { type: oType, id: o[idPath], attributes: {}, relationships: {}, links: {} };
      j.links = { self: `/${namespace}/${oType}/${oId}` };
      
      _forEach(o, (value: any, key: string) => {
        const rel = _find(relationships, { path: key });
        const preamble = rel ? 'relationships' : 'attributes';
        
        if (key === idPath) {
          return;
        }

        if (!rel) {
          _set(j, `${preamble}.${_kebabCase(key)}`, value);
        } else {
          
          let relType: string = rel.type;
          let val: JSONAPIRelationship = {
            data: undefined,
            links: undefined
          };

          if (Array.isArray(value)) {
            val.data =_map(value, (v) => {
              return { type: relType, id: v };
            });
          } else {
            val.data = { type: relType, id: value };
          }

          val.links = { self: `${namespace}/${oType}/${oId}/relationships/${key}`, related: `${namespace}/${oType}/${oId}/${key}` };
          
        }

      });
      if (_keys(j.relationships).length === 0) {
        delete j.relationships;
      }
      return j;    
  }

  private _deserialize = (input: SerializedJSONAPIObject) => {
    let data = input;
    let output: GenericObject = {};
    let attrs: any, relationships: any;        

    if (!data) {
      throw new AdapterError(`Data provided to deserializer is not in JSON API format`);
    }

    output[this.idPath] = data.id;
    attrs = _get(data, 'attributes');
    relationships = _get(data, 'relationships');

    _assign(output, attrs, relationships);
    return output;
  }

  public serialize = (input: GenericObject | GenericObject[], page?: number, limit?: number) => {
    let output: SerializedJSONAPIPackage;

    if (Array.isArray(input)) {
      output = { data: input.map((o: GenericObject) => {
        return this._serialize(o);
      })};
    } else {
      output = { data: this._serialize(input) };
    }

    return output;
  }

  public deserialize = (input: SerializedJSONAPIPackage) => {
    let output: GenericObject | GenericObject[];
    let data = input.data;

    if (Array.isArray(data)) {
      output = data.map((o: SerializedJSONAPIObject) => {
        return this._deserialize(o);
      });
    } else {
      output = this._deserialize(data);
    }

    return output;
  } 
}

export default JSONAPIAdapter