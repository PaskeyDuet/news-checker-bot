import { MongoClient } from "mongodb";

export default class MongoMethods {
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

     async findLastDoc(collectionName) {
          const collection = this.db.collection(collectionName);
          const result = await collection.find().sort({ date: -1 }).limit(1).toArray()
          return result
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