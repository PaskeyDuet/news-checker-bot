import { backButton, backMainMenu } from "#bot/keyboards/generalKeyboard.js";
import { createLangChoose, keywordChangeBack, newApiKeyKeyboard, prefChangeAgain, prefChangeFinish } from "#bot/keyboards/newsKeyboards.js";
import unlessActions from "./helpers/unlessActions.js";
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";
import { dbHelper } from "#bot/index.js";
import { regMedia } from "#bot/configs/mediaObjs.js";
import { InputMediaBuilder } from "grammy";
import validateApiKey from "./helpers/validateApiKey.js";
import apiKeyGetter from "./helpers/apiKeyGetter.js";
import langChoosing from "./helpers/langChoosing.js";

export async function newsPrefsChange(conversation, ctx) {
     const prefChangeNum = ctx.session.temp.prefChangeNum
     const userId = ctx.session.user._id
     const userIsNewbie = ctx.session.user.isNewbie

     await ctx.editMessageText('Введите название темы, новости по которой вы бы хотели получить', {
          reply_markup: backButton
     })

     const keywordMessage = await conversation.waitFor(':text', {
          otherwise: (ctx) =>
               unlessActions(ctx, () => {
                    ctx.reply("Введите текст", {
                         reply_markup: keywordChangeBack,
                    });
               }),
     })
     let { message: { text: newKeyword } } = keywordMessage
     newKeyword = newKeyword.trim()

     const articlesLang = await langChoosing(conversation, ctx)

     if (userIsNewbie) {
          await apiKeyGetter(conversation, ctx)
     }
     const userApiKey = conversation.session.user.news.newsapiOrgKey

     const dbTopic = await dbHelper.findTopic(newKeyword)
     if (!dbTopic) {
          const res = await newsProcessing(ctx, userApiKey, prefChangeNum, false, newKeyword, articlesLang)
          if (res.error === 'Empty articles arr') {
               await ctx.reply("К сожалению, по данной теме не было найдено ни одной статьи, попробуйте ввести другое слово", {
                    reply_markup: prefChangeAgain(ctx)
               })
               return
          } else if (res.status !== "ok") {
               await ctx.reply("Произошла ошибка.\nЗайдите позже")
               await sendStartMessage(ctx)
               return
          }

          await dbHelper.createKeywordNews(newKeyword, res.articles, articlesLang)

          conversation.session.user.news[prefChangeNum - 1].keyword = newKeyword
          conversation.session.user.news[prefChangeNum - 1].lang = articlesLang
          conversation.session.user.news[prefChangeNum - 1].articles = res.articles
          conversation.session.temp.prefChangeNum = null

          let changeFinishText = 'Тема добавлена\n'
          if (res.articles.length === 1) {
               changeFinishText += `We found: 1 article`
          } else {
               changeFinishText += `We found: ${res.articles.length} articles`
          }

          await ctx.reply(changeFinishText, {
               reply_markup: prefChangeFinish(ctx, prefChangeNum)
          })
          await dbHelper.updateKeyword(userId, prefChangeNum, newKeyword)
          return
     } else if (dbTopic) {
          const currDate = new Date().getTime()
          const dayMilliseconds = 1000 * 61 * 60 * 24

          const _id = dbTopic._id;
          const dbTopicsLength = dbTopic.allArticles.length
          const lastArticles = dbTopic.allArticles[dbTopicsLength - 1]
          const lastArticleDate = dbTopic.allArticles[dbTopicsLength - 1].date

          const difference = currDate - lastArticleDate

          if (difference > dayMilliseconds) {
               const res = await newsProcessing(ctx, userApiKey, prefChangeNum, false, newKeyword, articlesLang)
               if (res.error === 'Empty articles arr') {
                    await ctx.reply("К сожалению, по данной теме не было найдено ни одной статьи, попробуйте ввести другое слово", {
                         reply_markup: prefChangeAgain(ctx)
                    })
                    return
               } else if (res.status !== "ok") {
                    await ctx.reply("Произошла ошибка.\nЗайдите позже")
                    await sendStartMessage(ctx)
                    return
               }

               conversation.session.user.news[prefChangeNum - 1].keyword = newKeyword
               conversation.session.user.news[prefChangeNum - 1].articles = res.articles
               conversation.session.temp.prefChangeNum = null

               let changeFinishText = 'Тема добавлена\n'
               if (res.articles.length === 1) {
                    changeFinishText += `We found: 1 article`
               } else {
                    changeFinishText += `We found: ${res.articles.length} articles`
               }

               await ctx.reply(changeFinishText, {
                    reply_markup: prefChangeFinish(ctx, prefChangeNum)
               })
               await dbHelper.pushKeywordNews(_id, res.articles)
               await dbHelper.updateKeyword(userId, prefChangeNum, newKeyword)
               return
          } else if (difference < dayMilliseconds) {
               conversation.session.user.news[prefChangeNum - 1].keyword = newKeyword
               conversation.session.user.news[prefChangeNum - 1].articles = lastArticles.articles

               let changeFinishText = 'Тема добавлена\n'
               if (lastArticles.articles.length === 1) {
                    changeFinishText += `We found: 1 article`
               } else {
                    changeFinishText += `We found: ${lastArticles.articles.length} articles`
               }
               await ctx.reply(changeFinishText, {
                    reply_markup: prefChangeFinish(ctx, prefChangeNum)
               })
               await dbHelper.updateKeyword(userId, prefChangeNum, newKeyword)
               return
          } else {
               await ctx.reply("Произошла ошибка.\nЗайдите позже")
               await sendStartMessage(ctx)
               return
          }
     }
}