
import { backButton } from "#bot/keyboards/generalKeyboard.js";
import { keywordChangeBack, prefChangeAgain, prefChangeFinish } from "#bot/keyboards/newsKeyboards.js";
import unlessActions from "./helpers/unlessActions.js";
import { dbHelper } from "#bot/dbSetup/controllers/usersController.js";
import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";

export async function newsPrefsChange(conversation, ctx) {
     const prefChangeNum = ctx.session.temp.prefChangeNum
     const userId = ctx.session.user._id

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

     const res = await newsProcessing(ctx, prefChangeNum, "keyword", newKeyword)
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
     await dbHelper.updateKeyword(userId, prefChangeNum, newKeyword)
     return
}