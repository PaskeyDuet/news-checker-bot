import { InlineKeyboard } from "grammy";

export const mainMenuKeyboard = new InlineKeyboard()
    .text('News', "news_prefs")

export const backMainMenu = new InlineKeyboard().text("‹ В главное меню", "main_menu");

export const backButton = new InlineKeyboard().text("‹ Назад", "back_callback");