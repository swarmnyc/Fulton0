import { Model } from '../../model';
import { RouterRelationship } from './../jsonapi';
export interface ValidationProperties {
    Model(): typeof Model;
    hidePaths(): string[];
    relationships(): RouterRelationship[];
    type(): string;
}
export declare class RequestValidator {
    private router;
    static createValidatorForJSONAPIHeaders(): any;
    static createValidatorForBody(router: ValidationProperties): any;
    static createValidatorForArrayBody(router: ValidationProperties): any;
    constructor(router?: ValidationProperties);
    createHeaderValidator(): any;
    createArrayBodyValidator(): any;
    createBodyValidator(): any;
    generateJoiValidationObjForSchemaType(type: string, joi?: any): any;
}
