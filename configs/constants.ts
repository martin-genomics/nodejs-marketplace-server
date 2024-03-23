import {AllowedRoles} from "../types/custom-types";

export const ALLOWED_ROLES = {
    USER: 'USER',
    OWNER: 'OWNER',
    CLIENT: 'CLIENT',
    MANAGER: 'MANAGER',
    VIEWER: 'VIEWER',
}

export const USER_CONSTANTS = {
    defaultPhotoPathUrl: '',
    CREATE: {
        FIELDS: {
            FIRSTNAME: 'firstName',
            LASTNAME: 'lastName',
            EMAIL: 'email',
            PHOTO: 'photo',
            PASSWORD: 'password',
            IS_EMAIL_VERIFIED: 'isEmailVerified',
            IS_BLOCKED: 'isBlocked'
        }
    }
}

export const TEAM_CONSTANTS = {
    CREATION: {
        FIELDS: {
            NAME:'name',
            DESCRIPTION: 'description',
            TAGLINE: 'tagline',
            COVER_IMAGE: 'coverImage',
        }
    },
}

export const AUTH_CONSTANTS = {
    OTP :{
        EXPIRATION_TIME: 60, //IN SECONDS
        FORGOT_PASSWORD_TIME: 3600
    }
}