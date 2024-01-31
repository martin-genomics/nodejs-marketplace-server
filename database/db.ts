import mongoose from "mongoose";
import { logsWrite } from "../configs/logs";
import dotenv from 'dotenv';


dotenv.config();

const mongoDBUri = process.env.MONGO_DATABASE_URI as string;

const mongoDBName = process.env.MONGO_DB_NAME as string;

export async function connectToDb() {
    try{

        await mongoose.connect(`${mongoDBUri}/${mongoDBName}`);

    } catch (error) {
        if(error instanceof Error)
        logsWrite({
            name: error.name,
            clientMessage: 'Something went wrong while connecting to the database. Check the logs',
            message: error.message,
            error: JSON.stringify(error),
            stack: error?.stack as string,
            date: Date.now().toLocaleString(),
        });
    }
}