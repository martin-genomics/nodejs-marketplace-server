import { Request, Response } from "express";
import { UserModel } from "../models";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import {RedisHelpers, TeamHelpers} from "../helpers";
import ProjectHelpers from "../helpers/ProjectHelpers";

dotenv.config();
export default class AuthController {

    static async signIn(req: Request, res: Response ) {
        const user = await UserModel.findOne({ email: req.body['email']});

        if(!user) {
            //Handle user email absence from the database
            return res.status(404).json({
                success: false,
                message: 'The email provided does not exist in our system.',
                data: {
                    suggestAction: 'sign-up'
                }
            })
        }

        if(user.isBlocked) return res.status(401).json({ success: false, message: 'Your account has been blocked.', data: {action: 'accountBlock'}});

        if(!user.isEmailVerified) return res.status(401).json({ success: false, message: 'Your account is not verified.', data: {action: 'get-otp'}});
        
        //collect user teams
        const teams = await TeamHelpers.getUserTeams(user._id.toString());
        //operations

        //collect user projects
        const projects = await ProjectHelpers.getUserProjects(user._id.toString())
        //generate Json Web Token
        const token = jwt.sign({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        },process.env.JWT_SECRET_KEY as string,
            );
        //assign to the redis database

        const redisUser = await RedisHelpers.setUserInfo(token,
            {userId: user._id.toString(), email: user.email, lastName: user.lastName, firstName: user.firstName, userType: 'freelancer' }, teams, projects)

        if(!redisUser) {

            return res.status(500).json({
                success: false,
                message: 'Failed to process your login request.',
                data: {
                    action: 'signIn'
                }
            })
        }

        return  res.json({
            success: true,
            message: 'Login was successful.',
            data: {
                token,
                action: 'home',

            }
        });

        
    }
}