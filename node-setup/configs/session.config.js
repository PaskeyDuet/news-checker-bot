export default {
     user: {
          _id: null,
          newsapiOrgKey: null,
          creditsLeft: null,
          news:
               [{
                    lang: null,
                    topic: null,
                    keyword: null,
                    articles: []
               },
               {
                    lang: null,
                    topic: null,
                    keyword: null,
                    articles: []
               },
               {
                    id: null,
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