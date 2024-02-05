import mongoose, {model, Schema} from "mongoose";
import {ProjectModelType} from "../types/custom-types";



const ProjectUserSchema = new Schema<{userId: string}>({
    userId: mongoose.Types.ObjectId
},
    {_id: false})

const projectSchema = new Schema<ProjectModelType>({
    name: String,
    users: [ProjectUserSchema],
    creator: mongoose.Types.ObjectId,
    teamId: mongoose.Types.ObjectId,
    updatedAt: { type: Date, default: null},
    createdAt: { type: Date, default: Date.now },
})


const ProjectModel = model<ProjectModelType>('projects', projectSchema);

export default ProjectModel;