export default function (ctx, prefNum = null) {
     return {
          prefUpdate({ _id = null, articleLang = null, keyword = null, articles = null, date = null }) {
               if (_id) {
                    ctx.session.user.news[prefNum]._id = _id;
               }
               if (articleLang) {
                    ctx.session.user.news[prefNum].lang = articleLang;
               }
               if (keyword) {
                    ctx.session.user.news[prefNum].keyword = keyword;
               }
               if (articles) {
                    ctx.session.user.news[prefNum].articles = articles;
               }
               if (date) {
                    ctx.session.user.news[prefNum].date = date;
               }
          },
          updateKeywordTranslate(articleNum, title, description, content) {
               ctx.session.user.news[prefNum].articles[articleNum].title.translated = title
               ctx.session.user.news[prefNum].articles[articleNum].description.translated = description
               ctx.session.user.news[prefNum].articles[articleNum].content.translated = content
          }

     }
}