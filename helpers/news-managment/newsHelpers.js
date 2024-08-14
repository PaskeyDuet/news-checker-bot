import chardet from 'chardet';
import { dbHelper } from "#bot/index.js";
import newsProcessing from './newsProcessing.js';
import sessionUpdate from '../../conversations/helpers/sessionUpdate.js';

export function keywordReturner(ctx, number) { return ctx.session.user.news[number].keyword }

export async function trendsComplexUpdate(ctx, currDate) {
     const lastTrendsRes = await dbHelper.getLastDailyTrends()
     const dayMilliseconds = 1000 * 60 * 60 * 24
     console.log('info', lastTrendsRes);

     let _id
     let articles
     let date
     if (!lastTrendsRes || (currDate - lastTrendsRes.date) > dayMilliseconds) {
          const res = await newsProcessing(ctx, { trendingMode: true, country: 'us', lang: 'en' })
          const dbRes = await dbHelper.pushDailyTrends(res.articles)
          _id = dbRes.insertedId
          articles = res.articles
          date = currDate
     } else {
          _id = lastTrendsRes._id
          articles = lastTrendsRes.allArticles
          date = lastTrendsRes.date
     }
     sessionUpdate(ctx, 2).prefUpdate({ _id: _id, articles: articles, date: date })

}

export async function keywordComplexUpdate(ctx, currDate, inf, prefNum) {
     const dayMilliseconds = 1000 * 60 * 60 * 24
     const dbTopic = await dbHelper.findTopic(inf.keyword, inf.lang)

     const _id = dbTopic._id;
     const dbAllArticles = dbTopic.allArticles
     const dbTopicsLength = dbAllArticles.length
     const lastDbObj = dbAllArticles[dbTopicsLength - 1]
     const lastDbArticles = lastDbObj.articles
     const lastDbDate = lastDbObj.date

     const difference = currDate - lastDbDate
     let articles
     let date
     if (difference > dayMilliseconds) {
          const res = await newsProcessing(ctx, { apiKey: inf.key, prefNum: prefNum, lang: inf.lang })
          await dbHelper.pushKeywordNews(_id, res.articles, inf.lang)
          articles = res.articles
          date = currDate
     } else {
          articles = lastDbArticles
          date = lastDbDate
     }
     sessionUpdate(ctx, prefNum).prefUpdate({ articles: articles, date: date })
}

export function articlesObjsCreator(articles, lang, trendingMode = false) {
     if (!trendingMode) {
          let articleObjectsArr = []
          articles = tagsClearer(articles)
          for (let i = 0; i < articles.length; i++) {
               let newsObj = {}

               newsObj.lang = lang
               newsObj.title = {
                    original: `${articles[i].title}`,
                    translated: null
               }
               newsObj.source = `${articles[i].source.name}`
               newsObj.author = `${articles[i].author}`
               newsObj.description = {
                    original: `${articles[i].description}`,
                    translated: null
               } || null
               newsObj.content = {
                    original: `${articles[i].content}`,
                    translated: null
               } || null
               newsObj.link = `${articles[i].url}` || null

               articleObjectsArr.push(newsObj)
          }
          return articleObjectsArr
     } else if (trendingMode) {
          for (const category of articles) {
               const articleObjs = []
               category.articles.forEach(article => {
                    let articleObj = {}

                    articleObj.lang = lang
                    articleObj.title = {
                         original: `${article.title}`,
                         translated: null
                    }
                    articleObj.source = `${article.source.name}`
                    articleObj.author = `${article.author}`
                    articleObj.link = `${article.url}` || null

                    articleObjs.push(articleObj)
               })
               category.articles = articleObjs
          }
          return articles

     }
}

export async function updateDBTranslates(conversation, { trendingMode, prefNum }) {
     if (trendingMode) {
          prefNum = 3
     }
     const newsData = conversation.session.user.news[prefNum]
     const articlesDbId = newsData._id
     const articlesArr = newsData.articles
     await dbHelper.articlesUpdate(articlesDbId, articlesArr, { trending: trendingMode })
}

export function articlesLimiter(articlesArr) {
     let newsArr = []
     // let newsLimit = process.env.NEWS_QUANTITY
     let newsLimit = articlesArr.length
     // if (newsLimit > articlesArr.length) {
     //      newsLimit = articlesArr.length
     // }

     for (let i = 0; i < newsLimit; i++) {
          newsArr.push(articlesArr[i])
     }
     return articlesArr
}

export const oppositeLang = (currLang) => {
     if (currLang === 'en') {
          return 'ru'
     } else if (currLang === 'ru') {
          return 'en'
     } else { return null }
}

export function keywordArticleCompiler(ctx, conversation, prefCheckNum, articleNumber, translationMode) {
     const articlesSessionLink = conversation.session.user.news[prefCheckNum].articles
     const textObj = articlesSessionLink[articleNumber]
     let articleText = ''

     if (translationMode) {
          articleText += `<b>Title: </b>${textObj.title.translated}\n`
     } else {
          articleText += `<b>Title: </b>${textObj.title.original}\n`
     }
     articleText += `<b>Source:</b> ${textObj.source}\n`
     articleText += `<b>Author:</b> ${textObj.author}\n\n`
     if (textObj.description.original && textObj.description.original !== null && textObj.description.original !== '') {
          if (translationMode) {
               articleText += `<b>Description:</b> ${textObj.description.translated}\n\n`
          } else {
               articleText += `<b>Description:</b> ${textObj.description.original}\n\n`
          }
     }
     if (textObj.content.original && textObj.content.original !== null && textObj.content.original !== '') {
          if (translationMode) {
               articleText += `<b>Content:</b> ${textObj.content.translated}\n\n`
          } else {
               articleText += `<b>Content:</b> ${textObj.content.original}\n\n`
          }
     }
     articleText += `<a href="${textObj.link}">Read more</a>`

     return articleText
}

