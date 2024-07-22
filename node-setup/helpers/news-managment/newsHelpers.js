import chardet from 'chardet';
import NewsAPI from 'newsapi';

export function keywordReturner(ctx, number) { return ctx.session.user.news[number - 1].keyword }

export function articlesObjsCreator(articlesArr) {
     let articleObjectsArr = []
     articlesArr = tagsClearer(articlesArr)
     for (let i = 0; i < articlesArr.length; i++) {
          //Сделать разделение на поступающие русские и английские
          let newsObj = {}

          newsObj.lang = 'eng'
          newsObj.title = {
               original: `${articlesArr[i].title}`,
               translated: null
          }
          newsObj.source = `${articlesArr[i].source.name}`
          newsObj.author = `${articlesArr[i].author}`
          newsObj.description = {
               original: `${articlesArr[i].description}`,
               translated: null
          }
          newsObj.content = {
               original: `${articlesArr[i].content}`,
               translated: null
          }
          newsObj.link = `${articlesArr[i].url}`

          articleObjectsArr.push(newsObj)
     }

     return articleObjectsArr
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
     return newsArr
}

export function articleCheckCompiler(conversation, prefCheckNum, articleNumber, translationMode = false) {
     const articlesSessionLink = conversation.session.user.news[prefCheckNum - 1].articles
     let textObj
     textObj = articlesSessionLink[articleNumber]
     let articleText = ''
     if (translationMode) {
          articleText += `<b>Title:</b>${textObj.title.translated}\n`
     } else {
          articleText += `<b>Title:</b>${textObj.title.original}\n`
     }
     articleText += `<b>Source:</b>${textObj.source}\n`
     articleText += `<b>Author:</b> ${textObj.author}\n\n`
     if (translationMode) {
          articleText += `<b>Description:</b> ${textObj.description.translated}\n\n`
     } else {
          articleText += `<b>Description:</b> ${textObj.description.original}\n\n`
     }
     if (translationMode) {
          articleText += `<b>Content:</b> ${textObj.content.translated}\n\n`
     } else {
          articleText += `<b>Content:</b> ${textObj.content.original}\n\n`
     }
     articleText += `<a href="${textObj.link}">Read more</a>`

     return articleText
}

const keywordsCheck = (regex, str) => regex.test(str)

export function filteredNewsArray(newsArr, lang = "en", keyword) {
     const clearedNewsArr = newsArr.filter(article =>
          article.title !== '[Removed]' &&
          article.author !== null)
     console.log(clearedNewsArr.length);
     // const langFilteredNews = clearedNewsArr.filter(article => {
     //      const { lang: articleLang } = chardet.analyse(Buffer.from(article.title))[1];
     //      return articleLang === lang
     // })

     if (keyword) {
          let keywordFilteredArr
          if (keyword.split(' ').length > 1) {
               const regExp = regexForMultiKeywords(keyword)
               keywordFilteredArr = clearedNewsArr.filter(article =>
                    keywordsCheck(regExp, article.title) ||
                    keywordsCheck(regExp, article.description) ||
                    keywordsCheck(regExp, article.content)
               )
          } else {
               keywordFilteredArr = clearedNewsArr.filter(article =>
                    article.title.split(' ').includes(keyword) ||
                    article.description.split(' ').includes(keyword) ||
                    article.content.split(' ').includes(keyword)
               )
          }
          return keywordFilteredArr
     }
     return clearedNewsArr
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
     const tagsRegExp = /<ul>|<\/ul>|<li>|<\/li>|\\n/gm
     const tagsClearedArr = articlesArr.reduce((acc, article) => {
          article.content = article.content.replace(tagsRegExp, '')
          acc.push(article)
          return acc
     }, [])
     return tagsClearedArr
}
export class NewsRequster {
     constructor(apiKeys) {
          this.apiKeys = apiKeys;
          this.keysIndex = 0;
          this.currPageNumber = 1;
          this.pagesLimit = 1;
          this.resObj = {
               status: "ok",
               error: null,
               articles: []
          }
     }

     async reqByKeyword(keyword, lang, keysIndex) {
          console.log(keysIndex);
          const newsApi = new NewsAPI(this.apiKeys[keysIndex])
          let res
          await newsApi.v2.everything({
               q: `${keyword}`,
               language: lang,
               page: this.currPageNumber
          }).then(response => {
               res = response;
          })
          return res
     }

     async newsCatcherByKeyword(keyword, lang = "en", country = 'us') {
          do {
               let res
               try {
                    res = await this.reqByKeyword(keyword, lang, this.keysIndex)
                    const { status, totalResults, articles: receivedNews } = res

                    if (status !== "ok") {
                         //TODO: Какие бывают ошибки на этом этапе? Классифицировать
                         this.resObj.status = "error"
                         this.resObj.status = "weird answer from server"
                         return this.resObj
                    } else if (receivedNews.length === 0) {
                         this.resObj.error = "Empty articles arr"
                         return this.resObj
                    }
                    this.pagesLimit = fetchPageLimitator(totalResults)
                    // this.currPageNumber += 1
                    const filteredArr = filteredNewsArray(receivedNews, lang, keyword)
                    filteredArr.forEach(element => this.resObj.articles.push(element));
               } catch (error) {
                    console.log(error.message);
                    //TODO: Классифицировать проблему с API key
                    if (error.message.match(/too many results/) || error.message.match(/too many requests/)) {
                         this.keysIndex++
                         const res = await this.newsCatcherByKeyword(keyword)
                         return res
                    }
                    this.resObj.status = "error",
                         this.resObj.error = error.message
                    return this.resObj
               }
          } while (this.currPageNumber === this.pagesLimit);
          return this.resObj
     }

     async reqTopHeads(country, keyIndex) {
          const newsApi = new NewsAPI(this.apiKeys[keyIndex])
          let res
          await newsApi.v2.topHeadlines({
               country: country,
               page: this.currPageNumber
          }).then(response => {
               res = response;
          })
          return res
     }

     async newsCatcherTopHeads(lang = 'en', country = 'us') {
          do {
               let res
               try {
                    res = await this.reqTopHeads(country, this.keysIndex)
                    const { status, totalResults, articles: receivedNews } = res

                    if (status !== "ok") {
                         //TODO: Какие бывают ошибки на этом этапе? Классифицировать
                         this.resObj.status = "error"
                         this.resObj.status = "weird answer from server"
                         return this.resObj
                    }
                    this.pagesLimit = fetchPageLimitator(totalResults)
                    this.currPageNumber += 1

                    const filteredArr = filteredNewsArray(receivedNews, lang, null)
                    console.log(filteredArr.length);
                    filteredArr.forEach(element => this.resObj.articles.push(element));
               } catch (error) {
                    //TODO: Классифицировать проблему с API key
                    if (error.message.match(/too many results/) || error.message.match(/too many requests/)) {
                         console.log("WE ARE IN??");
                         this.keysIndex++
                         const res = await this.newsCatcherTopHeads(lang, country)
                         return res
                    }
                    this.resObj.status = "error",
                         this.resObj.error = error.message
                    return this.resObj
               }
          } while (this.currPageNumber === this.pagesLimit);
          return this.resObj
     }
}