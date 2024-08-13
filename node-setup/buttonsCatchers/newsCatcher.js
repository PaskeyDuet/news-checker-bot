import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";
import { createPrefsChangeKeyboard, createMainMenuKeyboard, createNewsPrefsKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { Composer } from "grammy";
import { dbHelper } from "#bot/index.js";
import ctxDecode from "#bot/helpers/news-managment/ctxDecode.js";
import { keywordComplexUpdate, trendsComplexUpdate } from "#bot/helpers/news-managment/newsHelpers.js";

export const news = new Composer()
const dayMilliseconds = 1000 * 60 * 60 * 24

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
    ctx.session.temp.prefChangeNum = Number(currentPrefNum) - 1

    await ctx.conversation.enter("newsPrefsChange");
})

news.callbackQuery(/news_explore__keyword/, async (ctx) => {
    const currDate = new Date().getTime()
    let prefCheckStr = ctx.callbackQuery.data.split("news_explore__keyword")[1];
    const prefCheckNum = Number(prefCheckStr) - 1
    ctx.session.temp.prefCheckNum = prefCheckNum

    const inf = ctxDecode(ctx).newsObjData(prefCheckNum)
    const difference = currDate - dayMilliseconds

    if (!inf.articlesLen === 0 || difference > dayMilliseconds) {
        await keywordComplexUpdate(ctx, currDate, inf, prefCheckNum)
    }
    await ctx.conversation.enter("newsCheck");
})

news.callbackQuery(/news_explore__trending/, async (ctx) => {
    const currDate = new Date().getTime()
    const inf = ctxDecode(ctx).newsObjData(2)
    const difference = currDate - inf.date

    if (inf.articlesLen === 0 || difference > dayMilliseconds) {
        await trendsComplexUpdate(ctx, currDate)
    }
    await ctx.conversation.enter("trendingCheck");
})