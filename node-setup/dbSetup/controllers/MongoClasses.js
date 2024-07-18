import { MongoClient } from "mongodb";

class MongoMethods {
     constructor(url, dbName) {
          this.url = url;
          this.dbName = dbName;
          this.client = new MongoClient(url);
     }

     async connect() {
          await this.client.connect();
          // console.log('Connected to MongoDB');
          this.db = this.client.db(this.dbName);
     }

     async insertOne(collectionName, document) {
          const collection = this.db.collection(collectionName);
          const result = await collection.insertOne(document);
          return result;
     }

     async findOne(collectionName, query) {
          const collection = this.db.collection(collectionName);
          const result = await collection.findOne(query);
          return result;
     }

     async updateOne(collectionName, query, update) {
          const collection = this.db.collection(collectionName);
          const result = await this.updateOneRecord(collection, query, update)
          return result;
     }

     async updateOneRecord(collection, query, update) {
          const result = await collection.updateOne(query, update);
          return result;
     }

     async close() {
          await this.client.close();
          // console.log('Connection to MongoDB closed');
     }
}

export class mongoHelper extends MongoMethods {
     constructor(url, dbName) {
          super(url, dbName);
     }

     async insertUser(document) {
          try {
               await this.connect();

               const usersCollection = "users";
               const insertOneRes = await this.insertOne(usersCollection, document);
               // console.log(insertOneRes);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async findUser(_id) {
          try {
               await this.connect();
               const usersCollection = "users";
               const foundUser = await this.findOne(usersCollection, { _id: _id });
               return foundUser
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async updateKeyword(id, prefNum, newKeyword) {
          try {
               await this.connect();
               const usersCollection = "users";
               const query = { _id: id }
               const dbPrefNum = prefNum - 1

               const update = { $set: { ['news.' + dbPrefNum + '.keyword']: newKeyword } }

               const insertOneRes = await this.updateOne(usersCollection, query, update);
               // console.log(insertOneRes);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }
}
