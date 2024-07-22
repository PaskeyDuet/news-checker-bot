import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";
import prefsMenuTextGenerator from "#bot/helpers/prefsMenuTextGenerator.js";
import { createPrefsChangeKeyboard, createMainMenuKeyboard, createNewsPrefsKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { Composer } from "grammy";

export const news = new Composer()

news.callbackQuery("main_menu", async (ctx) => {
    await sendStartMessage(ctx)
})

news.callbackQuery("news_change", async (ctx) => {
    await ctx.editMessageText("Выберите тему, которую вы хотели бы изменить", {
        reply_markup: createPrefsChangeKeyboard(ctx)
    })
})

news.callbackQuery(/news_change__keyword/, async (ctx) => {
    let currentPrefNum = ctx.callbackQuery.data.split("news_change__keyword")[1];
    ctx.session.temp.prefChangeNum = Number(currentPrefNum)

    await ctx.conversation.enter("newsPrefsChange");
})

news.callbackQuery(/news_check/, async (ctx) => {
    await ctx.editMessageText("Выберите тему", {
        reply_markup: createNewsPrefsKeyboard(ctx)
    })
})

news.callbackQuery(/news_explore__keyword/, async (ctx) => {
    let prefCheckNum = Number(ctx.callbackQuery.data.split("news_explore__keyword")[1]);
    ctx.session.temp.prefCheckNum = prefCheckNum
    //TODO: make newsProcessing regular
    if (ctx.session.user.news[prefCheckNum - 1].articles.length === 0) {
        await newsProcessing(ctx, prefCheckNum, "keyword")
    }

    await ctx.conversation.enter("newsCheck");
})

news.callbackQuery(/news_explore__trending/, async (ctx) => {
    const trendingInfo = ctx.session.user.news[2]
    //TODO: make newsProcessing regular
    if (trendingInfo.articles.length === 0) {
        const res = await newsProcessing(ctx, null, "top-news")
        console.log("ON BUTTON INFO", res.status);
    }

    await ctx.conversation.enter("trendingCheck");
})