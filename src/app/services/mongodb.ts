import { BaseMongoDBService } from '../lib/services/mongodb';
import { Model } from '../lib/model';
export class MongoDB extends BaseMongoDBService {
  mongoUri() { 
    return process.env['MONGO_URI'] || 'mongodb://localhost:27017/test';
  }

  


}