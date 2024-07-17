import axios from "axios"
import { app } from "../index.js";



export async function sendNTranslate(obj) {
    axios.post('http://localhost:5001/data', obj)
        .then(response => {
            console.log('Data sent from Python server:', typeof (response));
            console.log("Translated articles: \n", response.data.articles.eng);
        })
        .catch(error => {
            console.error('Error sending data to Python server:', error.message);
        });
}