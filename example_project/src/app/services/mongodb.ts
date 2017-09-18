import { BaseMongoDBService } from 'fulton';
import { Model } from 'fulton';
export class MongoDB extends BaseMongoDBService {
  mongoUri() { 
    return process.env['MONGO_URI'] || 'mongodb://localhost:27017/test';
  }
}