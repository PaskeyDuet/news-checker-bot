import { languagesDict } from "#bot/configs/dict.config.js";
import { getEmoji } from "#bot/helpers/getEmoji.js";
import { keywordReturner } from "#bot/helpers/news-managment/newsHelpers.js";
import { InlineKeyboard } from "grammy";

export function createMainMenuKeyboard(ctx) {
     const keyword1 = keywordReturner(ctx, 0)
     const keyword2 = keywordReturner(ctx, 1)

     let newsPrefsKeyboard = new InlineKeyboard()
          .text("Trending", "news_explore__trending")
          .row()
     if (keyword1 && !keyword2) {
          newsPrefsKeyboard.text(`${keyword1}`, "news_explore__keyword1")
               .row()
     } else if (keyword1 && keyword2) {
          newsPrefsKeyboard.text(`${keyword1}`, "news_explore__keyword1")
          newsPrefsKeyboard.text(`${keyword2}`, "news_explore__keyword2")
               .row()
     }

     if (!keyword1 && !keyword2) {
          newsPrefsKeyboard.text('Добавить тему', 'news_change__keyword1').row()
     } else if (keyword1) {
          newsPrefsKeyboard
               .text("Изменить темы", "news_change")
               .row()
     }
     newsPrefsKeyboard = newsPrefsKeyboard.text('Info', 'info')
     return newsPrefsKeyboard
}

export function createPrefsChangeKeyboard(ctx) {
     const keyword1 = keywordReturner(ctx, 0)
     const keyword2 = keywordReturner(ctx, 1)

     let prefsChangeKeyboard = new InlineKeyboard()

     if (keyword1 && !keyword2) {
          prefsChangeKeyboard.text(`${keyword1}`, "news_change__keyword1")
               .row()
               .text('Добавить тему', 'news_change__keyword2')
               .row()
     } else if (keyword1 && keyword2) {
          prefsChangeKeyboard.text(`${keyword1}`, "news_change__keyword1")
               .row()
          prefsChangeKeyboard.text(`${keyword2}`, "news_change__keyword2")
               .row()
     }
     prefsChangeKeyboard.text('Back', "back_callback")

     return prefsChangeKeyboard
}

export function prefChangeAgain(ctx) {
     const prefChangeNum = ctx.session.temp.prefChangeNum

     let prefsChangeKeyboard = new InlineKeyboard()
          .text("Главное меню", "main_menu")
          .text("Once again", `news_change__keyword${prefChangeNum}`)

     return prefsChangeKeyboard
}

export function createNewsPrefsKeyboard(ctx) {
     const keyword1 = keywordReturner(ctx, 0)
     const keyword2 = keywordReturner(ctx, 1)

     let prefsKeyboard = new InlineKeyboard()

     if (keyword1 && !keyword2) {
          prefsKeyboard.text(`${keyword1}`, "news_explore__keyword1")
               .row()
     } else if (keyword1 && keyword2) {
          prefsKeyboard.text(`${keyword1}`, "news_explore__keyword1")
               .row()
          prefsKeyboard.text(`${keyword2}`, "news_explore__keyword2")
               .row()
     }
     prefsKeyboard.text('Back', "back_callback")

     return prefsKeyboard
}

export function createLangChoose() {
     let languagesKeyboard = new InlineKeyboard()

     for (const lang in languagesDict) {
          const transLang = languagesDict[lang]
          languagesKeyboard = languagesKeyboard.text(`${getEmoji(lang)}${transLang}`, `${lang}`)
     }
     languagesKeyboard = languagesKeyboard.row().text("Главное меню", "main_menu")

     return languagesKeyboard
}

export const keywordChangeBack = new InlineKeyboard()
     .text("Главное меню", "main_menu")

export const newApiKeyKeyboard = () =>
     new InlineKeyboard()
          .text("Главное меню", "main_menu")
          .text("Далее", "new_api_next")

export function newsSliderKeyboard(articlesNumber, lang = 'en') {
     let checkingPrefsKeyboard = new InlineKeyboard()
     const translateText = () => {
          if (lang === 'ru') {
               return "🇷🇺->🇺🇸"
          } else if (lang === 'en') {
               return "🇺🇸->🇷🇺"
          }
     }
     if (articlesNumber === 0) {
          checkingPrefsKeyboard.text(translateText(), "news_translate")
               .row()
     } else {
          checkingPrefsKeyboard.text('⏪', "previous_article")
               .text(translateText(), "news_translate")
               .text('⏩', "next_article")
               .row()
     }
     checkingPrefsKeyboard.text("В главное меню", "main_menu")

     return checkingPrefsKeyboard
}

export function prefChangeFinish(ctx, prefChangeNum) {
     // const keyword = keywordReturner(ctx, prefChangeNum)

     let finishKeyboard = new InlineKeyboard()
          .text("Посмотреть новости", `news_explore__keyword${prefChangeNum + 1}`)
          .row()
          .text('Назад', "main_menu")
          .text('Изменить тему', `news_change__keyword${prefChangeNum}`)

     return finishKeyboard
}