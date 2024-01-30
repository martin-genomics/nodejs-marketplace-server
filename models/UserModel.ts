import mongoose, { Schema } from "mongoose";
import { UserType } from "../types/custom-types";
import { USER_CONSTANTS } from "../configs/constants";

const userSchema = new Schema<UserType>( {
    firstName: String,
    lastName: String,
    email: String,
    photo: { type: String, default: USER_CONSTANTS.defaultPhotoPathUrl},
    isEmailVerified: {type: Boolean, default: false },
    isBlocked: {type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    password: String,
    updatedAt: { type: Date, default: null }
});

const UserModel = mongoose.model<UserType>('users', userSchema);
export default UserModel;