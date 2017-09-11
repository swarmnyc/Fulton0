import { Model } from '../../model';
import { JSONAPIError } from './jsonapi-types';

export function onRequestError(err: Error) {
    let code: number;
    let mesg: JSONAPIError;
    let path: string;
    if (err instanceof Model.ValidationError) {
      code = 422;
      path = err.path;
    } else if (err instanceof Model.RequiredError) {
      code = 422;
      path = err.path;
    } else if (err instanceof Model.UniqueError) {
      code = 409;
      path = err.path; 
    } else if (err instanceof TypeError) {
      let pathstr = 'at path ';
      let pathIndex: number = (err.message.indexOf(pathstr)) + pathstr.length;
      code = 422;            
      path = err.message.substring(pathIndex, err.message.indexOf(' ', pathIndex));
    }
    mesg = { 
      title: err.name,
      code: code,
      detail: err.message,
      source: {
        pointer: `/data/attributes/${path}`
      }
    };
    
    return mesg;
}

