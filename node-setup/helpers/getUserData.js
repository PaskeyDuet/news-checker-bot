import { dbHelper } from "#bot/index.js"

export default async function (ctx) {
     let user = ctx.session.user
     const userId = ctx.from.id

     const res = await dbHelper.findUser(userId)
     if (res) {
          //TODO: В дальнейшем следует упростить данные запросы
          const apiKey = res.newsapiOrgKey
          const dbPref1 = res.news[0].keyword
          const dbPref2 = res.news[1].keyword
          const userNewbie = res.isNewbie

          ctx.session.user._id = userId
          ctx.session.user.news.newsapiOrgKey = apiKey
          ctx.session.user.news[0].keyword = dbPref1
          ctx.session.user.news[1].keyword = dbPref2
          ctx.session.user.isNewbie = userNewbie
     } else {
          ctx.session.user._id = userId

          let dbUserObj = {
               _id: userId,
               newsapiOrgKey: null,
               isNewbie: true,
               news:
                    [{
                         keyword: null
                    },
                    {
                         keyword: null
                    }]
          }
          await dbHelper.insertUser(dbUserObj)
     }
}