export function trendsArticleCompiler(conversation, catCounter, translationMode = false) {
     const catSessionLink = conversation.session.user.news[2]
     const updateDate = new Date(catSessionLink.date).toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })

     const catObj = catSessionLink.articles[catCounter]
     const catName = catObj.category
     const catArticles = catObj.articles

     let headsLimit = 5
     if (catArticles.length < headsLimit) {
          headsLimit = catArticles.length
     }
     let headsText = `~<b>${catName.toUpperCase()}</b>~\n <b>${updateDate}</b>\n`

     for (let i = 0; i < headsLimit; i++) {
          const article = catArticles[i]
          headsText += '----\n'
          if (translationMode) {
               headsText += `<b>Title: </b>${article.title.translated}\n`
          } else {
               headsText += `<b>Title: </b>${article.title.original}\n`
          }
          headsText += `<b>Source:</b> ${article.source}\n`
          headsText += `<b>Author:</b> ${article.author}\n`
          headsText += `<a href="${article.link}">Read more</a>\n`
     }
     return headsText
}

const keywordsCheck = (regex, str) => regex.test(str)

const garbageFilter = (arr) => {
     return arr.filter(article =>
          article.title !== '[Removed]' &&
          article.title !== null &&
          article.author !== null)
}

const langFilter = (arr, lang) => {
     return arr.filter(article => {
          const langTestStr = article.description || article.content || article.title
          const { lang: articleLang } = chardet.analyse(Buffer.from(langTestStr))[1];
          return articleLang === lang
     })
}

const addMapping = (arr) => {
     const clearedOfExceedPuncts = arr.map(article => {
          let description = article.description
          let content = article.content
          if (!punctsValidation(description)) {
               article.description = ''
          } else if (!punctsValidation(content)) {
               article.content = ''
          }
          return article
     })
     return clearedOfExceedPuncts
}

const punctsValidation = (str) => {
     const regex = /[^\w\s]|_/g;
     const sanitizedText = str.replace(regex, ' ');
     const words = sanitizedText.trim().split(/\s+/);
     const wordCount = words.length;
     if (wordCount < 15) {
          return false
     } return true
}

export const currTempLang = (langTemp, counter) => langTemp.get(counter).lang

const keywordFilter = (arr, keyword) => {
     let keywordFilteredArr

     if (keyword.split(' ').length > 1) {
          const regExp = regexForMultiKeywords(keyword)
          keywordFilteredArr = arr.filter(article =>
               keywordsCheck(regExp, article.title) ||
               keywordsCheck(regExp, article.description) ||
               keywordsCheck(regExp, article.content)
          )
     } else {
          keywordFilteredArr = arr.filter(article =>
               (article.title && article.title.split(' ').includes(keyword)) ||
               (article.description && article.description.split(' ').includes(keyword)) ||
               (article.content && article.content.split(' ').includes(keyword))

          )
     }
     return keywordFilteredArr
}

export function filteredNewsArray(articles, lang = "en", keyword = null, trendingMode = false) {
     if (keyword) {
          const clearedNewsArr = garbageFilter(articles)
          if (lang === "en") {
               const langFilteredNews = langFilter(clearedNewsArr, lang)
               const keywordFilteredNews = keywordFilter(langFilteredNews, keyword)
               return keywordFilteredNews
          }
          const keywordFilteredNews = keywordFilter(clearedNewsArr, keyword)
          const stringCheckedNews = addMapping(keywordFilteredNews)
          return stringCheckedNews

     } else if (trendingMode) {
          const clearedNewsArr = garbageFilter(articles)
          const langFilteredNews = langFilter(clearedNewsArr, lang)
          return langFilteredNews
     }
}

function regexForMultiKeywords(keywordsString) {
     const keywordsArr = keywordsString.split(' ')
     let allCombinations = [];

     for (let i = 0; i < keywordsArr.length; i++) {
          allCombinations.push(keywordsArr[i]);
          let temp = keywordsArr[i];

          for (let j = i + 1; j < keywordsArr.length; j++) {
               temp += ' ' + keywordsArr[j];
               allCombinations.push(temp);
          }
     }
     let regExp = ''
     allCombinations.forEach(el => regExp += (`${el}|`))
     regExp = regExp.slice(0, regExp.length - 1)

     return new RegExp(regExp, 'gmi')
}

export function fetchPageLimitator(totalResults) {
     if (totalResults > 100) {
          // const totalPages = Math.ceil(totalResults / 1000 / 2) 
          // return totalPages
          return 1
     } else {
          return 1
     }
}

export function tagsClearer(articlesArr) {
     const tagsRegExp = /<[^>]*>/gm
     const tagsClearedArr = articlesArr.reduce((acc, article) => {
          if (article.description) {
               article.description = (article.description && article.description.replace(tagsRegExp, ''))

          }
          if (article.content) {
               article.content = (article.description && article.content.replace(tagsRegExp, ''))
          }
          acc.push(article)
          return acc
     }, [])
     return tagsClearedArr
}
