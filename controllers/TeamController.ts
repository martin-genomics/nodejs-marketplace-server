import { Request, Response } from "express";
import {TeamModel} from "../models";
import mongoose from "mongoose";

export default class TeamController {
    static async index(req: Request, res: Response) {
        //This controller returns the team details
    }

    static async createTeam(req: Request, res: Response) {
        //This controller enables the owner to create a team
        const team = await TeamModel.findOne({name: req.body['name']});

        if(team) {
            //Reject repeated team names
            return res.status(405).json({
                success: false,
                message: 'Team name exists.',
                data: {
                    action: 'teamName',
                    team: {
                        name: req.body['name']
                    }
                }
            })

        }

        const newTeam = new TeamModel();

        newTeam.name = req.body['name'];
        newTeam.description = req.body['description'];
        newTeam.tagline = req.body['tagline'];
        newTeam.creator = new mongoose.mongo.ObjectId(res.locals.user.userId);
        newTeam.users = [{ userId: new mongoose.mongo.ObjectId(res.locals.user.userId), role: 'OWNER', isDeleted: false}];

        const savedTeam = await newTeam.save();
        if(savedTeam.isNew){
            // Failed to save new user
            return res.status(500).json({
                success: false,
                message: 'A team could not be created.',
                data: {
                    team: newTeam,
                }
            })
        }
        res.json({
            success:true,
            message: 'Team successfully created.',
            data: {
                team: newTeam

            }
        })
    }

    static async joinTeam(req: Request, res: Response) {
        //Allows a user to join a team by invitation

    }

    static async createUser(req: Request, res: Response) {
        //This controller allows the creation of a team member


        res.json({

        })
    }

    static async updateUserRole(req: Request, res: Response) {
        const { userId, newRole } = req.body;
        const { teamId } = req.params;
        try {
            const team = await TeamModel.findById(teamId);
            if (!team) return res.status(404).json({
                success: false,
                message: 'The team was not found.',
                data: {action: 'login'}
            });

            team.users.forEach(user => {
                if (user.userId === userId) user.role = newRole;
            });

            await team.save();

            res.json({
                success: true,
                message: 'The user role was successfully updated. ',
                data: {
                    newRole: newRole,
                }
            })
        }
        catch(error){
            res.status(500).json({
                success: false,
                message: 'Something went wrong while updating user role',
                data: {
                    failedRole: newRole,
                    error: error
                }
            })
        }
    }



    static async removeMember(req: Request, res: Response) {
        //This controller allows the creator of the team to remove a member from the team
    }

    static async deleteTeam(req: Request, res: Response) {
        //This controller allows the owner to delete the team
    }
    
}