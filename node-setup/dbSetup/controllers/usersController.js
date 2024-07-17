import { mongoHelper } from "./MongoClasses.js";


const mongoUrl = process.env.MONGO_URL;
const dbName = 'universalHelper';
export const dbHelper = new mongoHelper(mongoUrl, dbName);
