import { mongoHelper } from "#bot/dbSetup/controllers/MongoClasses.js";
import { dbHelper } from "#bot/dbSetup/controllers/usersController.js";

export default async function (ctx) {
     let user = ctx.session.user
     const userId = ctx.from.id

     const res = await dbHelper.findUser(userId)
     if (res) {
          //TODO: В дальнейшем следует упростить данные запросы
          const dbPref1 = res.news[0].keyword
          const dbPref2 = res.news[1].keyword

          ctx.session.user._id = userId
          ctx.session.user.news[0].keyword = dbPref1
          ctx.session.user.news[1].keyword = dbPref2
     } else {
          ctx.session.user._id = userId

          let dbUserObj = {
               _id: userId,
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