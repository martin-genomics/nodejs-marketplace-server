import { NextFunction, Request, Response } from "express";

import jwt, { JwtPayload } from 'jsonwebtoken';
import { RedisHelpers } from "../../helpers";

interface CustomJwtPayload extends JwtPayload {
    userId: string;
    email: string;
}

export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    
    try {
        const authToken = req.headers['authorization']?.split(' ')[1] as string;

        const jwtUser = jwt.verify(authToken, process.env.JWT_SECRET_KEY as string) as CustomJwtPayload | undefined;

        if(!jwtUser) {
            //User token not found
            return res.status(401).json({
                success: false,
                message: 'You are not logged in',
                data: {
                    action:'/login',

                }
            })
        }
        
        const user =  await RedisHelpers.getUserInfo(authToken);
        if(!user) {
            //User not found in redis;
            return res.status(401).json({
                success: false,
                message: 'Unauthorized Access. Please login again.',
                data: {
                    action: '/login'
                }
            })
        }
        res.locals.userId = user.user.userId;
        res.locals.user = user.user;
        res.locals.teams = user.teams;
        res.locals.projects = user.projects;
        //console.log(res.locals)

        return next();

    } catch(error) {

        return res.status(500).json({
            success: false,
            message: 'User authentication failed, please try again later.',
            error: error
        })
    }
}