import { keywordReturner } from "./news-managment/newsHelpers.js"

export default function (ctx) {
     const keyword1 = keywordReturner(ctx, 0)
     const keyword2 = keywordReturner(ctx, 1)
     let newsPrefsText = ''

     if (keyword1 === null) {
          newsPrefsText += "Вы ещё не подписаны на новости. \n"
          newsPrefsText += "Нажмите на кнопку ниже, чтобы создать тему, по которой вы будете получать рассылку"
     } else if (keyword2 === null) {
          newsPrefsText += "Вы подписаны на следующие темы:\n\n"
          newsPrefsText += `- <b>${keyword1}</b>\n\n`
          newsPrefsText += "Вы можете добавить ещё одну тему для получения рассылки или поменять уже имеющуюся"
     } else {
          newsPrefsText += "Вы подписаны на следующие темы:\n\n"
          newsPrefsText += `- <b>${keyword1}</b>\n`
          newsPrefsText += `- <b>${keyword2}</b>\n\n`
          newsPrefsText += "Чтобы изменить одну из тем рассылки выберите её название на кнопке ниже"
     }
     return newsPrefsText
}