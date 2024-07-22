import dateToday from "../dateToday.js";
import { reqHelper } from "./newsFetcherManager.js";
import { articlesLimiter, articlesObjsCreator, filteredNewsArray } from "./newsHelpers.js";

export default async function (ctx, prefNum = null, mode, newKeyword = null, lang = null, country = null) {
     const resObj = {
          status: "ok",
          error: null,
          articles: null
     }

     let fetchedNewsData
     if (mode === 'keyword') {
          console.log("FETCHING PROCCESSING");
          let currKeyword
          currKeyword = newKeyword || ctx.session.user.news[prefNum - 1].keyword
          fetchedNewsData = await reqHelper.newsCatcherByKeyword(currKeyword)
     } else if (mode === "top-news") {
          fetchedNewsData = await reqHelper.newsCatcherTopHeads(lang, country)
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

     const { articles: fetchedNewsArr } = fetchedNewsData

     const formattedNewsObjsArr = articlesObjsCreator(fetchedNewsArr)
     const limitedNewsArr = articlesLimiter(formattedNewsObjsArr)

     if (mode === 'keyword') {
          ctx.session.user.news[prefNum - 1].articles = limitedNewsArr
     } else if (mode === "top-news") {
          ctx.session.user.news[2].articles = limitedNewsArr
     }

     resObj.articles = limitedNewsArr

     // const dbNewsByKeyword = {
     //      keyword: currKeyword,
     //      articles: {
     //           date: dateToday(),
     //           eng: formattedNewsObjsArr
     //      }
     // }
     return resObj
}