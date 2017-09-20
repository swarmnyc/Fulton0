"use strict";
const _ = require('lodash');
class AdapterError extends Error {
}
AdapterError.type = 'AdapterError';
exports.AdapterError = AdapterError;
class JSONAPIAdapter {
    constructor(options) {
        this._deserialize = (input) => {
            let data = input;
            let output = {};
            let attrs, relationships;
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
            output = _.mapKeys(output, function (value, key) {
                return _.camelCase(key);
            });
            return output;
        };
        this.serialize = (input, page, limit) => {
            let output;
            if (Array.isArray(input)) {
                output = { data: input.map((o) => {
                        return this._serialize(o);
                    }) };
            }
            else {
                output = { data: this._serialize(input) };
            }
            return output;
        };
        this.deserialize = (input) => {
            let output;
            let data = input.data;
            if (Array.isArray(data)) {
                output = data.map((o) => {
                    return this._deserialize(o);
                });
            }
            else {
                output = this._deserialize(data);
            }
            return output;
        };
        this.rels = options.relationships;
        this.idPath = options.idPath || '_id';
        this.namespace = options.namespace;
        this.omitPaths = options.omit || [];
        this.type = options.type;
    }
    get relationships() {
        return this.rels;
    }
    _serialize(base) {
        const o = _.omit(base, this.omitPaths);
        const idPath = this.idPath;
        const oType = this.type;
        const namespace = !!this.namespace ? `/${this.namespace}` : '';
        const oId = o[idPath];
        const relationships = this.relationships || [];
        let j = { type: oType, id: oId, attributes: {}, relationships: {}, links: {} };
        j.links = { self: `${namespace}/${oType}/${oId}` };
        _.forEach(o, (value, key) => {
            const rel = _.find(relationships, { path: key });
            const preamble = rel ? 'relationships' : 'attributes';
            if (key === idPath) {
                return;
            }
            if (_.isNil(value)) {
                return;
            }
            if (!rel) {
                _.set(j, `${preamble}.${_.kebabCase(key)}`, value);
            }
            else {
                let relType = rel.type;
                let val = {
                    data: undefined,
                    links: undefined
                };
                if (Array.isArray(value)) {
                    val.data = _.compact(value).map((v) => {
                        return { type: relType, id: v };
                    });
                }
                else {
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
}
exports.JSONAPIAdapter = JSONAPIAdapter;
//# sourceMappingURL=index.js.map