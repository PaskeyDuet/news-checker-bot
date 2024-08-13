import { reqHelper } from "#bot/index.js";
import { articlesLimiter, articlesObjsCreator } from "./newsHelpers.js";

export default async function (ctx, { apiKey, prefNum = null, trendingMode = false, newKeyword = null, lang = null, country = null }) {
     const resObj = {
          status: "ok",
          error: null,
          articles: null
     }

     let fetchedNewsData
     if (!trendingMode) {
          console.log("FETCHING PROCCESSING");
          let currKeyword = newKeyword || ctx.session.user.news[prefNum].keyword
          fetchedNewsData = await reqHelper.newsCatcherByKeyword(apiKey, currKeyword, lang)
     } else if (trendingMode) {
          fetchedNewsData = await reqHelper.newsCatcherTopHeads(lang, country)
          console.log("FETCHEDNEWSDATACHECK\n", fetchedNewsData);
     }

     if (fetchedNewsData.status !== "ok") {
          resObj.status = "error",
               resObj.error = `An error in newsRequster: ${fetchedNewsData.error}`
          return resObj
     }
     else if (fetchedNewsData.error === "Empty articles arr" || fetchedNewsData.articles.length === 0) {
          resObj.error = "Empty articles arr"
          return resObj
     }

     const { articles: fetchedNewsArticles } = fetchedNewsData
     const formattedNewsObjsArr = articlesObjsCreator(fetchedNewsArticles, lang, trendingMode)
     const limitedNewsArr = articlesLimiter(formattedNewsObjsArr)//off

     resObj.articles = limitedNewsArr

     console.log("NEWSPROCESSING END", resObj.articles.length);
     return resObj
}