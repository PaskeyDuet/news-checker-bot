import mongoose from "mongoose";

//TODO: Add personal api key to user schema
//TODO: Add global news by date schema
const userSchema = new mongoose.Schema({
     user: {
          _id: Number,
          news: {
               pref1: {
                    keyword: String,
                    articles: Array
               },
               pref2: {
                    keyword: String,
                    articles: Array
               },
          },
          isNewbie: false
     },
})

export default mongoose.model("User", userSchema)