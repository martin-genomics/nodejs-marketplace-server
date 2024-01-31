import { Router } from "express";
import { AccountController, TeamController } from "../controllers";
import { authMiddleware } from "../http/middlewares";

const userRoutes = Router();
//ACCOUNT ROUTES
userRoutes.post('/create-account', [], AccountController.createAccount )

//TEAM ROUTES
userRoutes.post('/team/create', [authMiddleware], TeamController.createTeam);
userRoutes.post('/team/:teamId/users/create', [], TeamController.createMember);
userRoutes.delete('/team/:teamId/member/remove', [], TeamController.removeMember);
userRoutes.delete('/team/profile/:teamId', [], TeamController.deleteTeam);

export { userRoutes };