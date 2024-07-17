import getUserData from "#bot/helpers/getUserData.js";
import { mainMenuKeyboard } from "#bot/keyboards/generalKeyboard.js";

export default async function (ctx) {
     ctx.session.routeHistory = [];
     ctx.session.conversation = {};
     ctx.session.temp = {};

     await getUserData(ctx)

     let updatedCtx = await ctx.reply('Этот бот вам поможет', {
          reply_markup: mainMenuKeyboard
     })

     ctx.session.user.lastMsgId = updatedCtx.message_id;
}