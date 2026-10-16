import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db_connect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_ATLAS)
        console.log("Mongo DB connected successfully")
    } catch(error){
        console.error("Mongo connection failed", error);
        process.exit(1)
    }
}

export default db_connect;