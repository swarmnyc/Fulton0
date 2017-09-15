import { BaseMongoDBService } from '../../lib';
import { Model } from '../../lib';
export class MongoDB extends BaseMongoDBService {
  mongoUri() { 
    return process.env['MONGO_URI'] || 'mongodb://localhost:27017/test';
  }

  


}