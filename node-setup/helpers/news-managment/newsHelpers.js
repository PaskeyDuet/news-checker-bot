import chardet from 'chardet';

export function articlesObjsCreator(articlesArr) {
     let articleObjectsArr = []
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
          newsObj.link = `${articlesArr[i].url}`

          articleObjectsArr.push(newsObj)
     }

     return articleObjectsArr
}

export function articlesLimiter(articlesArr) {
     let newsArr = []
     let newsLimit = process.env.NEWS_QUANTITY

     if (newsLimit > articlesArr.length) {
          newsLimit = articlesArr.length
     }

     for (let i = 0; i < newsLimit; i++) {
          newsArr.push(articlesArr[i])
     }
     return newsArr
}

export function filteredNewsArray(newsArr, lang = "en") {
     const clearedNewsArr = newsArr.filter(article => article.title !== '[Removed]' && article.author !== null && article.description !== null)
     const engLangNewsArr = clearedNewsArr.filter(article => {
          const { lang: articleLang } = chardet.analyse(Buffer.from(article.description))[1];
          return articleLang === lang
     })

     return engLangNewsArr
}
