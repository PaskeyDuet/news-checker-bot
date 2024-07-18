import dateToday from "../dateToday.js";
import newsFetcher from "./newsFetcher.js";
import { articlesLimiter, articlesObjsCreator } from "./newsHelpers.js";

export default async function (ctx, prefNum, newKeyword = null, conversation = null) {
     const resObj = {
          status: "ok",
          error: null,
     }

     let currKeyword
     currKeyword = newKeyword || ctx.session.user.news[prefNum - 1].keyword

     //add try-catchers

     const fetchedNewsData = await newsFetcher(currKeyword)

     if (fetchedNewsData.status !== "ok") {
          resObj.status = "error",
               resObj.error = `An error in newsRequster: ${fetchedNewsData.error}`
          return resObj
     }
     else if (fetchedNewsData.error === "Empty articles arr") {
          resObj.error = "Empty articles arr"
          return resObj
     }

     const { articles: { eng: fetchedEngNewsArr } } = fetchedNewsData

     const formattedNewsObjsArr = articlesObjsCreator(fetchedEngNewsArr)
     const limitedNewsArr = articlesLimiter(formattedNewsObjsArr)


     ctx.session.user.news[prefNum - 1].articles = limitedNewsArr
     if (conversation) {
          conversation.session.user.news[prefNum - 1].articles = limitedNewsArr
     }

     const dbNewsByKeyword = {
          keyword: currKeyword,
          articles: {
               date: dateToday(),
               eng: formattedNewsObjsArr
          }
     }
     return resObj
}