import { backButton } from "#bot/keyboards/generalKeyboard.js";
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { dbHelper } from "#bot/index.js";
import { langChoosing, processNewArticles, prefUpdateFinish, topicFromMsg, apiKeyGetter } from "./helpers/prefChangeHelpers.js";
import ctxDecode from "#bot/helpers/news-managment/ctxDecode.js";

export async function newsPrefsChange(conversation, ctx) {
     const inf = ctxDecode(ctx).metaReturn()
     let newArticles

     await ctx.editMessageText('Введите название темы, новости по которой вы бы хотели получить', {
          reply_markup: backButton
     })

     const newKeyword = await topicFromMsg(conversation)
     const articlesLang = await langChoosing(conversation, ctx)
     console.log("INF", inf);

     if (inf.isNewbie) {
          console.log('newbie');
          await apiKeyGetter(conversation, ctx)
     }
     const userApiKey = conversation.session.user.news.newsapiOrgKey

     const dbTopic = await dbHelper.findTopic(newKeyword, articlesLang)

     if (!dbTopic) {
          const { articles: newArticles } = await processNewArticles(ctx, userApiKey, newKeyword, articlesLang)
          const dbRes = await dbHelper.createKeywordNews(newKeyword, newArticles, articlesLang)
          const _id = dbRes.insertedId
          await prefUpdateFinish(conversation, ctx, inf.temp.change, newArticles, _id, newKeyword, articlesLang)
          await dbHelper.updatePrefData(inf.userId, inf.temp.change, newKeyword, articlesLang, _id)
          return
     } else if (dbTopic) {
          const currDate = new Date().getTime()
          const dayMilliseconds = 1000 * 60 * 60 * 24

          const _id = dbTopic._id;
          const dbTopicsLength = dbTopic.allArticles.length
          const lastArticles = dbTopic.allArticles[dbTopicsLength - 1]
          const lastArticleDate = dbTopic.allArticles[dbTopicsLength - 1].date

          const difference = currDate - lastArticleDate
          if (difference > dayMilliseconds) {
               const { articles: newArticles } = await processNewArticles(ctx, userApiKey, newKeyword, articlesLang)
               await prefUpdateFinish(conversation, ctx, inf.temp.change, newArticles, _id, newKeyword, articlesLang)
               await dbHelper.pushKeywordNews(_id, newArticles)
               await dbHelper.updatePrefData(inf.userId, inf.temp.change, newKeyword, articlesLang, _id)
               return
          } else if (difference < dayMilliseconds) {
               newArticles = lastArticles.articles
               await prefUpdateFinish(conversation, ctx, inf.temp.change, newArticles, _id, newKeyword, articlesLang)
               await dbHelper.updatePrefData(inf.userId, inf.temp.change, newKeyword, articlesLang, _id)
               return
          } else {
               await ctx.reply("Произошла ошибка.\nЗайдите позже")
               await sendStartMessage(ctx)
               return
          }
     }
}