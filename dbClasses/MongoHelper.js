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

     async findTopic(keyword, topicLang) {
          try {
               await this.connect();
               const foundTopic = await this.findOne(this.allNewsCollection, { keyword: keyword, lang: topicLang });
               return foundTopic
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async updatePrefData(id, prefNum, newKeyword, lang, articleId) {
          try {
               await this.connect();
               const query = { _id: id }
               const dbPrefNum = prefNum

               const update = {
                    $set: {
                         ['news.' + dbPrefNum + '.lang']: lang,
                         ['news.' + dbPrefNum + '.keyword']: newKeyword,
                         ['news.' + dbPrefNum + '._id']: articleId
                    }
               }

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

     async createKeywordNews(keyword, articlesArr, lang) {
          try {
               await this.connect();
               const currDate = new Date().getTime()
               const document = {
                    keyword: keyword,
                    lang: lang,
                    allArticles: [{
                         date: currDate,
                         articles: articlesArr
                    }]
               }
               const createOneRes = await this.insertOne(this.allNewsCollection, document);
               return createOneRes
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async pushKeywordNews(_id, articlesArr, lang) {
          try {
               await this.connect();
               const currDate = new Date().getTime()
               const document = {
                    date: currDate,
                    articles: articlesArr
               }
               const pushOneRes = await this.updateOne(this.allNewsCollection, { _id: _id }, { $push: { allArticles: document } });
               // console.log("pushKeywordNews Res", pushOneRes);
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
                    allArticles: categoriesArr
               }
               const insertOneRes = await this.insertOne(this.trendingCollection, document);
               return insertOneRes
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async articlesUpdate(id, articlesArr, { trending }) {
          try {
               await this.connect();
               const query = { _id: id }

               if (trending) {
                    const update = { $set: { [`allArticles`]: articlesArr } }
                    const updateOneRes = await this.updateOne(this.trendingCollection, query, update);
                    // console.log(updateOneRes);
               } else {
                    const document = await this.findOne(this.allNewsCollection, query)
                    const lastIndex = document.allArticles.length - 1
                    const update = { $set: { [`allArticles.${lastIndex}.articles`]: articlesArr } }
                    const updateOneRes = await this.updateOne(this.allNewsCollection, query, update);
                    // console.log('articlesUpdate db info', updateOneRes);
               }
          } catch (e) {
               console.error(e);
          } finally {
               await this.close();
          }
     }

     async trendArticlesUpdate(id, articlesArr) {
          try {
               await this.connect();
               const query = { _id: id }
               const update = { $set: { categories: articlesArr } }
               const updateOneRes = await this.updateOne(this.trendingCollection, query, update);
               // console.log(updateOneRes);
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