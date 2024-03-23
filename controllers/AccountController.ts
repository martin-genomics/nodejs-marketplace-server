import { Request, Response } from 'express';
import {ProjectModel, TeamModel, UserModel} from '../models';
import bcrypt from 'bcryptjs';
import otpGenerator from 'otp-generator';
import {RedisHelpers} from "../helpers";
import {sendOTP} from "../resources/MailingResource";
import * as fs from "fs/promises";
import {existsSync} from "fs";
import fileUpload from "express-fileupload";
import path from "path";
export default class AccountController {
    static async  index(req: Request, res: Response) {

        const user = await UserModel.findById(res.locals.userId, { password: false });

        if(!user){
            //perform some operations if user id was not found
            return res.status(401).json({
                success: false,
                message: 'User authentication failed, Login required',
                data: {
                    action: 'login'
                }
            })
        }

        res.json(user.toJSON());
        
        
    }

    static async createAccount(req: Request, res: Response) {


        const user = await UserModel.findOne({ email: req.body['email']});
        if(user) {
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
        if(savedUser.isNew){
            // Failed to save new user
            return res.status(500).json({
                success: false,
                message: 'An account could not be created.',
                data: {
                    email: req.body['email']
                }
            })
        }
        const otp = otpGenerator.generate(6,{upperCaseAlphabets: false, specialChars: false});
        await RedisHelpers.storeOTP(newUser._id.toString(), Number(otp));
        const isOTPSent = sendOTP(req.body['email'], 'Account Verification', Number(otp));
        if(!isOTPSent) return res.status(403).json({ success: false, message: 'Account created but OTP was not sent', data: { action: 'resendOTP', email: req.body['email']}});

        //New user was created
        res.json({
            success: true,
            message: 'Your account was successfully created and an OTP has been sent to your email to verify your account',
            data: {
                action: 'verification',
                email: req.body['email']
            }
        });
        
    }

    static async updateUserType(req: Request, res: Response){
        const user = await UserModel.findById(res.locals.userId);
        if(!user){

            return res.status(404).json({
                success: false,
                message: 'This account was not found. You will be redirected to login again',
                data: {

                }
            })
        }

        //assign user to new user type ( 'FREELANCER' | 'BUYER')
        user.userType = req.body['userType'];

        await user.save();

        res.json({
            success: true,
            message: 'User type updated to ' + req.body['userType'],
            data: {

            }
        });
    }

    static async updateUserPhoto(req: Request, res: Response){
        const { userId } = res.locals;
        const user = await UserModel.findById(userId);
        //const user = await UserModel.findById(userId);
        if(!user) return res.json({success: true, message: 'This user account does not exist.', data:{action: 'login'}});

        const file = req.files;
        if(!file) return res.status(500).json({ success: false, message: 'File upload has failed'});

        //WRITE PHOTO PATH
        //console.log(req.files)

        const { name, data, size, mimetype} = file['userPhoto'] as fileUpload.UploadedFile;
        const FILE_PATH = path.join(process.env.USER_MEDIA_PATH as string, userId);

        let completePath = path.join(FILE_PATH, 'images');

        if(!existsSync(FILE_PATH)) await fs.mkdir(FILE_PATH);
        if(!existsSync(completePath)) await fs.mkdir(completePath);

        //console.log(completePath, existsSync(FILE_PATH))
        const fullPath = path.join(completePath ,'profile-' + userId + '.' + mimetype.split('/')[1])
        await fs.writeFile(fullPath, data);
        let filePath = path.join('users',userId,'images', 'profile-' + userId + '.' + mimetype.split('/')[1]);
        user.photo = filePath;
        //console.log(filePath)
        await user.save();

        res.json({success: true, message: 'The profile photo was updated', data: { photoUrl: filePath}});
    }

    static async updateUserInfo(req: Request , res: Response){
        const { userId } = res.locals;

        const user = await UserModel.findById(userId);
        if(!user){

            return res.status(404).json({
                success: false,
                message: 'This account was not found. You will be redirected to login again',
                data: {

                }
            })
        }

        //proceed with the update
        await UserModel.updateOne({email: user.email}, req.body);
        user.updatedAt = new Date();
        res.json({
            success: true,
            message: 'The user details have been updated.',
            data: {

            }
        })

    }

    static async deleteAccount(req: Request, res: Response) {
        const { userId } = res.locals;
        const user = await UserModel.findById(userId);
        //collect all the teams created by this and prepare for deletion
        const teams = await TeamModel.find({creator: userId});
        //collect all the projects created by this user;
        const projects = await ProjectModel.find({creator: userId});

        for(let project of projects){
            //delete each single project
            project.deleteOne();
        }


        for(let team of teams) {
            //delete every single team
            team.deleteOne();
        }

        //Finally delete the user account;
        await UserModel.findByIdAndDelete(userId);

        res.json({
            success: true,
            message: 'Your account has been deleted and all the associated teams and projects.',
            data: {

            }
        })
    }
}
