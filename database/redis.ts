import { createClient } from "redis";
import dotenv from 'dotenv';

dotenv.config();
const url = process.env.REDIS_URL || 'redis://localhost:6379';
console.log(url)
export default async function connectToRedis() {
    //REDIS DATABASE CONNECTIVITY

    try {
        const redisClient = createClient({
            url: url,
        });

        redisClient.on('error', (err => {
            console.log('Redis Client Error');
        }));
        redisClient.on('connect', ()=> {
            console.log('Redis Client Connected');
        });
        
        await redisClient.connect();

        process.on('SIGNINT', async ()=> {
            await redisClient.quit();
        })
        return redisClient;
    } catch(error) {
        if(error instanceof Error)
        console.log({ 
            name: error.name,
            message: error.message,
            stack: error?.stack,
    });
    }
}