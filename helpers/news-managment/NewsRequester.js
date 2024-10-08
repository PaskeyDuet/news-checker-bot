import NewsAPI from "newsapi";
import { fetchPageLimitator, filteredNewsArray } from "./newsHelpers.js";

export class NewsRequster {
     constructor(apiKeys) {
          this.apiKeys = apiKeys;
          this.keysIndex = 0;
          this.currPageNumber = 1;
          this.pagesLimit = 1;
     }

     async testReq(apiKey) {
          const newsApi = new NewsAPI(apiKey)
          let res
          await newsApi.v2.everything({
               q: `USA`,
               language: 'en',
          }).then(response => {
               res = response;
          })
          return res
     }

     async reqByKeyword(apiKey, keyword, lang) {
          const newsApi = new NewsAPI(apiKey)
          let res
          await newsApi.v2.everything({
               q: `${keyword}`,
               language: lang,
               page: this.currPageNumber
          }).then(response => {
               res = response;
          })
          return res
     }

     async newsCatcherByKeyword(apiKey, keyword, lang = "en", country = 'us') {
          const resObj = {
               status: "ok",
               error: null,
               articles: []
          }
          do {
               let res
               try {
                    res = await this.reqByKeyword(apiKey, keyword, lang, this.keysIndex)

                    const { status, totalResults, articles: receivedNews } = res
                    if (status !== "ok") {
                         //TODO: Какие бывают ошибки на этом этапе? Классифицировать
                         resObj.status = "error"
                         resObj.status = "weird answer from server"
                         return resObj
                    } else if (receivedNews.length === 0) {
                         resObj.error = "Empty articles arr"
                         return resObj
                    }
                    this.pagesLimit = fetchPageLimitator(totalResults)
                    // this.currPageNumber += 1
                    resObj.articles = []
                    resObj.articles = filteredNewsArray(receivedNews, lang, keyword)
               } catch (error) {
                    console.log(error.message);
                    //TODO: Классифицировать проблему с API key
                    if (error.message.match(/too many results/) || error.message.match(/too many requests/)) {
                         this.keysIndex++
                         const res = await this.newsCatcherByKeyword(keyword)
                         return res
                    } else if (error.message.match(/socket hang up/)) {
                         console.log("newsCatcherByKeyword: ", error.message);
                         const res = await this.newsCatcherTopHeads(lang, country)
                         return res
                    }
                    resObj.status = "error",
                         resObj.error = error.message
                    return resObj
               }
          } while (this.currPageNumber !== this.pagesLimit);
          return resObj
     }

     async reqTopHeads(country, category, keyIndex) {
          console.log(category);
          const newsApi = new NewsAPI(this.apiKeys[keyIndex])
          let res
          await newsApi.v2.topHeadlines({
               category: category,
               country: country
          }).then(response => {
               res = response;
          })
          return res
     }

     async newsCatcherTopHeads(lang = 'en', country = 'us') {
          const resObj = {
               status: "ok",
               error: null,
               articles: []
          }
          const categoriesArr = ['business', 'general', 'health', 'science', 'sports', 'technology']
          try {
               const categorizedRes = {}
               const promises = categoriesArr.map(async (cat) => {
                    try {
                         const response = await this.reqTopHeads(country, cat, this.keysIndex)
                         if (response.status === 'ok') {
                              categorizedRes[cat] = response
                         } else {
                              throw Error("Error requesting top heads, fix it")
                         }
                    } catch (error) {
                         console.log(error);
                    }
               })
               await Promise.all(promises)
               for (const cat in categorizedRes) {
                    const categoryObjs = {}
                    categoryObjs.category = cat
                    categoryObjs.articles = filteredNewsArray(categorizedRes[cat].articles, lang, null, true)
                    resObj.articles.push(categoryObjs)
               }
          } catch (error) {
               //TODO: Классифицировать проблему с API key
               if (error.message.match(/too many results/) || error.message.match(/too many requests/)) {
                    console.log("WE ARE IN ENDLESS KEY SEARCHING??");
                    this.keysIndex++
                    const res = await this.newsCatcherTopHeads(lang, country)
                    return res
               } else if (error.message.match(/socket hang up/)) {
                    console.log("newsCatcherTopHeads: ", error.message);
                    const res = await this.newsCatcherTopHeads(lang, country)
                    return res
               }
               resObj.status = "error",
                    resObj.error = error.message
               return resObj
          }

          console.log("TOPHEADS L", resObj.articles.length);
          return resObj
     }
}