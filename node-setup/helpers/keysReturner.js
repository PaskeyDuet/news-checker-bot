export default function () {
     let firstKey = process.env.NEWS_API_KEY_1
     let secondKey = process.env.NEWS_API_KEY_2
     let thirdKey = process.env.NEWS_API_KEY_3

     const keys = [firstKey, secondKey, thirdKey]

     return keys
}