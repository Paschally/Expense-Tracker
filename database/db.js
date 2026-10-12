const mongoose = require('mongoose');
require('dotenv').config();

const db_connect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_ATLAS)
        console.log("Mongo DB connected successfully")
    } catch(error){
        console.error("Mongo connection failed", error);
        process.exit(1)
    }
}

module.exports = db_connect;