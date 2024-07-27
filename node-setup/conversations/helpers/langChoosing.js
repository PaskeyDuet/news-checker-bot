import { createLangChoose } from "#bot/keyboards/newsKeyboards.js"
import unlessActions from "./unlessActions.js"

export default async function (conversation, ctx) {
     const chatId = ctx.update.callback_query.message.chat.id

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