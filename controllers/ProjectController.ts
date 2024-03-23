import { Request, Response } from "express";
import {ProjectModel, TeamModel, UserModel} from "../models";
import mongoose from "mongoose";
import teamModel from "../models/TeamModel";
import {ProjectHelpers, TeamHelpers} from "../helpers";
import {existsSync} from "fs";
import fs from "fs/promises";
import fileUpload from "express-fileupload";
import path from "path";


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


        const newClient = await UserModel.findOne({email: clientEmail});
        if(!newClient) return res.json({ success: false, message: 'This client account was not found', data: {}})

        const r = await TeamHelpers.addTeamMember(teamId, true, {firstName: newClient.firstName, lastName: newClient.lastName, email: newClient.email, role: "CLIENT" });
        if(!r.success) return res.json({ success: false, message: 'Failed to add a new team in the database.', data: {}})
        newProject.users = [new mongoose.mongo.ObjectId(userId), newClient._id];
        await newProject.save();

        res.json({
            success: true,
            message: 'The project has been created'
        })

    }

    static async addProjectMember(req: Request, res: Response) {
        const { email } = req.body;
        const { teamId, projectId } = res.locals;
        const user = await UserModel.findOne({email: email});
        if(!user) return res.status(404).json({ success: false, message: 'The provided email is not associated with any account on the platform.', data: {email: email}})

        const isMember = await TeamHelpers.isMember(teamId, user._id.toString());
        if(!isMember) return res.status(409).json({ success: false, message: 'The provided email is not associated with any team member.', data: {email: email}})

        const isProjectMember = await ProjectHelpers.isMember(teamId, user._id.toString());
        if(isProjectMember) return res.status(409).json({ success: false, message: 'Is already a member of the project.', data: {email: email}})

        const addMemberResponse = await ProjectHelpers.addMember(email, projectId, teamId);

        if(!addMemberResponse.success) return res.json(addMemberResponse);

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
        const { projectId, userId, teamId } = res.locals;
        const project = await ProjectModel.findById(projectId);
        //const user = await UserModel.findById(userId);
        if(!project) return res.json({success: true, message: 'This project does not exist.', data:{action: 'login'}});

        const file = req.files;
        if(!file) return res.status(500).json({ success: false, message: 'File upload has failed'});

        //WRITE PHOTO PATH
        //console.log(req.files)

        const { name, data, size, mimetype} = file['projectCoverImage'] as fileUpload.UploadedFile;
        const FILE_PATH = path.join(process.env.DEFAULT_MEDIA_PATH as string,teamId);
        console.log(FILE_PATH)
        let completePath = path.join(FILE_PATH, 'projects');
        let completePath2 = path.join(completePath, projectId);
        let completePath3 = path.join(completePath2, 'images');
        if(!existsSync(FILE_PATH)) await fs.mkdir(FILE_PATH);
        if(!existsSync(completePath)) await fs.mkdir(completePath);
        if(!existsSync(completePath)) await fs.mkdir(completePath2);
        if(!existsSync(completePath3)) await fs.mkdir(completePath3);


        console.log(completePath, existsSync(FILE_PATH))
        const fullPath = path.join(completePath3 ,'cover-' + project + '.' + mimetype.split('/')[1])
        await fs.writeFile(fullPath, data);
        let filePath = path.join('teams','projects',projectId,'images', 'cover-' + projectId + '.' + mimetype.split('/')[1]);
        project.projectCover = filePath;
        console.log(filePath)
        await project.save();
        res.json({ success: true, message: 'Profile photo successfully updated', data: { photo: filePath }})

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