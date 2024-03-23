import { body, check, param, validationResult } from 'express-validator';
import { ALLOWED_ROLES, TEAM_CONSTANTS, USER_CONSTANTS } from '../../configs/constants';
import permissionsChecker from './Permission';
import authMiddleware from './authMiddleware';
import { NextFunction, Request, Response } from 'express';


const MY_TEAM_CONSTANTS = TEAM_CONSTANTS;
const MY_USER_CONSTANTS = USER_CONSTANTS
const MY_ALLOWED_ROLES = ALLOWED_ROLES;

export async function validateBody(req: Request, res: Response, next: NextFunction) {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(403).json({
            success: false,
            message: 'Request body error.',
            data: {
                errors,
            }
        })
    }

    next();
}

function passwordField(message: string) {
    return check('password', message).isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 0.5,
        pointsForContainingLower: 10,
        pointsForContainingUpper: 10,
        pointsForContainingNumber: 10,
        pointsForContainingSymbol: 10,
    });
}


export const createAccountRequest = [
    body(MY_USER_CONSTANTS.CREATE.FIELDS.FIRSTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.LASTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.EMAIL).isEmail(),
    passwordField('The password you have provided is weak. It must contain alphanumeric [A-z], [0-9] and symbols e.g [? , - ,&] and length of 8 '),
    validateBody
]

export const validateSignInRequest = [
    body(MY_USER_CONSTANTS.CREATE.FIELDS.EMAIL, 'Invalid email address').isEmail(),
    //passwordField('The provided password is incorrect.'),
    validateBody,
]

export const createTeamRequestValidation = [
    authMiddleware,
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.NAME, 'team name minimum letters 3+').isLength({ min: 3}),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.DESCRIPTION).isLength({ max: 1000 }),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.TAGLINE).isLength({min: 5}),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.COVER_IMAGE).isAlpha(),
    validateBody
];

export const createTeamUserRequestValidation = [
    authMiddleware,
    param('teamId', 'Invalid Team Id').isMongoId(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.FIRSTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.LASTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.EMAIL).isEmail(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.PHOTO).isAlpha(),
    validateBody
]

export const updateUserRoleRequestValidation = [
    authMiddleware,
    param('teamId', 'Invalid Team Id').isMongoId(),
    body('newRole', 'New Role provided was invalid').isEmpty()
]

export const teamInvitationRequestValidation = [
    authMiddleware,
    param('teamId', 'Invalid Team Id').isMongoId(),
]
export const removeTeamUserRequestValidation = [
    authMiddleware,
    permissionsChecker(['OWNER']),
    param('userId', 'The id provided does not follow the accepted standard.').isMongoId(),
    validateBody
]

export const teamInfoUpdateRequestValidation = [
    authMiddleware,
    permissionsChecker(['OWNER']),
    param('teamId', 'The team access id is invalid').isMongoId(),
    body('name').optional().isAlpha().optional().isAlphanumeric().optional(),
    body('description').optional().isAlpha().optional().isAlphanumeric().optional(),
    body('tagline').optional().isAlpha().optional().isAlphanumeric().optional(),
    body('creator').optional().isMongoId().optional(),
]

export const teamCoverImageRequestValidation = [
    authMiddleware,
    permissionsChecker(['OWNER']),
    param('teamId', 'The team access id is invalid').isMongoId(),
    body('coverImage', 'Cover image is').isEmpty(),

]
export const updateUserTypeRequestValidation = [authMiddleware, param('profileId').isMongoId(),body('userType').equals('freelancer' || 'buyer'), validateBody]