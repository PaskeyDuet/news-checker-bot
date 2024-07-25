import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { trendsArticleCompiler } from "#bot/helpers/news-managment/newsHelpers.js";
import { newsSliderKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { sendNTranslate } from "#bot/server-routing/pyWebRouting.js";

export async function trendingCheck(conversation, ctx) {
     const callbackObj = ctx.update.callback_query
     const chatId = callbackObj.message.chat.id;
     const sessionedCats = conversation.session.user.news[2].articles
     let messageTranslated = false
     let catCounter = 0
     const catLimit = sessionedCats.length - 1
     let messageText = trendsArticleCompiler(conversation, catCounter, false)

     let articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
          parse_mode: "HTML",
          link_preview_options: { is_disabled: true },
          reply_markup: newsSliderKeyboard(catLimit, messageTranslated)
     })

     async function scrollDirectionHandler(direction) {
          if (direction === "previous_article") {
               catCounter -= 1
               if (catCounter < 0) {
                    catCounter = catLimit
               }
          } else {
               catCounter += 1
               if (catCounter > catLimit) {
                    catCounter = 0
               }
          }
          messageText = trendsArticleCompiler(conversation, catCounter, false)
          try {
               messageTranslated = false
               articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                    {
                         parse_mode: "HTML",
                         link_preview_options: { is_disabled: true },
                         reply_markup: newsSliderKeyboard(catLimit, messageTranslated)
                    })
               await ctx.answerCallbackQuery();
          } catch (error) {
               // console.log("scrollDirectionHandler ERROR\n", error.message);
               if (!error.message.includes("query is too old")) {
                    await sendStartMessage(ctx)
                    return
               }
          }
     }
     async function translateArticle(ctx, catCounter) {
          const catsSessionLink = conversation.session.user.news[2].articles
          const catObjs = catsSessionLink[catCounter].articles

          if (messageTranslated) {
               messageText = trendsArticleCompiler(conversation, catCounter, false)
               messageTranslated = false
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              link_preview_options: { is_disabled: true },
                              reply_markup: newsSliderKeyboard(catLimit, messageTranslated)
                         })
                    await ctx.answerCallbackQuery();
               } catch (error) {
                    // console.log("ERROR\n", error.message);
                    if (!error.message.includes("query is too old")) {
                         await sendStartMessage(ctx)
                         return
                    }
               }
               return
          } else if (!messageTranslated) {
               const firstTitle = catObjs[0].title
               if (!firstTitle.translated) {
                    const dataForTranslate = {
                         trends: true,
                         objs: []
                    }
                    dataForTranslate.trends = true
                    for (let i = 0; i < 5; i++) {
                         const obj = {}
                         obj[i] = catObjs[i].title
                         dataForTranslate.objs.push(obj)
                    }
                    const translatedRes = await sendNTranslate(dataForTranslate)
                    for (let i = 0; i < translatedRes.objs.length; i++) {
                         conversation.session.user.news[2].articles[catCounter].articles[i].title.translated = translatedRes.objs[i][`${i}`].translated
                    }
                    await translateArticle(ctx, catCounter)
                    return
               } else if (firstTitle.translated) {
                    messageTranslated = true
                    messageText = trendsArticleCompiler(conversation, catCounter, true)
                    try {
                         articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                              {
                                   parse_mode: "HTML",
                                   link_preview_options: { is_disabled: true },
                                   reply_markup: newsSliderKeyboard(catLimit, messageTranslated)
                              })
                         await ctx.answerCallbackQuery();
                    } catch (error) {
                         console.log("ERROR\n", error.message);
                         if (!error.message.includes("query is too old")) {
                              await sendStartMessage(ctx)
                              return
                         }
                    }
                    return
               }

          }
     }

     let response
     let responseData
     let i = 0
     do {
          response = await conversation.wait()
          if (response.update?.callback_query?.data) {
               responseData = response.update.callback_query.data
               console.log("\nresponse data=========\n", `${i}\n`, responseData);
               i++
               if (responseData === "previous_article" || responseData === "next_article") {
                    await scrollDirectionHandler(responseData)
               } else if (responseData === "news_translate") {
                    await translateArticle(ctx, catCounter)
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