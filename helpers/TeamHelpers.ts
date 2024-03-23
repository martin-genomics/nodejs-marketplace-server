import {TeamModel, UserModel} from "../models";
import mongoose from "mongoose";
import {AllowedRoles} from "../types/custom-types";
import { generate as passwordGenerator } from "generate-password";
import bcrypt from "bcryptjs";

export default class TeamHelpers {
    static async isMember(teamId: string, userId: string): Promise<boolean> {
        const team = await TeamModel.findById(teamId);
        if(!team) return false;
        return team.users.some( user => user.userId.toString() === userId);

    }

    static async getUserTeams(userId: string) {
        const teams = await TeamModel.find({
            users: {
                $elemMatch: {
                    userId: { $in: new mongoose.mongo.ObjectId(userId) },
                }

            }
        });
        //console.log('------------ ',teams[0])
        let user_teams: { teamId: string; role: string; }[] = [];
        teams.map( team => {
            team.users.forEach( user => {

               if( user.userId.toString() === userId && !user.isDeleted ) {
                   user_teams.push({
                       teamId: team._id.toString(),
                       role: user.role,

                   })
               }

            });
        });

        return user_teams;


    }

    static async addTeamMember(teamId: string,exists: boolean ,user: {firstName: string, lastName: string, email: string, role: AllowedRoles}): Promise<{success: boolean, email?: string, password?: string}> {
        if(exists) {
            console.log('Already a member');
            const team = await TeamModel.findById(teamId);
            if (!team) return {success: false };
            const client = await UserModel.findOne({ email: user.email});

            team.users.push({ userId: client!._id, role: user.role, isDeleted: false});
            await team.save();
            return { success: true, email: user.email };

        }

        const generatedPassword = passwordGenerator({
            length: 10,
            numbers: true,
            symbols: true,
            uppercase: true,
            lowercase: true,
        })

        const newUser = new UserModel();
        newUser.firstName = user.firstName;
        newUser.lastName = user.lastName;
        newUser.email = user.email;
        newUser.password = bcrypt.hashSync(generatedPassword.toString(),11);
        newUser.isEmailVerified = true;
        await newUser.save();
        const team = await TeamModel.findById(teamId);
        if (!team) return {success: false };
        team.users.push({ userId: newUser._id, role: user.role, isDeleted: false});

        await team.save();
        return { success: true, email: user.email, password: generatedPassword.toString()};


    }
}
