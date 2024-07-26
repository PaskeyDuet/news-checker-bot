import MongoMethods from "./MongoMethods.js";

export default class MongoHelper extends MongoMethods {
     constructor(url, dbName) {
          super(url, dbName)
          this.usersCollection = process.env.MONGO_DB_USERS_COLLECTION;
          this.trendingCollection = process.env.MONGO_DB_TRENDING_NEWS_COLLECTION
          this.allNewsCollection = process.env.MONGO_DB_ALL_NEWS_COLLECTION
     }
     async insertUser(document) {
          try {
               await this.connect();

               const insertOneRes = await this.insertOne(this.usersCollection, document);
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
               const foundUser = await this.findOne(this.usersCollection, { _id: _id });
               return foundUser
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async findTopic(keyword) {
          try {
               await this.connect();
               const foundTopic = await this.findOne(this.allNewsCollection, { keyword: keyword });
               return foundTopic
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async updateKeyword(id, prefNum, newKeyword) {
          try {
               await this.connect();
               const query = { _id: id }
               const dbPrefNum = prefNum - 1

               const update = { $set: { ['news.' + dbPrefNum + '.keyword']: newKeyword } }

               const insertOneRes = await this.updateOne(this.usersCollection, query, update);
               // console.log(insertOneRes);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async updateNewsKey(id, key) {
          try {
               await this.connect();
               const query = { _id: id }
               const update = { $set: { newsapiOrgKey: key, isNewbie: false } }

               const insertOneRes = await this.updateOne(this.usersCollection, query, update);
               // console.log(insertOneRes);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async createKeywordNews(keyword, articlesArr) {
          try {
               await this.connect();
               const currDate = new Date().getTime()
               const document = {
                    keyword: keyword,
                    allArticles: [{
                         date: currDate,
                         articles: articlesArr
                    }]
               }
               const createOneRes = await this.insertOne(this.allNewsCollection, document);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async pushKeywordNews(_id, articlesArr) {
          try {
               await this.connect();
               const currDate = new Date().getTime()
               const document = {
                    date: currDate,
                    articles: articlesArr
               }
               const pushOneRes = await this.updateOne(this.allNewsCollection, { _id: _id }, { $push: { allArticles: document } });
               console.log("pushKeywordNews Res", pushOneRes);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async pushDailyTrends(categoriesArr) {
          try {
               await this.connect();
               const currDate = new Date().getTime()
               const document = {
                    date: currDate,
                    categories: categoriesArr
               }
               const insertOneRes = await this.insertOne(this.trendingCollection, document);
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async getLastDailyTrends() {
          try {
               await this.connect();
               const lastDocument = await this.findLastDoc(this.trendingCollection)
               return lastDocument[0]
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }
}