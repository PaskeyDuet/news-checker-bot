import sendStartMessage from "#bot/handlers/sendStartMessage.js";
import newsProcessing from "#bot/helpers/news-managment/newsProcessing.js";
import { createPrefsChangeKeyboard, createMainMenuKeyboard, createNewsPrefsKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { Composer } from "grammy";
import { dbHelper } from "#bot/index.js";

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
    const newsPref = ctx.session.user.news[prefCheckNum - 1]
    const apiKey = ctx.session.user.newsapiOrgKey
    const keyword = newsPref.keyword
    const articles = newsPref.articles
    const lang = newsPref.lang
    const dbTopic = await dbHelper.findTopic(keyword)

    const currDate = new Date().getTime()
    const dayMilliseconds = 1000 * 60 * 60 * 24

    const _id = dbTopic._id;
    const dbAllArticles = dbTopic.allArticles
    const dbTopicsLength = dbAllArticles.length
    const lastDbObj = dbAllArticles[dbTopicsLength - 1]
    const lastDbArticles = lastDbObj.articles
    const lastDbDate = lastDbObj.date
    const difference = currDate - lastDbDate

    if (difference > dayMilliseconds) {
        const res = await newsProcessing(ctx, apiKey, null, prefCheckNum, false)
        await dbHelper.pushKeywordNews(_id, res.articles, lang)
        ctx.session.user.news[prefCheckNum - 1].articles = res.articles
    } else if (articles.length === 0 || (difference < dayMilliseconds)) {
        ctx.session.user.news[prefCheckNum - 1].articles = lastDbArticles
    }
    await ctx.conversation.enter("newsCheck");
})

news.callbackQuery(/news_explore__trending/, async (ctx) => {
    const trendingInfo = ctx.session.user.news[2]

    const reqRes = await dbHelper.getLastDailyTrends()
    if (!reqRes) {
        const res = await newsProcessing(ctx, null, null, true, null, 'en', 'us')
        const dbRes = await dbHelper.pushDailyTrends(res.articles)
        const stringDbRes = dbRes.insertedId.toString()
        ctx.session.user.news[2].id = stringDbRes
        ctx.session.user.news[2].articles = res.articles
        await ctx.conversation.enter("trendingCheck");
        return
    }
    const { date: lastUpdateTime, categories: articles } = reqRes

    const dayMilliseconds = 1000 * 60 * 60 * 24
    const currTime = new Date().getTime()
    const difference = currTime - lastUpdateTime
    if (difference > dayMilliseconds) {
        const res = await newsProcessing(ctx, null, null, true, null, 'en', 'us')
        const dbRes = await dbHelper.pushDailyTrends(res.articles)
        const stringDbRes = dbRes.insertedId.toString()
        ctx.session.user.news[2].id = stringDbRes
        ctx.session.user.news[2].articles = res.articles
    }
    if (trendingInfo.articles.length === 0) {
        ctx.session.user.news[2].articles = articles
    }
    await ctx.conversation.enter("trendingCheck");
})