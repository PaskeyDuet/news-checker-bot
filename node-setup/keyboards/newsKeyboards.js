import { InlineKeyboard } from "grammy";

function keywordReturner(ctx, number) { return ctx.session.user.news[number - 1].keyword }

export function createNewsKeyboard(ctx) {
     const keyword1 = keywordReturner(ctx, 1)
     const keyword2 = keywordReturner(ctx, 2)

     let newsPrefsKeyboard = new InlineKeyboard()

     if (!keyword1 && !keyword2) {
          newsPrefsKeyboard.text('Добавить тему', 'news_change__keyword1').row()
     } else if (keyword1) {
          newsPrefsKeyboard.text("Проверить новости", "news_check")
               .row()
               .text("Изменить темы", "news_change")
               .row()
     }
     newsPrefsKeyboard.text('Back', "back_callback")

     return newsPrefsKeyboard
}

export function createPrefsChangeKeyboard(ctx) {
     const keyword1 = keywordReturner(ctx, 1)
     const keyword2 = keywordReturner(ctx, 2)

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
     const keyword1 = keywordReturner(ctx, 1)
     const keyword2 = keywordReturner(ctx, 2)

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

export const keywordChangeBack = new InlineKeyboard()
     .text("Главное меню", "main_menu")

export function newsSliderKeyboard(articlesNumber) {
     let checkingPrefsKeyboard = new InlineKeyboard()
     if (articlesNumber === 0) {
          checkingPrefsKeyboard.text("Перевести", "news_translate")
               .row()
     } else {
          checkingPrefsKeyboard.text('⏪', "previous_article")
               .text("Перевести", "news_translate")
               .text('⏩', "next_article")
               .row()
     }
     checkingPrefsKeyboard.text("В главное меню", "main_menu")

     return checkingPrefsKeyboard
}


