import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import { currTempLang, keywordArticleCompiler, oppositeLang, updateDBTranslates } from "#bot/helpers/news-managment/newsHelpers.js";
import { newsSliderKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { sendNTranslate } from "#bot/server-routing/pyWebRouting.js";
import sessionUpdate from "./helpers/sessionUpdate.js";
import unlessActions from "./helpers/unlessActions.js";

export async function newsCheck(conversation, ctx) {
     const prefCheckNum = ctx.session.temp.prefCheckNum
     const callbackObj = ctx.update.callback_query
     const chatId = callbackObj.message.chat.id;
     const sessionLink = conversation.session.user.news[prefCheckNum]
     const articlesLang = sessionLink.lang
     const sessionedArticles = sessionLink.articles
     const langTemp = new Map()
     for (const articleNum of sessionedArticles.keys()) {
          langTemp.set(articleNum, { translated: false, lang: articlesLang })
     }
     const currLang = (counter) => currTempLang(langTemp, counter)
     let translationUpdate = false
     let newsCounter = 0
     let newsLimit = sessionedArticles.length - 1


     let messageText = keywordArticleCompiler(ctx, conversation, prefCheckNum, newsCounter, false)
     let articleMessage
     try {
          articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
               parse_mode: "HTML",
               reply_markup: newsSliderKeyboard(newsLimit, currLang(newsCounter))
          })
     } catch (error) {
          if (!error.message.includes("query is too old")) {
               console.log("scrollDirectionHandler ERROR\n", error);
               if (error.message.includes("tag")) {
                    //FIXME
                    newsCounter += 1
                    messageText = keywordArticleCompiler(ctx, conversation, prefCheckNum, newsCounter, false)
                    articleMessage = await ctx.api.editMessageText(chatId, callbackObj.message.message_id, messageText, {
                         parse_mode: "HTML",
                         reply_markup: newsSliderKeyboard(newsLimit, currLang(newsCounter))
                    })
               }
          }
     }

     let responseData
     do {
          const cbRegex = /^(previous_article|next_article|news_translate)$/
          const response = await conversation.waitForCallbackQuery(cbRegex, {
               otherwise: async (conversation) => {
                    //FIXME: for some reason translationUpdate not always true after translation fetch. Sure it can be binded with double sendNTranslate calling
                    if (translationUpdate) {
                         await updateDBTranslates(conversation, { trendingMode: false, prefNum: prefCheckNum })
                    }
                    conversation.session.temp.prefCheckNum = null
                    unlessActions(conversation, null)
               }
          })
          responseData = response.match[0]
          if (responseData === "previous_article" || responseData === "next_article") {
               await scrollDirectionHandler(responseData)
          } else if (responseData === "news_translate") {
               await translateArticle(ctx, prefCheckNum, newsCounter)
          }
     }
     while (responseData === "previous_article" || responseData === "next_article" || responseData === "news_translate")

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
          const isArticleTranslated = langTemp.get(newsCounter).translated
          messageText = keywordArticleCompiler(ctx, conversation, prefCheckNum, newsCounter, isArticleTranslated)
          try {
               articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                    {
                         parse_mode: "HTML",
                         reply_markup: newsSliderKeyboard(newsLimit, currLang(newsCounter))
                    })
               await ctx.answerCallbackQuery();
          } catch (error) {
               if (!error.message.includes("query is too old")) {
                    console.log("scrollDirectionHandler ERROR\n", error);
                    if (error.message.includes("tag")) {
                         await scrollDirectionHandler(direction)
                    }
               }
          }
     }

     async function translateArticle(ctx, prefCheckNum, articleNumber) {
          const articlesSessionLink = conversation.session.user.news[prefCheckNum].articles
          const articleObj = articlesSessionLink[articleNumber]
          const firstTitle = articleObj.title
          const langData = langTemp.get(articleNumber)
          const isArticleTranslated = langData.translated

          let messageText

          if (isArticleTranslated) {
               messageText = keywordArticleCompiler(ctx, conversation, prefCheckNum, newsCounter, false)
               langData.lang = articleObj.lang
               langData.translated = false
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              reply_markup: newsSliderKeyboard(newsLimit, currLang(newsCounter))
                         })
                    await ctx.answerCallbackQuery();
               } catch (error) {
                    console.log("ERROR\n", error.message);
                    if (!error.message.includes("query is too old")) {
                         await sendStartMessage(ctx)
                         return
                    }
               }
          } else if (!isArticleTranslated) {
               if (!firstTitle.translated) {
                    const dataForTranslate = {
                         trends: false,
                         lang: articleObj.lang,
                         title: articleObj.title,
                         description: articleObj.description,
                         content: articleObj.content
                    }
                    try {
                         const translatedRes = await sendNTranslate(dataForTranslate)
                         const newTitle = translatedRes.title.translated
                         const newDescription = translatedRes.description.translated
                         const newContent = translatedRes.content.translated
                         // const translatedRes = await conversation.external(() => sendNTranslate(dataForTranslate))
                         sessionUpdate(conversation, prefCheckNum).updateKeywordTranslate(articleNumber, newTitle, newDescription, newContent)
                         translationUpdate = true
                    } catch (error) {
                         conversation.log(error)
                    }
                    translationUpdate = true
               }
               langData.lang = oppositeLang(articleObj.lang)
               langData.translated = true
               messageText = keywordArticleCompiler(ctx, conversation, prefCheckNum, newsCounter, true)
               try {
                    articleMessage = await ctx.api.editMessageText(chatId, articleMessage.message_id, messageText,
                         {
                              parse_mode: "HTML",
                              reply_markup: newsSliderKeyboard(newsLimit, currLang(newsCounter))
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
     //TODO: Если последний текст от бота - изменять текст, если от человека - присылать стартмесседж
     return
}