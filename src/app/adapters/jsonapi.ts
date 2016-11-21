import { IAdapter } from '../framework';
import { map as _map, kebabCase as _kebabCase, find as _find, assign as _assign, set as _set, get as _get, forEach as _forEach } from 'lodash';

interface SerializedJSONAPIObject {
  data: JSONAPIData|JSONAPIData[]
}

interface GenericObject {
  [K: string]: any
}

interface JSONAPIData {
  attributes: JSONAPIAttributes
  relationships: JSONAPIRelationships
  links?: JSONAPILinksObject|JSONAPILinksObject[]
  included?: JSONAPICompoundDocument|JSONAPICompoundDocument[]
}

interface JSONAPIAttributes {
  [K: string]: string|number|string[]|number[]|boolean|boolean[] 
}

interface JSONAPIRelationships {
  [Rel: string]: JSONAPIRelationship
}

interface JSONAPIRelationship {
  data: JSONAPIRelationshipData|JSONAPIRelationshipData[]
  links: JSONAPILinksObject|JSONAPILinksObject[]
}

interface JSONAPIRelationshipData {
  id: string|number
  type: string
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
  relationships(): void|IRelationshipDefinition[]
  serialize(input: GenericObject): SerializedJSONAPIObject
  deserialize(input: SerializedJSONAPIObject): GenericObject
}

export class JSONAPIAdapter implements IJSONAPIAdapter {
  private rels: IRelationshipDefinition[]
  
  constructor(rels?: IRelationshipDefinition[]) {
    this.rels = rels;
  }

  relationships() {
    return this.rels;
  }
  serialize(input: GenericObject|GenericObject[]) {
    const relationships: IRelationshipDefinition[] = this.relationships() || [];
    let output: SerializedJSONAPIObject = { data: [] };
    function _serialize(o: GenericObject) {
      let j: JSONAPIData = { attributes: {}, relationships: {} }; 
      _forEach(o, (value: any, key: string) => {
        const rel = _find(relationships, { path: key });
        const preamble = rel ? 'relationships' : 'attributes';
        const val = rel ? { data: { type: _get(rel, 'type'), id: value }} : value;
        _set(j, `${preamble}.${_kebabCase(key)}`, val);
      });
      return j;
    }
    if (Array.isArray(input)) {
      output.data = _map(input, _serialize);
    } else {
      output.data = _serialize(input);
    }

    // TODO Serialize links    
    return output;
  }

  deserialize(input: SerializedJSONAPIObject) {
    let data = _get(input, 'data');
    let output: GenericObject = {};
    let attrs = _get(data, 'attributes');
    let relationships = _get(data, 'relationships');

    _assign(output, attrs, relationships);
    return output;
  }
}

export default JSONAPIAdapter