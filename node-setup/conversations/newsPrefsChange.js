
import { backButton, backMainMenu } from "#bot/keyboards/generalKeyboard.js";
import { keywordChangeBack, prefChangeAgain } from "#bot/keyboards/newsKeyboards.js";
import unlessActions from "./helpers/unlessActions.js";
import newsArrayRequester from "#bot/helpers/news-managment/newsFetcher.js";
import { articlesObjsCreator } from "#bot/helpers/news-managment/newsHelpers.js";
import { dbHelper } from "#bot/dbSetup/controllers/usersController.js";
import newsFetcher from "#bot/helpers/news-managment/newsFetcher.js";
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

     const res = await newsProcessing(ctx, prefChangeNum, newKeyword, null, conversation)
     console.log(res);
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
     conversation.session.temp.prefChangeNum = null
     await ctx.reply('Тема добавлена', {
          reply_markup: backMainMenu
     })
     await dbHelper.updateKeyword(userId, prefChangeNum, newKeyword)
     return
}