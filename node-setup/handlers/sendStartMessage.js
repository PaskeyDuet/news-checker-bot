import getUserData from "#bot/helpers/getUserData.js";
import prefsMenuTextGenerator from "#bot/helpers/prefsMenuTextGenerator.js";
import { createMainMenuKeyboard } from "#bot/keyboards/newsKeyboards.js";

export default async function (ctx) {
     ctx.session.routeHistory = [];
     ctx.session.conversation = {};
     ctx.session.temp = {};

     await getUserData(ctx)

     let mainMenuText = ''
     //TODO: add newBieCheck
     mainMenuText += "Какой-то озаглавливающий текст\n\n"
     mainMenuText += prefsMenuTextGenerator(ctx)

     const prefsKeyboard = createMainMenuKeyboard(ctx)


     let updatedCtx = await ctx.reply(`${mainMenuText}`, {
          reply_markup: prefsKeyboard,
          parse_mode: "HTML"
     })

     ctx.session.user.lastMsgId = updatedCtx.message_id;
}