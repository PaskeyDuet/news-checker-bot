import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { newsSliderKeyboard } from "#bot/keyboards/newsKeyboards.js";

function articleCompiler(ctx, prefCheckNum, articleNumber) {
     const articlesSessionLink = ctx.session.user.news[prefCheckNum - 1].articles
     const textObj = articlesSessionLink[articleNumber]
     let articleText = ''
     console.log(textObj);
     articleText += `<b>Title:</b>${textObj.title.original}\n`
     articleText += `<b>Source:</b>${textObj.source}\n`
     articleText += `<b>Author:</b> ${textObj.author}\n\n`
     articleText += `<b>Description:</b> ${textObj.description.original}\n\n`
     articleText += `<a href="${textObj.link}">Read more</a>`


     return articleText
}

export async function newsCheck(conversation, ctx) {
     const prefCheckNum = ctx.session.temp.prefCheckNum
     const callbackObj = ctx.update.callback_query
     const chatId = callbackObj.message.chat.id;
     const sessionedArticles = ctx.session.user.news[prefCheckNum - 1].articles

     let messageText = articleCompiler(ctx, prefCheckNum, 0)
     let newsCounter = 0
     let newsLimit = Number(process.env.NEWS_QUANTITY) - 1
     if (newsLimit > sessionedArticles.length) {
          newsLimit = sessionedArticles.length - 1
     }

     let articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
          parse_mode: "HTML",
          reply_markup: newsSliderKeyboard(newsLimit)
     })
     console.log("LIMIT", newsLimit);

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
          messageText = articleCompiler(ctx, prefCheckNum, newsCounter)
          try {
               articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                    {
                         parse_mode: "HTML",
                         reply_markup: newsSliderKeyboard(newsLimit)
                    })
               await ctx.answerCallbackQuery();
          } catch (error) {
               if (!error.message.includes("query is too old")) {
                    await sendStartMessage(ctx)
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
               } else { break }
          }
     }
     while (responseData === "previous_article" || responseData === "next_article")

     ctx.session.temp.prefCheckNum = null
     //TODO: Если последний текст от бота - изменять текст, если от человека - присылать стартмесседж
     await sendStartMessage(ctx)
     return
}