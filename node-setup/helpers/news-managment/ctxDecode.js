export default function (ctx) {
     return {
          newsObjData(prefNum) {
               const obj = ctx.session.user.news[prefNum]
               if (prefNum === 2) {
                    return {
                         _id: obj._id,
                         lang: obj.lang,
                         date: obj.date,
                         country: obj.country,
                         articles: obj.articles,
                         articlesLen: obj.articles.length,
                         key: ctx.session.user.newsapiOrgKey
                    }
               } else {
                    return {
                         _id: obj._id,
                         kNum: prefNum,
                         lang: obj.lang,
                         date: obj.date,
                         topic: obj.topic,
                         keyword: obj.keyword,
                         articles: obj.articles,
                         articlesLen: obj.articles.length,
                    }
               }
          },
          metaReturn() {
               const obj = ctx.session
               const user = obj.user

               return {
                    userId: user._id,
                    apiKey: user.news.newsapiOrgKey,
                    credits: user.creditsLeft,
                    isNewbie: user.isNewbie,
                    temp: {
                         change: obj.temp.prefChangeNum,
                         check: obj.temp.prefCheckNum
                    }
               }
          }
     }
}