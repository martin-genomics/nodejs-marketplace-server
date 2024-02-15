import {Request, Response} from "express";
import {ProjectModel, TeamModel, UserModel} from "../models";
import mongoose from "mongoose";
import {TeamHelpers} from "../helpers";
import {sendAddTeamMail} from "../resources/MailingResource";
import {existsSync} from "fs";
import fs from "fs/promises";
import { IncomingForm } from 'formidable'
import fileUpload from "express-fileupload";
import * as path from "path";
import {userRoutes} from "../routes/api-routes";

export default class TeamController {
    static async index(req: Request, res: Response) {
        //This controller returns the team details
        const teams = await TeamHelpers.getUserTeams(res.locals.user.user.userId);
        console.log(teams, res.locals.user.user)
        res.json({});
    }

    static async getTeamMember(req: Request, res: Response) {
        if(!(await TeamHelpers.isMember(req.params['teamId'], req.params['userId']))){

            return res.status(404).json({
                success: false,
                message: 'This member does not exist',
                data: {

                }
            })

        }

        const user = await UserModel.findById(req.params['userId']).select(['-_id','-password', '-__v'])

        if(!user) return res.status(404).json({success: false, message: 'This is not registered in the system.'})

        res.json({
            success: true,
            message: 'Member details collected',
            data: {
                member: user.toJSON()
            }
        })
    }

    static async getTeamMembers(req: Request, res: Response) {
        const team = await TeamModel.findById(req.params['teamId']);
        if(!team){
            return res.status(404).json({
                success: false,
                message: 'The team was not found',
                data: {
                    action: 'login',
                }
            })
        }

        let teamMembers = [];
        for (const member of team.users) {
            let user = await UserModel.findById(member.userId).select(['-_id', '-password', '-__v']);
            if(user) teamMembers.push(user);

        }

        res.json({
            success: true,
            message: 'Users collected',
            data: {
                members: teamMembers,
            }
        })

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
        newTeam.creator = new mongoose.mongo.ObjectId(res.locals.user.user.userId);
        newTeam.users = [{ userId: new mongoose.mongo.ObjectId(res.locals.user.user.userId), role: 'OWNER', isDeleted: false}];

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
        const team = await TeamModel.findById(req.params['teamId']);

        console.log('new user data')
        if (!team) return res.status(404).json({
            success: false,
            message: 'The team was not found.',
            data: {action: 'login'}
        });

        const user = await UserModel.findOne({email: req.body['email']});
        if (!user) {
            //add a new user to the team
            const isAdded = await TeamHelpers.addTeamMember( req.params['teamId'],false, {role: req.body['role'].toUpperCase(), email: req.body['email'], lastName: req.body['lastName'],firstName: req.body['firstName']});
            if(!isAdded.success){
                return res.status(404).json({
                    success: false,
                    message: 'Something went wrong while adding user to the team ',
                })
            }

            //@ts-ignore
            const status = await sendAddTeamMail({userEmail: isAdded.email, generatedPassword:isAdded.password ,subject: 'Marketplace - Team Membership'});

            if(!status.success) return res.json({success: false, message: 'Failed to send an email to the user but an account was created for the member', data: { action: 'failed-mails'} })
            return res.status(200).json({
                success: true,
                message: 'New user was created and email delivered',
            })


        }


        if(await TeamHelpers.isMember(req.params['teamId'], user._id.toString())) {
            return res.status(409).json({
                success: false,
                message: 'This user is already a member of the team.',
                data: {
                    user:req.body
                }
            })

        }


        res.json({

        })
    }

    static async updateUserRole(req: Request, res: Response) {
        const { newRole } = req.body;
        const { teamId , userId} = req.params;

        try {
            const team = await TeamModel.findById(teamId);
            if (!team) return res.status(404).json({
                success: false,
                message: 'The team was not found.',
                data: {action: 'login'}
            });

            team.users.forEach(user => {
                if (user.userId.toString() === userId) user.role = newRole;
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

    static async updateTeamCoverImage(req: Request, res: Response){
        const { teamId } = res.locals;
        const team = await TeamModel.findById(teamId);
        //const user = await UserModel.findById(userId);
        if(!team) return res.json({success: true, message: 'This team does not exist.', data:{action: 'login'}});

        const file = req.files;
        if(!file) return res.status(500).json({ success: false, message: 'File upload has failed'});

        //WRITE PHOTO PATH
        //console.log(req.files)

        const { name, data, size, mimetype} = file['teamCoverImage'] as fileUpload.UploadedFile;
        const FILE_PATH = process.env.DEFAULT_TEAM_COVER_IMAGE as string + teamId;
        console.log(FILE_PATH)
        let completePath =path.join(FILE_PATH, 'images')
        if(!existsSync(FILE_PATH)) await fs.mkdir(FILE_PATH);
        if(!existsSync(completePath)) await fs.mkdir(completePath);

        console.log(completePath, existsSync(FILE_PATH))
        const fullPath = path.join(completePath ,'cover-' + teamId + '.' + mimetype.split('/')[1])
        await fs.writeFile(fullPath, data);
        let filePath = path.join('teams',teamId,'images', 'cover-' + teamId + '.' + mimetype.split('/')[1]);
        team.teamCoverImage = filePath;
        await team.save();
        res.json({ success: true, message: 'Profile photo successfully updated', data: { photo: filePath }})

    }

    static async updateTeamInfo(req: Request , res: Response){
        const { userId, teamId } = res.locals;

        const team = await TeamModel.findById(teamId);

        if(!team){

            return res.status(404).json({
                success: false,
                message: 'This team was not found. You will be redirected to login again',
                data: {

                }
            })
        }

        //proceed with the update
        await TeamModel.updateOne({_id: teamId}, req.body);
        team.updatedAt = new Date();
        await team.save();
        res.json({
            success: true,
            message: 'The user details have been updated.',
            data: {

            }
        })

    }

    static async removeMember(req: Request, res: Response) {
        //This controller allows the creator of the team to remove a member from the team
        const { teamId , userId} = req.params;

        try {
            const team = await TeamModel.findById(teamId);
            if (!team) return res.status(404).json({
                success: false,
                message: 'The team was not found.',
                data: {action: 'login'}
            });

            team.users.forEach(user => {
                if (user.userId.toString() === userId) user.isDeleted = true;
            });

            await team.save();

            res.json({
                success: true,
                message: 'The member has been deleted from the organization. ',
                data: {

                }
            })
        }
        catch(error){
            res.status(500).json({
                success: false,
                message: 'Something went wrong while deleting a member',
                data: {

                    error: error
                }
            })
        }
    }

    static async deleteTeam(req: Request, res: Response) {
        //This controller allows the owner to delete the team
        console.log(res.locals)
        const projects = await ProjectModel.find({teamId: req.params['teamId']});
        for ( let project of projects) {
            //Removes all the projects associated with the team.
            console.log('Removing project: ', project.name, ' with id: ', (await project)._id.toString());
            (await project).deleteOne();
        }


        const team = await TeamModel.findOneAndDelete({creator: res.locals.users});

        console.log(team)
        if(!team) return res.status(404).json({ success: false, message: 'The team was not deleted', data: { action: 'login'}});

        res.json({
            success: true,
            message: 'The team was deleted and the associated history to it.',
            data: {

            }
        })

    }
    
}