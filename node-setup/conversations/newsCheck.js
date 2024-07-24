import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { keywordArticleCompiler } from "#bot/helpers/news-managment/newsHelpers.js";
import { newsSliderKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { sendNTranslate } from "#bot/server-routing/pyWebRouting.js";

export async function newsCheck(conversation, ctx) {
     const prefCheckNum = ctx.session.temp.prefCheckNum
     const callbackObj = ctx.update.callback_query
     const chatId = callbackObj.message.chat.id;
     const sessionedArticles = conversation.session.user.news[prefCheckNum - 1].articles

     let messageText = keywordArticleCompiler(conversation, prefCheckNum, 0)
     let messageTranslated = false
     let newsCounter = 0
     let newsLimit = Number(process.env.NEWS_QUANTITY) - 1
     if (newsLimit > sessionedArticles.length) {
          newsLimit = sessionedArticles.length - 1
     }

     let articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
          parse_mode: "HTML",
          reply_markup: newsSliderKeyboard(newsLimit, messageTranslated)
     })

     async function scrollDirectionHandler(direction) {
          if (direction === "previous_article") {
               newsCounter -= 1
               if (newsCounter < 0) {
                    newsCounter = newsLimit
               }
          } else {
               newsCounter += 1
               if (newsCounter > newsLimit) {
                    newsCounter = 0
               }
          }
          messageText = keywordArticleCompiler(conversation, prefCheckNum, newsCounter)
          try {
               messageTranslated = false
               articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                    {
                         parse_mode: "HTML",
                         reply_markup: newsSliderKeyboard(newsLimit, messageTranslated)
                    })
               await ctx.answerCallbackQuery();
          } catch (error) {
               console.log("scrollDirectionHandler ERROR\n", error.message);
               if (!error.message.includes("query is too old")) {
                    await sendStartMessage(ctx)
                    return
               }
          }
     }
     async function translateArticle(ctx, prefCheckNum, articleNumber) {
          const articlesSessionLink = conversation.session.user.news[prefCheckNum - 1].articles
          const textObj = articlesSessionLink[articleNumber]

          if (messageTranslated) {
               conversation.session.user.news[prefCheckNum - 1].articles[articleNumber].translated = true
               messageText = keywordArticleCompiler(conversation, prefCheckNum, newsCounter)
               messageTranslated = false
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              reply_markup: newsSliderKeyboard(newsLimit, messageTranslated)
                         })
                    await ctx.answerCallbackQuery();
               } catch (error) {
                    console.log("ERROR\n", error.message);
                    if (!error.message.includes("query is too old")) {
                         await sendStartMessage(ctx)
                         return
                    }
               }
          } else if (!messageTranslated) {
               if (!textObj.title.translated) {
                    const dataForTranslate = {}
                    dataForTranslate.trends = false
                    dataForTranslate.title = textObj.title
                    dataForTranslate.description = textObj.description
                    dataForTranslate.content = textObj.content
                    const translatedRes = await sendNTranslate(dataForTranslate)

                    conversation.session.user.news[prefCheckNum - 1].articles[articleNumber].title.translated = translatedRes.title.translated
                    conversation.session.user.news[prefCheckNum - 1].articles[articleNumber].description.translated = translatedRes.description.translated
                    conversation.session.user.news[prefCheckNum - 1].articles[articleNumber].content.translated = translatedRes.content.translated
                    await translateArticle(ctx, prefCheckNum, articleNumber)
               } else if (textObj.title.translated) {
                    conversation.session.user.news[prefCheckNum - 1].articles[articleNumber].translated = true
                    messageTranslated = true
                    messageText = keywordArticleCompiler(conversation, prefCheckNum, newsCounter, true)
                    try {
                         articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                              {
                                   parse_mode: "HTML",
                                   reply_markup: newsSliderKeyboard(newsLimit, messageTranslated)
                              })
                         await ctx.answerCallbackQuery();
                    } catch (error) {
                         console.log("ERROR\n", error.message);
                         if (!error.message.includes("query is too old")) {
                              await sendStartMessage(ctx)
                              return
                         }
                    }
               }

          }
     }

     let response
     let responseData
     do {
          response = await conversation.wait()

          if (response.update?.callback_query?.data) {
               responseData = response.update.callback_query.data
               if (responseData === "previous_article" || responseData === "next_article") {
                    await scrollDirectionHandler(responseData)
               } else if (responseData === "news_translate") {
                    await translateArticle(ctx, prefCheckNum, newsCounter)
               }
               else { responseData = null }
          }
     }
     while (responseData === "previous_article" || responseData === "next_article" || responseData === "news_translate")

     ctx.session.temp.prefCheckNum = null
     //TODO: Если последний текст от бота - изменять текст, если от человека - присылать стартмесседж
     await sendStartMessage(ctx)
     return
}