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

    static async setUserInfo(token: string, user: RedisUserType) {
        const redisClient = await connectToRedis();
        
        //Get all the teams where this user belongs and the roles
        //code here
        const teams: RedisTeamType[] = [];
        //Get all the projects the projects that this user has permission to
        //code here
        const projects: RedisProjectType[] = [];
        //Assign and save to redis
        
        await redisClient?.set(`auth_token_${token}`, JSON.stringify({
            user: user,
            token: token,
            teams: teams,
            projects: projects
        }));
        
        if(redisClient) return true;
        return false;

    }

    static async signout(key: string) {
        const redisClient = await connectToRedis();

        const user = await redisClient?.del(`auth_token_${key}`);
        
        if(user) return true;
        return false;
    }
}