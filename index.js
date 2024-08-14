import "dotenv/config";
import express from "express"
import { Bot, session, GrammyError, HttpError } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { hydrate } from "@grammyjs/hydrate";
import { newsPrefsChange } from "./conversations/newsPrefsChange.js";
import sessionConfig from "./configs/session.config.js";
import { news } from "./buttonsCatchers/newsCatcher.js";
import traceRoutes from "./middleware/traceRoutes.js";
import sendStartMessage from "./handlers/sendStartMessage.js";
import { newsCheck } from "./conversations/newsCheck.js";
import { trendingCheck } from "./conversations/trendsCheck.js";
import keysReturner from "./helpers/keysReturner.js";
import { NewsRequster } from "#bot/helpers/news-managment/NewsRequester.js";
import MongoHelper from "#bot/dbClasses/MongoHelper.js";

const mongoUsername = process.env.MONGO_DB_USERNAME
const mongoPass = process.env.MONGO_DB_PASSWORD
const mongoUrl = process.env.MONGO_DB_URL;
const mongoConnectionString = `mongodb://${mongoUsername}:${mongoPass}@${mongoUrl}`
const mongoPort = process.env.MONGO_DB_PORT
const dbName = process.env.MONGO_DB_NAME;

export const dbHelper = new MongoHelper(`${mongoConnectionString}:${mongoPort}`, dbName, mongoPass, mongoUsername);
export const reqHelper = new NewsRequster(keysReturner())
export const bot = new Bot(`${process.env.BOT_API_TOKEN}`);

const appPort = process.env.EXPRESS_PORT
export const app = express()
console.log(`${mongoConnectionString}:${mongoPort}`);

app.listen(appPort, () => {
    console.log('JS Server running on port 5000');
});

bot.use(
    session({
        initial: () => structuredClone(sessionConfig),
    })
);
bot.use(hydrate());
bot.use(conversations());
bot.use(createConversation(newsPrefsChange));
bot.use(createConversation(newsCheck));
bot.use(createConversation(trendingCheck));
bot.use(traceRoutes);
bot.use(news)

bot.command('start', async (ctx) => {
    await sendStartMessage(ctx)
})

bot.command('ctx', async (ctx) => {
})

bot.callbackQuery("main_menu", async (ctx) => {
    //TODO: Сделать проверку последнего сообщения в чате. Если оно от человека, присылать сообщение. Если от бота, обновлять текст
    await sendStartMessage(ctx, true);
    ctx.answerCallbackQuery();
});
bot.callbackQuery("back_callback", async (ctx) => {
    await ctx.session.routeHistory.pop();
    const routeParams = await ctx.session.routeHistory.pop();
    ctx.session.conversation = {};

    await ctx.editMessageText(routeParams.text, {
        reply_markup: routeParams.reply_markup,
        parse_mode: "HTML",
    });
    ctx.answerCallbackQuery();
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.start();
