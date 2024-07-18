import axios from "axios"
import { app } from "../index.js";

const pyServerUrl = process.env.PY_TRANSLATOR_URL
const pyServerPort = process.env.PY_TRANSLATOR_PORT

const dataRoute = "/data"

export async function sendNTranslate(obj) {
    const translatorRoute = `${pyServerUrl}:${pyServerPort}${dataRoute}`

    try {
        const translatedData = await axios.post(translatorRoute, obj)
        console.log("===sendNTranslate done===\n===Data fetched===");
        return translatedData.data
    } catch (error) {
        console.log("===sendNTranslate failed===\n===Data lost===");
        console.error('Error sending data to Python server:', error.message);
        return error
    }
}