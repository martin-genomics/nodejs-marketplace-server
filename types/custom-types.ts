import mongoose from "mongoose";

type UserDefinedType  = 'freelancer' | 'buyer';

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

export interface TeamType {
    name: string;
    users: mongoose.Types.ObjectId[],
    creator: mongoose.Types.ObjectId,
    description: string;

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

export type AllowedRoles = 'OWNER' | 'USER' | 'MANAGER' | 'VIEWER' | 'CLIENT'