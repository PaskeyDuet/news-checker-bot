import "dotenv/config"
import NewsApi from 'newsapi'
import { articlesLimiter, filteredNewsArray } from "./newsHelpers.js";

const newsapi = new NewsApi(process.env.NEWS_API_KEY)

export default async function (keyword) {
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

    resObj.articles.eng = filteredNewsArray(receivedNews)

    return resObj
}

