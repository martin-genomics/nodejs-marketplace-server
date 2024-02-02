import { Request, Response } from 'express';
import { UserModel } from '../models';
import bcrypt from 'bcryptjs';
export default class AccountController {
    static async  index(req: Request, res: Response) {
        
        const user = await UserModel.findById(res.locals.userId, { password: false });
        
        if(!user){
            //perform some operations if user id was not found
            return res.status(401).json({
                success: false,
                message: 'User authentification failed, Login required',
                data: {
                    action: 'login'
                }
            })
        }

        res.json(user.toJSON());
        
        
    }

    static async createAccount(req: Request, res: Response) {
        const user = UserModel.findOne({ email: req.body['email']});
        
        if(!user) {
            //Ignore an existing user
            return res.status(403).json({
                success: false,
                message: 'This email address is already associated with an account.',
                data: {
                    email: req.body['email']
                }
            });
        }

        const newUser = new UserModel({
            firstName: req.body['firstName'],
            lastName: req.body['lastName'],
            email: req.body['email'],
            password: bcrypt.hashSync(req.body['password'], 11)
        });

        //Save a new in the database
        const savedUser = await newUser.save();
        if(!savedUser.isNew){
            // Failed to save new user
            return res.status(500).json({
                success: false,
                message: 'An account could not be created.',
                data: {
                    email: req.body['email']
                }
            })
        }

        //New user was created
        res.json({
            success: false,
            message: 'Your account was succesfully.',
            data: {
                email: req.body['email']
            }
        });
        
    }
}
