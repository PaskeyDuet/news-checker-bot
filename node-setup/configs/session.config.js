export default {
     user: {
          _id: null,
          newsapiOrgKey: null,
          creditsLeft: null,
          news:
               [{
                    _id: null,
                    lang: null,
                    topic: null,
                    keyword: null,
                    articles: [],
                    date: null
               },
               {
                    _id: null,
                    lang: null,
                    topic: null,
                    keyword: null,
                    articles: [],
                    date: null
               },
               {
                    _id: null,
                    date: null,
                    lang: null,
                    country: null,
                    articles: [],
               }],
          isNewbie: true
     },
     routeHistory: [],
     lastMsgId: 0,
     temp: {
          lastCtxFromBot: null,
          prefChangeNum: null,
          prefCheckNum: null,
     },
}