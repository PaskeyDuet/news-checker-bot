import { createLangChoose, prefChangeAgain, prefChangeFinish } from "#bot/keyboards/newsKeyboards.js"
import unlessActions from "./unlessActions.js"
import { keywordChangeBack } from "#bot/keyboards/newsKeyboards.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";
import { dbHelper, reqHelper } from "#bot/index.js";
import { backMainMenu } from "#bot/keyboards/generalKeyboard.js";
import sessionUpdate from "./sessionUpdate.js";

export async function apiKeyGetter(conversation, ctx) {
     const chatId = ctx.update.callback_query.message.chat.id

     let firstMessText = 'Для того чтобы запрашивать новости по интересующей вас теме, вам необходимо добавить <b>апи ключ</b>.\n'
     firstMessText += 'Вы можете создать апи ключ по <a href="https://newsapi.org/register">ссылке</a>\n\n'
     firstMessText += 'После регистрации нажмите кнопку далее'

     const { message_id } = await conversation.ctx.api.sendPhoto(chatId, regMedia.reg, {
          caption: firstMessText,
          parse_mode: 'HTML',
          reply_markup: newApiKeyKeyboard(),
     })
     await conversation.waitForCallbackQuery('new_api_next', {
          otherwise: (ctx) => unlessActions(ctx, () => { return })
     })

     let secondMessText = 'Скопируйте выделенный красным цветом <b>API key</b> и пришлите его в чат'
     const apiKeyBuilt = InputMediaBuilder.photo(regMedia.apiKey, {
          caption: secondMessText,
          parse_mode: "HTML",
          reply_markup: backMainMenu
     });
     await ctx.api.editMessageMedia(chatId, message_id, apiKeyBuilt)
     await validateApiKey(conversation, ctx)
}

export async function validateApiKey(conversation, ctx) {
     const userId = ctx.session.user._id
     const apiKeyRegExp = /^[a-zA-Z0-9]{32}$/;

     return await conversation.waitUntil(
          async (ctx) => {
               let message = ctx.message?.text

               if (apiKeyRegExp.test(message)) {
                    const reqRes = await reqHelper.testReq(message)
                    if (reqRes.status == "ok") {
                         conversation.session.user.news.newsapiOrgKey = message
                         conversation.session.user.isNewbie = false
                         await dbHelper.updateNewsKey(userId, message)
                         return true
                    }
               }
          },
          {
               otherwise: (ctx) =>
                    unlessActions(ctx, () => {
                         let errMessage = "Во время проверки вашего ключа произошла ошибка.\n";
                         errMessage += "Проверьте правильность введенного ключа и введите его повторно"
                         errMessage += "или повторите запрос позже"
                         ctx.reply(errMessage, {
                              reply_markup: backMainMenu,
                         });
                    }),
          }
     )

}
export async function topicFromMsg(conversation) {
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
     return newKeyword
}

export async function langChoosing(conversation, ctx) {
     let messText = 'Выберите оригинальный язык статей, которые вы хотите получать'

     await ctx.reply(messText, {
          reply_markup: createLangChoose()
     })
     const callbackAnswer = await conversation.waitForCallbackQuery(/^[a-z]{2}$/, {
          otherwise: (ctx) => unlessActions(ctx, async () => {
               let errorText = 'Пожалуйста, используйте кнопки\n\n'
               errorText += messText
               await ctx.reply(errorText, {
                    reply_markup: createLangChoose()
               })
          })
     })
     const chosenLang = callbackAnswer.match[0];
     return chosenLang
}

export async function processNewArticles(ctx, userApiKey, newKeyword, articlesLang) {
     const res = await newsProcessing(ctx, { apiKey: userApiKey, newKeyword: newKeyword, lang: articlesLang })
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
     return res
}

export async function prefUpdateFinish(conversation, ctx, prefChangeNum, articles, _id, newKeyword, articlesLang = null) {
     sessionUpdate(conversation, prefChangeNum).prefUpdate({ _id: _id, articleLang: articlesLang, keyword: newKeyword, articles: articles })
     conversation.session.temp.prefChangeNum = null

     let changeFinishText = 'Тема добавлена\n'
     if (articles.length === 1) {
          changeFinishText += `We found: 1 article`
     } else {
          changeFinishText += `We found: ${articles.length} articles`
     }

     await ctx.reply(changeFinishText, {
          reply_markup: prefChangeFinish(ctx, prefChangeNum)
     })
}