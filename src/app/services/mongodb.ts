import { BaseMongoDBService } from '../lib/services/mongodb';

export class MongoDB extends BaseMongoDBService {
  mongoUri() { 
    return 'mongodb://localhost:27017';
  }
}