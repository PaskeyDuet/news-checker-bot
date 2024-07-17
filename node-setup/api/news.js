import "dotenv/config"
import chardet from 'chardet';
import NewsApi from 'newsapi'
import dateToday from "#bot/helpers/dateToday.js";

const newsapi = new NewsApi(process.env.NEWS_API_KEY)
let newsLimit = process.env.NEWS_QUANTITY

export async function newsArrayRequester(keyword) {
    //TODO: TopHeadliness - подборка самых важных новостей
    const currDate = dateToday()
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

    const { status, articles } = res
    if (status !== "ok") {
        //TODO: Какие бывают ошибки на этом этапе? Классифицировать
        resObj.status = "error"
        resObj.status = "weird answer from server"
        return resObj
    } else if (articles.length === 0) {
        resObj.error = "Empty articles arr"
        return resObj
    }

    const receivedNews = articles
    if (newsLimit > receivedNews.length) {
        newsLimit = receivedNews.length
    }
    console.log("LENGTH", receivedNews.length);
    console.log("NEWS", receivedNews);
    const newsArrayFormater = () => {
        //TODO: Чтобы выстроить более слаженно-работающий модуль будущем следует пересмотреть структуру взаимодействия helpers и api
        for (let i = 0; resObj.articles.eng.length < newsLimit; i++) {
            if (i > newsLimit) {
                break
            }
            if (!receivedNews[i] || receivedNews[i].title === '[Removed]') {
                continue
            }

            const { lang: articleLang } = chardet.analyse(Buffer.from(receivedNews[i].description))[1];

            if (articleLang === 'en' && receivedNews[i].author !== null) {
                resObj.articles.eng.push(receivedNews[i])
            }
        }
    }

    newsArrayFormater()
    return resObj
}

