import axios from "axios"

const pyServerUrl = process.env.PY_TRANSLATOR_URL
const pyServerPort = process.env.PY_TRANSLATOR_PORT

const dataRoute = "/data"

export async function sendNTranslate(obj) {
    const translatorRoute = `${pyServerUrl}:${pyServerPort}${dataRoute}`
    try {
        const translatedData = await axios.post(translatorRoute, obj)
        console.log("===Translated data fetched===");
        return translatedData.data
    } catch (error) {
        if (!pyServerUrl || !pyServerPort) {
            throw new Error("PY_TRANSLATOR_URL and PY_TRANSLATOR_PORT must be defined.");
        }
        console.log("===sendNTranslate failed===\n===Data lost===");
        console.error('Error sending data to Python server:', error.message);
        return null
    }
}