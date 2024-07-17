import { newsArrayRequester } from "#bot/helpers/news-managment/news.js"
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import dateToday from "../dateToday.js";
import { sendNTranslate } from "../../server-routing/webServer.js";

export async function formNPush(ctx, prefNum, articlesArr) {
     let articleObjectsArr = []
     for (let i = 0; i < articlesArr.length; i++) {
          //Сделать разделение на поступающие русские и английские
          console.log('creating');
          let newsObj = {}

          newsObj.lang = 'eng'
          newsObj.title = {
               original: `${articlesArr[i].title}`,
               translated: null
          }
          newsObj.source = `${articlesArr[i].source.name}`
          newsObj.author = `${articlesArr[i].author}`
          newsObj.description = {
               original: `${articlesArr[i].description}`,
               translated: null
          }
          newsObj.link = `${articlesArr[i].url}`

          articleObjectsArr.push(newsObj)
     }
     ctx.session.user.news[prefNum - 1].articles = articleObjectsArr
     return articleObjectsArr
}

export async function requestNPush(ctx, prefNum) {
     const resObj = {
          status: "ok",
          error: null,
     }

     let currKeyword
     currKeyword = ctx.session.user.news[prefNum - 1].keyword

     const res = await newsArrayRequester(currKeyword)
     if (res.status !== "ok") {
          resObj.status = "error",
               resObj.error = `An error in newsRequster: ${res.error}`
          await ctx.reply("Зайдите позже")
          await sendStartMessage(ctx)
          throw new Error(resObj.error)
     } else if (res.error === "Empty articles arr") {
          resObj.error = "Empty articles arr"
          return resObj
     }
     //Сделать разделение на поступающие русские и английские
     const { articles: { eng: newsArray } } = res

     const articleObjectsArr = await formNPush(ctx, prefNum, newsArray)

     const dbNewsByKeyword = {
          keyword: currKeyword,
          articles: {
               date: dateToday(),
               eng: articleObjectsArr
          }
     }
     try {
          await sendNTranslate(dbNewsByKeyword)
          console.log("=============DONE=============");
     } catch (err) {
          console.log(err);
     }
}
