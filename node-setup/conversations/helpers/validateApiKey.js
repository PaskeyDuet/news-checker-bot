import { dbHelper, reqHelper } from "#bot/index.js";
import { backMainMenu, mainMenuKeyboard } from "#bot/keyboards/generalKeyboard.js";
import unlessActions from "./unlessActions.js";

export default async function (conversation, ctx) {
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