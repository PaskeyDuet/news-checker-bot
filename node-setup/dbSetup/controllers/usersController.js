import { mongoHelper } from "./MongoClasses.js";


const mongoUrl = process.env.MONGO_URL;
const mongoPort = process.env.MONGO_PORT
const dbName = 'universalHelper';
export const dbHelper = new mongoHelper(`${mongoUrl}:${mongoPort}`, dbName);
