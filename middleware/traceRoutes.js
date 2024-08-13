import sendStartMessage from "#bot/handlers/sendStartMessage.js";

export default async function (ctx, next) {
    let currentMsgId = ctx?.update?.message?.message_id ?? ctx?.callbackQuery?.message?.message_id;
    let lastMsgId = ctx.session.user.lastMsgId ?? 0;
    let currChatId = ctx.update?.message?.chat?.id ?? ctx.update?.callback_query?.message?.chat?.id;

    if (currentMsgId < lastMsgId || lastMsgId === 0) {
        return await sendStartMessage(ctx, true);
    } else {
        ctx.session.lastMsgId = currentMsgId;

        if (ctx?.update?.callback_query) {
            // await ctx.api.editMessageText(ctx.)
        }
        ctx.session.lastCtxFromBot

        if (ctx?.callbackQuery) {
            let cbQMessage = await ctx.callbackQuery.message;

            ctx.session.routeHistory.push({
                text: cbQMessage.text,
                reply_markup: cbQMessage.reply_markup,
            });
        }

        await next();
    }
}
