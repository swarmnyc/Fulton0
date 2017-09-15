import { BaseMongoDBService } from '../lib/services/mongodb';
import { Model } from '../lib/model';
import { OAuthClient, User } from '../models';
export class MongoDB extends BaseMongoDBService {
  mongoUri() { 
    return process.env['MONGO_URI'] || 'mongodb://localhost:27017/test';
  }

  async init() {
    let mongorito = await super.init()
    await this.createOauthClientsIfNeeded();
    await this.createAdminUser();
    return mongorito
  }

  async createAdminUser() {
    let user = await User.findOne()
    if (typeof user == "undefined") {
      user = new User({
        "email": "admin@admin.com",
        "password": "admin",
        "secret": "user secret ;)"
      })
      user = await user.save();
    }
    console.log("--------------------------------")
    console.log("Admin User Details (password is probably `admin`)")
    console.log("--------------------------------")
    console.log(user.toJSON());

    console.log("--------------------------------")
    console.log("--------------------------------")
  }

  async createOauthClientsIfNeeded() {
    let client = await OAuthClient.findOne()
    if (typeof client == "undefined") {
      client = new OAuthClient({name: "starter client"});
      client = await client.save();
    }
    console.log("--------------------------------")
    console.log("Oauth Client Details")
    console.log("--------------------------------")
    console.log(client.toJSON());

    console.log("--------------------------------")
    console.log("--------------------------------")
  }

  


}