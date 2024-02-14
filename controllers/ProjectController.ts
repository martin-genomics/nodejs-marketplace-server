import { Request, Response } from "express";
import {ProjectModel, UserModel} from "../models";
import mongoose from "mongoose";
import teamModel from "../models/TeamModel";
import {ProjectHelpers, TeamHelpers} from "../helpers";
import {existsSync} from "fs";
import fs from "fs/promises";


export default class ProjectController {

    static async index(req: Request, res: Response) {
        const { projectId, teamId } = req.params;
        const project = await ProjectModel.findOne({teamId: teamId, _id: projectId});
        if(!project) return res.status(404).json({success: false, message: 'The project was not found'});

        const members = [];
        for(let projectMemberId of project.users) {
            let user = await UserModel.findById([projectMemberId]).select(['-password']);
            user? members.push(user): false;
        }



        res.json({
            success: true,
            message: 'The project has been fetched',
            data: {
                project: project.toJSON(),
                users: members
            }
        })


    }

    static async createProject(req: Request, res: Response) {
        const { userId } = res.locals;
        const { teamId } = req.params;
        const { name, rate, cost, clientEmail } = req.body;


        const newProject = new ProjectModel();
        newProject.name = name;
        newProject.wage = { rate: rate, cost: cost, totalCost: 0}
        newProject.teamId = new mongoose.mongo.ObjectId(teamId);
        newProject.creator = new mongoose.mongo.ObjectId(userId);


        await newProject.save();
        const newClient = await UserModel.findOne({email: clientEmail});
        if(!newClient) return res.json({ success: false, message: 'This client account was not found', data: {}})
        await TeamHelpers.addTeamMember(teamId, true, {firstName: newClient.firstName, lastName: newClient.lastName, email: newClient.email, role: "CLIENT" })
        res.json({
            success: true,
            message: 'The project has been created'
        })

    }

    static async addProjectMember(req: Request, res: Response) {
        const { email } = req.body;
        const { teamId, projectId} = res.locals;
        const addMemberResponse = await ProjectHelpers.addMember(email, projectId, teamId);

        if(!addMemberResponse.success) return res.status(404).json(addMemberResponse);

        res.json(addMemberResponse)
    }

    static async projectActivation(req: Request, res: Response) {
        const { teamId, projectId} = res.locals;
        const { projectActive } = req.body;
        const project = await ProjectModel.findOne({ _id: projectId, teamId: teamId});
        if(!project) return res.status(404).json({ success: false, message: 'The project was not found'});

        project.isActive = projectActive;
        await project.save();
        res.json({
            success: true,
            message: (project.isActive)? 'The project is now activated.': 'The project is deactivated',
            data: {
                project
            }
        })

    }

    static async updateProject(req: Request, res: Response) {
        /***
         This controller method updates the properties a given project in the url query parameters.
         ***/


        res.json({});
    }

    static async updateProjectCoverImage(req: Request, res: Response){
        const { userId } = res.locals;
        const user = await UserModel.findById(userId);
        if(!user) return res.json({success: true, message: 'This account does not exist.', data:{action: 'login'}});

        //WRITE PHOTO PATH
        console.log(req.files)
        if(!req.files) return res.status(404).json({ success: false, message: 'No file found'});
        //@ts-ignore
        const { name, data, size, mimetype} = req.files[0];
        const FILE_PATH = process.env.USER_PROFILE_PHOTO_PATH as string + user._id.toLocaleString()
        if(!existsSync(FILE_PATH)) await fs.mkdir(FILE_PATH);
        const fullPath = FILE_PATH + user._id.toString() + mimetype.split('/')[1]
        await fs.writeFile(fullPath, data);


        res.json({ success: true, message: 'Profile photo successfully updated', data: { photo: fullPath }})

    }

    static async deleteProject(req: Request, res: Response) {
        /***
         Deletes the project belonging to a particular team.
         ***/
        const { teamId, projectId } = res.locals;
        try {

            const project = await ProjectModel.findOneAndDelete({teamId: teamId, _id: projectId}).select(['-_id', '-users'])

            return res.json({
                success: true,
                message: 'This project was successfully deleted.',
                data: {
                    project: project,
                }
            })
        } catch (error) {
            return res.json({
                data: {
                    error: error,
                },
                message: 'Something went wrong while deleting the project',
                success: false
            })
        }
    }



}