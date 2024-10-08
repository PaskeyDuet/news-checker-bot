import { MongoClient } from "mongodb";

export default class MongoMethods {
     constructor(url, dbName, password, username) {
          this.url = url;
          this.dbName = dbName;
          this.username = username;
          this.password = password;
          this.client = new MongoClient(url);
     }

     async connect() {
          const auth = {
               user: this.username,
               password: this.password
          }
          await this.client.connect(auth);
          console.log('Connected to MongoDB');
          this.db = this.client.db(this.dbName);
     }

     async close() {
          await this.client.close();
          // console.log('Connection to MongoDB closed');
     }

     async insertOne(collectionName, document) {
          await this.connect()
          const collection = this.db.collection(collectionName);
          const result = await collection.insertOne(document);
          return result;
     }

     async findOne(collectionName, query) {
          await this.connect()
          const collection = this.db.collection(collectionName);
          const result = await collection.findOne(query);
          return result;
     }

     async findLastDoc(collectionName) {
          await this.connect()
          const collection = this.db.collection(collectionName);
          const result = await collection.find().sort({ date: -1 }).limit(1).toArray()
          return result
     }

     async updateOne(collectionName, query, update) {
          await this.connect()
          const collection = this.db.collection(collectionName);
          const result = await this.updateOneRecord(collection, query, update)
          return result;
     }

     async updateOneRecord(collection, query, update) {
          await this.connect()
          const result = await collection.updateOne(query, update);
          return result;
     }
}