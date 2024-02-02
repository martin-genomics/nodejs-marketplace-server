import { Request, Response } from "express";
import { UserModel } from "../models";

export default class AuthController {

    static async login(req: Request, res: Response ) {
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

        if(!user.isEmailVerified) return res.status(401).json({ success: false, message: 'Your account is verified.', data: {action: 'get-otp'}});
        
        //collect user teams
        
        //operations

        //collect user projects

        //generate Json Web Token

        //assign to the redis database

        
        
    }
}