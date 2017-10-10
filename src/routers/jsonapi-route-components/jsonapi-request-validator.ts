import * as KoaRouter from 'koa-joi-router';
import { Model } from '../../model';
import { SchemaTypes, ISchemaPathDefinition } from '../../schema';
import * as _ from 'lodash';
import { JSONAPIRouter, RouterRelationship } from './../jsonapi';


export interface ValidationProperties {
    Model(): typeof Model
    hidePaths(): string[]
    relationships(): RouterRelationship[]
    type(): string
}

export class RequestValidator {

    static createValidatorForJSONAPIHeaders(): any {
        let validator = new RequestValidator()
        return validator.createHeaderValidator();
    }

    static createValidatorForBody(router: ValidationProperties): any {
        let validator = new RequestValidator(router);
        return validator.createBodyValidator()
    }

    static createValidatorForArrayBody(router: ValidationProperties): any {
        let validator = new RequestValidator(router);
        return validator.createArrayBodyValidator()
    }

    constructor(private router?: ValidationProperties) {
    }

    createHeaderValidator(): any {
        return KoaRouter.Joi.object().keys({
            'Content-Type': KoaRouter.Joi.string().valid(['application/vnd.api+json', 'application/json']),
            'Authorization': KoaRouter.Joi.string()
          }).optionalKeys('Authorization').unknown(true);
          //unknown true -> allow properties that we haven't specified explicitly
    }

    createArrayBodyValidator(): any {
        return KoaRouter.Joi.array().items(this.createBodyValidator());
    }
    
    createBodyValidator(): any { //todo: fix validation
        let schema = this.router.Model().schema();

        //remove the hiddent paths from the schema
        let attributes = _.omit(schema, this.router.hidePaths())
        //for each property in the schema return a joi validation object
        attributes = _.mapValues(attributes, function(schemaKey: ISchemaPathDefinition) {
            return this.generateJoiValidationObjForSchemaType(schemaKey.type);
        }.bind(this));

        let relationshipKeys = _.map(this.router.Model().routerRelationships(), function(relationship) {
            return relationship.path;
        });
        let relationships = _.pick(attributes, relationshipKeys);        
    
        attributes = _.omit(attributes, relationshipKeys);
    
        let data = KoaRouter.Joi.object().keys({
          type: KoaRouter.Joi.string().required().valid(this.router.type()),
          attributes: KoaRouter.Joi.object().keys(attributes),
          relationships: KoaRouter.Joi.object().optional().keys(relationships),
        })
        
        return KoaRouter.Joi.object().keys({
            data: data
        }).optional();
      }

      generateJoiValidationObjForSchemaType(type: string, joi: any = KoaRouter.Joi): any {
        switch (type) {
            case SchemaTypes.Boolean:
              return joi.boolean();
            case SchemaTypes.Date:
              return joi.date();
            case SchemaTypes.Number:
              return joi.number();
            case SchemaTypes.String:
              return joi.string()
            case SchemaTypes.ToOne:
              return joi.object().keys({
                data: joi.object().keys({
                  type: joi.string(),
                  id: joi.string()
                })
              })
            default: //arrays!
              let typeOfArray = SchemaTypes.getTypeOfArray(type);
              if (typeof typeOfArray === "undefined") { return joi.any(); }
              return joi.array()
              .items(this.generateJoiValidationObjForSchemaType(typeOfArray, KoaRouter.Joi));  
          }
    }

}