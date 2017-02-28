import * as mongorito from 'mongorito';
import * as dotenv from 'dotenv';

beforeEach(async () => {
    // beforEach:Load env variables and clear database
    dotenv.config();
    let uri: string = process.env['MONGO_URI'] ? `${process.env['MONGO_URI']}-tests` : 'mongodb://localhost:27017/spec-tests';
    await mongorito.connect(uri); 
    return mongorito.db.dropDatabase();
});