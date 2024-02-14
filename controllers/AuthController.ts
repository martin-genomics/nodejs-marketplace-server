import { Request, Response } from "express";
import { UserModel } from "../models";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import {RedisHelpers, TeamHelpers} from "../helpers";
import ProjectHelpers from "../helpers/ProjectHelpers";
import otpGenerator from "otp-generator";
import {sendOTP} from "../resources/MailingResource";

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

    static async verifyUser(req: Request, res: Response) {
        const { otp, email } = req.body;
        const user = await UserModel.findOne({email: email, isEmailVerified: false});
        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'This account was not found or it is already verified',
                data: {
                    email: email,
                    providedOTP: otp,
                }

            })

        }

        const storedOtp = await RedisHelpers.getStoredOTP(user._id.toString());
        if(!storedOtp) return res.status(404).json({ success: false, message: 'The otp associated with this account was not found.', data: { action: 'resendCode', email: email}});

        if(!(storedOtp === Number(otp))) return res.json({ success: false, message: 'The code entered is incorrect.', data:{ action: 'attemptResend', email: email, otp: otp}});

        res.json({
            success: true,
            message: 'The account was successfully verified',
            data: {
                action: 'onBoarding',
            }
        })
    }

    static async getOTP(req: Request, res: Response) {
        const { email } = req.body;

        const user = await UserModel.findOne({ email: email, isEmailVerified: false});
        if(!user) return res.status(404).json({ success: false, message: 'This email address was not found or it is already verified.'});

        const otp = otpGenerator.generate(6,{upperCaseAlphabets: false, specialChars: false});
        await RedisHelpers.storeOTP(user._id.toString(), Number(otp));
        const isOTPSent = sendOTP(req.body['email'], 'Account Verification', Number(otp));
        if(!isOTPSent) return res.status(403).json({ success: false, message: 'OTP was not sent', data: { action: 'resendOTP', email: req.body['email']}});

        res.json({
            success: true,
            message: 'An OTP has been sent to your email to verify your account',
            data: {
                action: 'onboarding',
                email: email,
            }
        });
    }

}