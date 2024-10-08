import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { trendsArticleCompiler, updateDBTranslates } from "#bot/helpers/news-managment/newsHelpers.js";
import { newsSliderKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { sendNTranslate } from "#bot/server-routing/pyWebRouting.js";
import { dbHelper } from "#bot/index.js";
import unlessActions from "./helpers/unlessActions.js";

export async function trendingCheck(conversation, ctx) {
     const callbackObj = ctx.update.callback_query
     const chatId = callbackObj.message.chat.id;
     const sessionedCats = conversation.session.user.news[2].articles
     const catByNumber = (counter) => sessionedCats[counter]
     const langTemp = new Map()
     for (const cat of sessionedCats) {
          langTemp.set(cat.category, { translated: false })
     }
     let translationUpdate = false
     let catCounter = 0
     const catLimit = sessionedCats.length - 1
     let messageText = trendsArticleCompiler(conversation, catCounter, false)
     let articleMessage
     try {
          articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
               parse_mode: "HTML",
               link_preview_options: { is_disabled: true },
               reply_markup: newsSliderKeyboard(catLimit, 'en')
          })
     } catch (error) {
          if (!error.message.includes("query is too old")) {
               console.log("scrollDirectionHandler ERROR\n", error);
          }
     }

     let responseData
     do {
          const cbRegex = /^(previous_article|next_article|news_translate)$/
          const response = await conversation.waitForCallbackQuery(cbRegex, {
               otherwise: async (conversation) => {
                    //FIXME: for some reason translationUpdate not always true after translation fetch. Sure it can be binded with double sendNTranslate calling
                    if (translationUpdate) {
                         await updateDBTranslates(conversation, { trendingMode: true })
                    }
                    conversation.session.temp.prefCheckNum = null
                    unlessActions(conversation, null)
               }
          })
          responseData = response.match[0]
          if (responseData === "previous_article" || responseData === "next_article") {
               await scrollDirectionHandler(responseData)
          } else if (responseData === "news_translate") {
               await translateButtonHandler(ctx, conversation, catCounter).catch(err => console.log(err))
          }
     }
     while (responseData === "previous_article" || responseData === "next_article" || responseData === "news_translate")
     conversation.log('out og while')

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
          const catName = catByNumber(catCounter).category
          const isCatTranslated = langTemp.get(catName).translated
          messageText = trendsArticleCompiler(conversation, catCounter, isCatTranslated)
          try {
               articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                    {
                         parse_mode: "HTML",
                         link_preview_options: { is_disabled: true },
                         reply_markup: newsSliderKeyboard(catLimit, 'en')
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

     async function translateButtonHandler(ctx, conversation, catCounter) {
          const currSessionLink = conversation.session.user.news[2].articles[catCounter]
          const catName = currSessionLink.category
          const catArticles = currSessionLink.articles
          const firstCatTitle = catArticles[0].title
          const langData = langTemp.get(catName)
          const isCatTranslated = langData.translated
          let messageText

          if (isCatTranslated) {
               messageText = trendsArticleCompiler(conversation, catCounter, false)

               langData.translated = false
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              link_preview_options: { is_disabled: true },
                              reply_markup: newsSliderKeyboard(catArticles.length, 'en')
                         })
                    await ctx.answerCallbackQuery();
               } catch (error) {
                    conversation.log("ERROR\n", error.message);
                    if (!error.message.includes("query is too old")) {
                         await sendStartMessage(ctx)
                         return
                    }
               }
          } else if (!isCatTranslated) {
               if (!firstCatTitle.translated) {
                    const dataForTranslate = {
                         trends: true,
                         objs: []
                    }
                    //5 is limiter?
                    for (let i = 0; i < 5; i++) {
                         const obj = {}
                         obj[i] = catArticles[i].title
                         dataForTranslate.objs.push(obj)
                    }
                    try {
                         const translatedRes = await sendNTranslate(dataForTranslate)
                         // const translatedRes = await conversation.external(() => sendNTranslate(dataForTranslate))
                         for (let i = 0; i < translatedRes.objs.length; i++) {
                              conversation.session.user.news[2].articles[catCounter].articles[i].title.translated = translatedRes.objs[i][`${i}`].translated
                         }
                         translationUpdate = true
                    } catch (error) {
                         conversation.log(error)
                    }

               }
               langData.translated = true
               messageText = trendsArticleCompiler(conversation, catCounter, true)
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              link_preview_options: { is_disabled: true },
                              reply_markup: newsSliderKeyboard(catLimit, 'en')
                         })
                    await ctx.answerCallbackQuery();
               } catch (error) {
                    conversation.log("ERROR\n", error.message);
                    if (!error.message.includes("query is too old")) {
                         await sendStartMessage(ctx)
                    }
               }
          }
          return
     }
     //TODO: Если последний текст от бота - изменять текст, если от человека - присылать стартмесседж
     return
}