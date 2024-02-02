import mongoose, { Schema, model } from 'mongoose';
import { TeamType, TeamUserType } from '../types/custom-types';



const teamUserSchema = new Schema<TeamUserType>({
    userId: mongoose.Types.ObjectId,
    role: String,
    isDeleted: Boolean,
},
{
    _id: false
}
);

const teamSchema = new Schema<TeamType>({
    name: String,
    coverImage: String,
    description: String,
    tagline: String,
    users: { type: [teamUserSchema], default: []},
    isActive: { type: Boolean, default: true},
    creator: mongoose.Types.ObjectId,
    createdAt: {type: Date, default: Date.now },
    updatedAt: {type: Date, default: null }
});

const TeamModel = model<TeamType>('teams', teamSchema);

export default TeamModel;
