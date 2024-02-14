import connectToRedis from "../database/redis";
import { RedisProjectType, RedisTeamType, RedisUser, RedisUserType, UserType } from "../types/custom-types";

export default class RedisHelpers {

    static async getUserInfo(key: string): Promise< RedisUser | undefined> {
        const redisClient = await connectToRedis();
        const user = await redisClient?.get(`auth_token_${key}`);

        if(!user){
            return undefined;
        }
        
        return JSON.parse(user) as RedisUser;
      
    }

    static async setUserInfo(token: string, user: RedisUserType, teams: any, projects: any) {
        const redisClient = await connectToRedis();
        
        //Get all the teams where this user belongs and the roles
        //code here
        //const teams: RedisTeamType[] = [];
        //Get all the projects that this user has permission to
        //code here
        //const projects: RedisProjectType[] = [];
        //Assign and save to redis
        
        await redisClient?.set(`auth_token_${token}`, JSON.stringify({
            user,
            userId: user.userId.toString(),
            token: token,
            teams: teams,
            projects: projects
        }));
        
        return !!redisClient;


    }

    static async signout(key: string) {
        const redisClient = await connectToRedis();

        const user = await redisClient?.del(`auth_token_${key}`);
        
        return !!user;

    }

    static async storeOTP(userId: string, otp: number) {
        const redisClient = await connectToRedis();

        const isUserStored = await redisClient?.set(`auth_otp_${userId}`, JSON.stringify({
            otp: otp
        }), { EX: 60});

        return !!isUserStored;

    }

    static async getStoredOTP(userId: string) {
        const redisClient = await connectToRedis();

        const storedUser = await redisClient?.get(`auth_otp_${userId}`);

        if (!storedUser) return false;
        return JSON.parse(storedUser).otp as number;
    }

}