import mongoose from "mongoose";

type UserDefinedType  = 'freelancer' | 'buyer';

export type AllowedRoles = 'OWNER' | 'USER' | 'MANAGER' | 'VIEWER' | 'CLIENT';

export interface UserType {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    photo: string;
    userType: UserDefinedType;
    isBlocked: boolean;
    isEmailVerified: boolean;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamUserType {
    userId: mongoose.Types.ObjectId;
    role: string;
    isDeleted: string;
}

export interface TeamType {
    name: string;
    users: TeamUserType[];
    creator: mongoose.Types.ObjectId;
    tagline: string;
    description: string;
    coverImage: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}


export interface WorkingHistoryType {
    teamId: string;
    projectId: string;
    duration: number; //In hours
    createdAt: Date;
    updatedAt: Date;
}

export interface RedisUserType {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: UserDefinedType;
}

export interface RedisTeamType {
    teamId: string;
    role: string;
}

export interface RedisProjectType {
    projectId: string;
}

export interface RedisUser {
    user: RedisUserType;
    teams: RedisTeamType[];
    projects: RedisProjectType[];
}

