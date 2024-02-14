
import dotenv from 'dotenv';

dotenv.config();

import { SendMailOptions, createTransport, TransportOptions } from 'nodemailer';
import { AUTH_CONSTANTS } from '../configs/constants';
import ejs from 'ejs';
import { readFileSync } from 'fs';

const htmlMailBody = readFileSync('./resources/addMemberMailBody.ejs');
const htmlAddMemberMailBody = readFileSync('./resources/addMemberMailBody.ejs');


interface OTPbody {
    subject: string; //mail subject
    // message: string; //mail body
    to: string; //Recipient
    otp: string; //One-Time-Pin
}

export function sendOTP(to: string, subject: string, otp: number): Promise<boolean> {
    const transport = createTransport({
        host: process.env.MAIL_HOST as string,
        //port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER as string,
            pass: process.env.MAIL_PASSWORD as string,
        },
    });

    const mailOptions: SendMailOptions = {
        from: process.env.MAIL_FROM as string,
        to: to,
        subject: subject,
        html: `<h1>Account Verification</h1>
    <div>
        <p>
            The One-Time-Pin you have received will expire in ${AUTH_CONSTANTS.OTP.EXPIRATION_TIME} seconds and do not share this with anyone..+o<br />
            Your verification code is <b style="color:orange;">${otp}</b>
            
        </p>
    </div>`,
    };

    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, error => {
            if (error) {
                console.log('Error Failed to send otp');
                return reject(false);
            }

            resolve(true);
        });
    });
}

export function sendOTPforgotPassword(userId: string, receipient: string, subject: string, otp: string) {
    const transport = createTransport({
        host: process.env.MAIL_HOST as string,
        //port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER as string,
            pass: process.env.MAIL_PASSWORD as string,
        },
    });

    let compiledTemplate = ejs.compile(htmlMailBody.toString());

    const mailOptions: SendMailOptions = {
        from: process.env.MAIL_FROM as string,
        to: receipient,
        subject: subject,
        html: compiledTemplate({ otpData: { code: otp, userId: userId, expiryTime: AUTH_CONSTANTS.OTP.EXPIRATION_TIME } }),
    };

    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, error => {
            if (error) {
                console.log('Error Failed to send otp');
                return reject({
                    success: false,
                    message: 'Error Failed to send otp',
                });
            }

            resolve({
                success: true,
                message: 'OTP code was sent!',
            });
        });
    });
}

export function sendAddTeamMail(body: { userEmail: string, subject: string, generatedPassword: string}): Promise<{success: boolean, message: string}> {

    const transport = createTransport({
        host: process.env.MAIL_HOST as string,
        //port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER as string,
            pass: process.env.MAIL_PASSWORD as string,
        },
    });
    let compiledTemplate = ejs.compile(htmlAddMemberMailBody.toString());

    const mailOptions: SendMailOptions = {
        from: process.env.MAIL_FROM as string,
        to: body.userEmail,
        subject: body.subject,
        html: compiledTemplate({userData: {goToUrl: process.env.GOTO_URL_NEW_MEMBER_EMAIL as string, generatedPassword: body.generatedPassword}})
    };

    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, error => {
            if (error) {
                console.log('Error Failed to send otp');
                return reject({
                    success: false,
                    message: 'Error Failed to send otp',
                });
            }

            resolve({
                success: true,
                message: 'Mail was sent!',
            });
        });
    });
}