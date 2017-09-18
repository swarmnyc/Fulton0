import { IAdapter } from '../..';
import * as _ from 'lodash';
import { JSONAPIRouter, RelationshipType } from '../../routers/jsonapi';

export class AdapterError extends Error {
  static type = 'AdapterError'
}



export class JSONAPIAdapter implements IAdapter {
  private rels: JSONAPIAdapterRelationship[]
  private omitPaths: string[]
  idPath: string;
  type: string;
  namespace: string;
  

  constructor(options: AdapterOptions) {
    this.rels = options.relationships;
    this.idPath = options.idPath || '_id';
    this.namespace = options.namespace;
    this.omitPaths = options.omit || [];
    this.type = options.type;
  }

  get relationships() {
    return this.rels;
  }

  protected _serialize(base: GenericObject) {
    const o = _.omit(base, this.omitPaths);
    const idPath: string = this.idPath;
    const oType = this.type;
    const namespace = !!this.namespace ? `/${this.namespace}` : '';
    const oId = o[idPath];
    const relationships: JSONAPIAdapterRelationship[] = this.relationships || [];
    let j: SerializedObject = { type: oType, id: oId, attributes: {}, relationships: {}, links: {} };
    j.links = { self: `${namespace}/${oType}/${oId}` };
    
    
    _.forEach(o, (value: any, key: string) => {
      const rel: JSONAPIAdapterRelationship = _.find(relationships, { path: key });
      const preamble = rel ? 'relationships' : 'attributes';
      
      if (key === idPath) {
        return;
      }

      if (_.isNil(value)) {
        return;
      }

      if (!rel) {
        _.set(j, `${preamble}.${_.kebabCase(key)}`, value);
      } else {
        let relType: string = rel.type;
        let val: SerializedRelationship = {
          data: undefined,
          links: undefined
        };

        if (Array.isArray(value)) {
          val.data = _.compact(value).map((v) => {
            return { type: relType, id: v };
          });
        } else {
          val.data = { type: relType, id: value };
        }

        val.links = { self: `${namespace}/${oType}/${oId}/relationships/${key}`, related: `${namespace}/${oType}/${oId}/${key}` };
        _.set(j, `${preamble}.${_.kebabCase(key)}`, val);
      }

    });
    if (_.keys(j.relationships).length === 0) {
      delete j.relationships;
    }
    return j;    
  }

  private _deserialize = (input: SerializedObject): GenericObject => {
    let data = input;
    let output: GenericObject = {};
    let attrs: any, relationships: any;        

    if (!data) {
      throw new AdapterError(`Data provided to deserializer is not in JSON API format`);
    }

    output[this.idPath] = data.id;
    attrs = _.get(data, 'attributes');
    relationships = _.get(data, 'relationships');
    relationships = _.mapValues(relationships, (rel) => {
      return rel.data && _.isArray(rel.data) ? _.map(rel.data, 'id') : _.get(rel.data, 'id');
    });

    Object.assign(output, attrs, relationships);

    output = _.mapKeys(output, function(value, key) {
      return _.camelCase(key);
    });
    return output;
  };

  public serialize = (input: GenericObject | GenericObject[], page?: number, limit?: number): Package => {
    let output: Package;

    if (Array.isArray(input)) {
      output = { data: input.map((o: GenericObject) => {
        return this._serialize(o);
      })};
    } else {
      output = { data: this._serialize(input) };
    }

    return output;
  };

  public deserialize = (input: Package): GenericObject | GenericObject[] => {
    let output: GenericObject | GenericObject[];
    let data = input.data;

    if (Array.isArray(data)) {
      output = data.map((o: SerializedObject) => {
        return this._deserialize(o);
      });
    } else {
      output = this._deserialize(data);
    }

    return output;
  } 
}


  export interface AdapterOptions {
    type: string;
    idPath?: string;
    relationships?: JSONAPIAdapterRelationship[]
    namespace?: string
    omit?: string[]
  }

  export interface GenericObject {
    [K: string]: any
  }

  export interface SerializedObject {
    id: string;
    type: string;
    attributes: Attributes;
    relationships?: Relationships;
    links?: LinksObject|LinksObject[];
    included?: CompoundDocument|CompoundDocument[];
  }

  export interface Package {
    data: SerializedObject | SerializedObject[]
    links?: LinksObject
  }

  export interface Attributes {
    [K: string]: any
  }

  export interface Relationships {
    [Rel: string]: SerializedRelationship;
  }

  export interface SerializedRelationship {
    data: RelationshipData|RelationshipData[];
    links: LinksObject;
  }

  export interface RelationshipData {
    id: string|number;
    type: string;
  }

  export interface LinksObject {
    self?: string
    related?: string
  }

  export interface CompoundDocument {
    [attr: string]: string|number|string[]|number[]|boolean|boolean[]
  }

  export interface JSONAPIAdapterRelationship {
    path: string  
    type: string
    relationshipType: RelationshipType
  }

