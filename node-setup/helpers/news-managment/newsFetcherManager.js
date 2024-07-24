import "dotenv/config"
import { NewsRequster } from "./NewsRequester.js";

let firstKey = process.env.NEWS_API_KEY_1
let secondKey = process.env.NEWS_API_KEY_2
let thirdKey = process.env.NEWS_API_KEY_3
const keys = [firstKey, secondKey, thirdKey]

export const reqHelper = new NewsRequster(keys)