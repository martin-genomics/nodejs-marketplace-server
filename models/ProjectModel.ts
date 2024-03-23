import mongoose, {model, Schema} from "mongoose";
import {ProjectModelType} from "../types/custom-types";



const ProjectUserSchema = new Schema<{userId: string}>({
    userId: mongoose.Types.ObjectId
},
    {_id: false})

const ProjectWageSchema = new Schema<{rate: string,cost: number, totalCost: number }>({
        rate: String,
        cost: Number,
        totalCost: Number
    },
    {_id: false})


const projectSchema = new Schema<ProjectModelType>({
    name: String,
    projectCover: {type: String, default: process.env.DEFAULT_PROJECT_COVER_PATH},
    users: [ProjectUserSchema],
    creator: mongoose.Types.ObjectId,
    teamId: mongoose.Types.ObjectId,
    wage: ProjectWageSchema,
    updatedAt: { type: Date, default: null},
    createdAt: { type: Date, default: Date.now },
})


const ProjectModel = model<ProjectModelType>('projects', projectSchema);

export default ProjectModel;