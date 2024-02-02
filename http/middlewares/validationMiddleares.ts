import { body, check, param, validationResult } from 'express-validator';
import { ALLOWED_ROLES, TEAM_CONSTANTS, USER_CONSTANTS } from '../../configs/constants';
import permissionsChecker from './Permission';
import authMiddleware from './authMiddleware';
import { NextFunction, Request, Response } from 'express';

const MY_TEAM_CONSTANTS = TEAM_CONSTANTS;
const MY_USER_CONSTANTS = USER_CONSTANTS
const MY_ALLOWED_ROLES = ALLOWED_ROLES;

async function validateBody(req: Request, res: Response, next: NextFunction) {
    
    const errors = validationResult(req);
    console.log(errors, 'data', req.body)
    if(!errors) {
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

const passwordField = check('password', 'The password you have provided is weak. It must contain alphanumeric [A-z], [0-9] and symbols e.g [? , - ,&] and length of 8 ').isStrongPassword({
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

export const createAccountRequest = [
    body(MY_USER_CONSTANTS.CREATE.FIELDS.FIRSTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.LASTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.EMAIL).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.PHOTO).isAlpha(),
    passwordField,
    validateBody
]

export const createTeamRequestValidation = [
    authMiddleware,
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.NAME).isAlpha(),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.DESCRIPTION).isAlpha(),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.TAGLINE).isAlpha(),
    body(MY_TEAM_CONSTANTS.CREATION.FIELDS.COVER_IMAGE).isAlpha(),
    validateBody
];

export const createTeamUserRequestValidation = [
    authMiddleware,
    body(MY_USER_CONSTANTS.CREATE.FIELDS.FIRSTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.LASTNAME).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.EMAIL).isAlpha(),
    body(MY_USER_CONSTANTS.CREATE.FIELDS.PHOTO).isAlpha(),
    validateBody
]

export const removeTeamUserRequestValidation = [
    authMiddleware,
    permissionsChecker(['OWNER']),
    param('userId', 'The id provided does not follow the accepted standard.').isMongoId(),
    validateBody
]

