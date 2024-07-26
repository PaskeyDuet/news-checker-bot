import { regMedia } from "#bot/configs/mediaObjs.js"
import { newApiKeyKeyboard } from "#bot/keyboards/newsKeyboards.js"
import { InputMediaBuilder } from "grammy"
import unlessActions from "./unlessActions.js"
import { backMainMenu } from "#bot/keyboards/generalKeyboard.js"
import validateApiKey from "./validateApiKey.js"

export default async function (conversation, ctx) {
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