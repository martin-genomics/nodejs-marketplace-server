import { Router } from "express";
import { AccountController, TeamController } from "../controllers";
import { authMiddleware } from "../http/middlewares";
import { 
    createAccountRequest,
    createTeamRequestValidation,
    createTeamUserRequestValidation,
    removeTeamUserRequestValidation,
 } from "../http/middlewares/validationMiddleares";

const userRoutes = Router();
//ACCOUNT ROUTES
userRoutes.post('/sign-up', createAccountRequest, AccountController.createAccount );

//TEAM ROUTES
userRoutes.post('/team/create', createTeamRequestValidation, TeamController.createTeam);
userRoutes.post('/team/:teamId/users/create', createTeamUserRequestValidation, TeamController.createMember);
userRoutes.delete('/team/:teamId/users/:userId/delete', removeTeamUserRequestValidation , TeamController.removeMember);
userRoutes.delete('/team/:teamId/delete', authMiddleware, TeamController.deleteTeam);


export { userRoutes };