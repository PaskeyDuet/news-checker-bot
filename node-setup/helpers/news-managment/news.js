import "dotenv/config"
import chardet from 'chardet';
import NewsApi from 'newsapi'

const newsapi = new NewsApi(process.env.NEWS_API_KEY)
let newsLimit = process.env.NEWS_QUANTITY

export async function newsArrayRequester(keyword) {
    //TODO: TopHeadliness - подборка самых важных новостей
    const resObj = {
        status: "ok",
        error: null,
        articles: {
            eng: []
        }
    }

    let res
    try {
        await newsapi.v2.everything({
            q: `${keyword}`,
            language: 'en',
            sortBy: 'popularity',
        }).then(response => {
            res = response;
        })
    } catch (error) {
        //TODO: Классифицировать проблему с API key
        resObj.status = "error",
            resObj.error = error.message
        return resObj
    }
    const { status, articles: receivedNews } = res

    if (status !== "ok") {
        //TODO: Какие бывают ошибки на этом этапе? Классифицировать
        resObj.status = "error"
        resObj.status = "weird answer from server"
        return resObj
    } else if (receivedNews.length === 0) {
        resObj.error = "Empty articles arr"
        return resObj
    }

    if (newsLimit > receivedNews.length) {
        newsLimit = receivedNews.length
    }
    const newsArrayFormater = (newsArr) => {
        const newsObj = {}
        let filteredNLimitedNewsArr = []

        const clearedNewsArr = newsArr.filter(article => article.title !== '[Removed]' && article.author !== null && article.description !== null)
        const engLangNewsArr = clearedNewsArr.filter(article => {
            const { lang: articleLang } = chardet.analyse(Buffer.from(article.description))[1];
            return articleLang === "en"
        })

        newsObj.engArticles = engLangNewsArr
        newsObj.limitedEngArrticles = filteredNLimitedNewsArr

        return newsObj
    }

    const filteredNews = newsArrayFormater(receivedNews)
    resObj.articles.eng = filteredNews
    return resObj
}

