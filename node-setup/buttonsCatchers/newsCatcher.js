import { requestNPush } from "#bot/helpers/newsManagment.js";
import { createPrefsChangeKeyboard, createNewsKeyboard, createNewsPrefsKeyboard } from "#bot/keyboards/newsKeyboards.js";
import { Composer } from "grammy";

export const news = new Composer()

news.callbackQuery("news_prefs", async (ctx) => {
    const keyword1 = ctx.session.user.news[0].keyword
    const keyword2 = ctx.session.user.news[1].keyword

    const prefsKeyboard = createNewsKeyboard(ctx)
    let newsPrefsText = ''

    if (keyword1 === null) {
        newsPrefsText += "Вы ещё не подписаны на новости. \n"
        newsPrefsText += "Нажмите на кнопку ниже, чтобы создать тему, по которой вы будете получать рассылку"

        await ctx.editMessageText(`${newsPrefsText}`, {
            reply_markup: prefsKeyboard,
            parse_mode: "HTML"
        })
    } else if (keyword2 === null) {
        newsPrefsText += "Вы подписаны на следующие темы:\n\n"
        newsPrefsText += `- <b>${keyword1}</b>\n\n`
        newsPrefsText += "Вы можете добавить ещё одну тему для получения рассылки или поменять уже имеющуюся"

        await ctx.editMessageText(`${newsPrefsText}`, {
            reply_markup: prefsKeyboard,
            parse_mode: "HTML"
        })
    } else {
        newsPrefsText += "Вы подписаны на следующие темы:\n\n"
        newsPrefsText += `- <b>${keyword1}</b>\n`
        newsPrefsText += `- <b>${keyword2}</b>\n\n`
        newsPrefsText += "Чтобы изменить одну из тем рассылки выберите её название на кнопке ниже"

        await ctx.editMessageText(`${newsPrefsText}`, {
            reply_markup: prefsKeyboard,
            parse_mode: "HTML"
        })
    }
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
    //TODO: make requestNPush regular

    if (ctx.session.user.news[prefCheckNum - 1].articles.length === 0) {
        await requestNPush(ctx, prefCheckNum)
    }

    await ctx.conversation.enter("newsCheck");
})