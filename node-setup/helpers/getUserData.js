import { dbHelper } from "#bot/index.js"

export default async function (ctx) {
     let user = ctx.session.user
     const userId = ctx.from.id

     const res = await dbHelper.findUser(userId)
     if (res) {
          // console.log(res);
          //TODO: В дальнейшем следует упростить данные запросы
          const apiKey = res.newsapiOrgKey

          const _id1 = res.news[0]._id
          const dbPref1 = res.news[0].keyword
          const dbLang1 = res.news[0].lang
          const _id2 = res.news[1]._id
          const dbPref2 = res.news[1].keyword
          const dbLang2 = res.news[1].lang
          const userNewbie = res.isNewbie

          ctx.session.user._id = userId
          ctx.session.user.news.newsapiOrgKey = apiKey
          ctx.session.user.news[0]._id = _id1
          ctx.session.user.news[0].keyword = dbPref1
          ctx.session.user.news[0].lang = dbLang1
          ctx.session.user.news[1]._id = _id2
          ctx.session.user.news[1].keyword = dbPref2
          ctx.session.user.news[1].lang = dbLang2
          ctx.session.user.isNewbie = userNewbie
     } else {
          ctx.session.user._id = userId

          let dbUserObj = {
               _id: userId,
               newsapiOrgKey: null,
               isNewbie: true,
               news:
                    [{
                         _id: null,
                         lang: null,
                         keyword: null
                    },
                    {
                         _id: null,
                         lang: null,
                         keyword: null
                    },
                    {
                         _id: null,
                         date: null
                    }
                    ]
          }
          await dbHelper.insertUser(dbUserObj)
     }
}