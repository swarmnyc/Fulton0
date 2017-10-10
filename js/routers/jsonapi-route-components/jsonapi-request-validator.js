"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-joi-router");
const schema_1 = require("../../schema");
const _ = require("lodash");
class RequestValidator {
    constructor(router) {
        this.router = router;
    }
    static createValidatorForJSONAPIHeaders() {
        let validator = new RequestValidator();
        return validator.createHeaderValidator();
    }
    static createValidatorForBody(router) {
        let validator = new RequestValidator(router);
        return validator.createBodyValidator();
    }
    static createValidatorForArrayBody(router) {
        let validator = new RequestValidator(router);
        return validator.createArrayBodyValidator();
    }
    createHeaderValidator() {
        return KoaRouter.Joi.object().keys({
            'Content-Type': KoaRouter.Joi.string().valid(['application/vnd.api+json', 'application/json']),
            'Authorization': KoaRouter.Joi.string()
        }).optionalKeys('Authorization').unknown(true);
        //unknown true -> allow properties that we haven't specified explicitly
    }
    createArrayBodyValidator() {
        return KoaRouter.Joi.array().items(this.createBodyValidator());
    }
    createBodyValidator() {
        let schema = this.router.Model().schema();
        //remove the hiddent paths from the schema
        let attributes = _.omit(schema, this.router.hidePaths());
        //for each property in the schema return a joi validation object
        attributes = _.mapValues(attributes, function (schemaKey) {
            return this.generateJoiValidationObjForSchemaType(schemaKey.type);
        }.bind(this));
        let relationshipKeys = _.map(this.router.Model().routerRelationships(), function (relationship) {
            return relationship.path;
        });
        let relationships = _.pick(attributes, relationshipKeys);
        attributes = _.omit(attributes, relationshipKeys);
        let data = KoaRouter.Joi.object().keys({
            type: KoaRouter.Joi.string().required().valid(this.router.type()),
            attributes: KoaRouter.Joi.object().keys(attributes),
            relationships: KoaRouter.Joi.object().optional().keys(relationships),
        });
        return KoaRouter.Joi.object().keys({
            data: data
        }).optional();
    }
    generateJoiValidationObjForSchemaType(type, joi = KoaRouter.Joi) {
        switch (type) {
            case schema_1.SchemaTypes.Boolean:
                return joi.boolean();
            case schema_1.SchemaTypes.Date:
                return joi.date();
            case schema_1.SchemaTypes.Number:
                return joi.number();
            case schema_1.SchemaTypes.String:
                return joi.string();
            case schema_1.SchemaTypes.ToOne:
                return joi.object().keys({
                    data: joi.object().keys({
                        type: joi.string(),
                        id: joi.string()
                    })
                });
            default://arrays!
                let typeOfArray = schema_1.SchemaTypes.getTypeOfArray(type);
                if (typeof typeOfArray === "undefined") {
                    return joi.any();
                }
                return joi.array()
                    .items(this.generateJoiValidationObjForSchemaType(typeOfArray, KoaRouter.Joi));
        }
    }
}
exports.RequestValidator = RequestValidator;
//# sourceMappingURL=jsonapi-request-validator.js.map