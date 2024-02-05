import { Router } from "express";
import {AccountController, AuthController, ProjectController, TeamController} from "../controllers";
import { authMiddleware } from "../http/middlewares";
import {
    createAccountRequest,
    createTeamRequestValidation,
    createTeamUserRequestValidation,
    removeTeamUserRequestValidation,
    teamInvitationRequestValidation,
    updateUserRoleRequestValidation,
    validateSignInRequest,
} from "../http/middlewares/validationMiddleares";
import permissionsChecker from "../http/middlewares/Permission";
import {ALLOWED_ROLES} from "../configs/constants";
const userRoutes = Router();

//AUTH ROUTES
userRoutes.post('/sign-in', validateSignInRequest, AuthController.signIn)

//ACCOUNT ROUTES
userRoutes.get('/profile/:profileId');
userRoutes.patch('/profile/:profileId/update/photo')
userRoutes.patch('/profile/:profileId/update/userInfo')
userRoutes.post('/sign-up', createAccountRequest, AccountController.createAccount );

//TEAM ROUTES
userRoutes.post('/team/create', createTeamRequestValidation, TeamController.createTeam);
userRoutes.post('/team/:teamId/users/add', createTeamUserRequestValidation,permissionsChecker(['OWNER', 'MANAGER']), TeamController.createUser);
userRoutes.post('/team/:teamId/users/:userId/updateRole', updateUserRoleRequestValidation,permissionsChecker(['OWNER', 'MANAGER']), TeamController.updateUserRole);
userRoutes.post('/team/:teamId/users/joinTeam', teamInvitationRequestValidation, TeamController.joinTeam);
userRoutes.delete('/team/:teamId/users/:userId/delete', removeTeamUserRequestValidation ,permissionsChecker(['OWNER']), TeamController.removeMember);
userRoutes.delete('/team/:teamId/delete', authMiddleware,permissionsChecker(['OWNER']), TeamController.deleteTeam);

//PROJECTS ROUTES
userRoutes.get('/team/:teamId/projects',authMiddleware,permissionsChecker(['OWNER', 'USER', 'VIEWER','MANAGER']), ProjectController.index);
userRoutes.get('/team/:teamId/projects/:projectId', authMiddleware,permissionsChecker(['OWNER', 'USER', 'VIEWER','MANAGER']), ProjectController.index);
userRoutes.post('/team/:teamId/projects/:projectId/create', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), ProjectController.createProject);
userRoutes.post('/team/:teamId/projects/:projectId/addUser', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), ProjectController.addUser);
userRoutes.put('/team/:teamId/projects/:projectId', authMiddleware,permissionsChecker(['OWNER','MANAGER']), ProjectController.updateProject );
userRoutes.put('/team/:teamId/projects/:projectId/activate', authMiddleware,permissionsChecker(['OWNER']), ProjectController.activateProject);
userRoutes.put('/team/:teamId/projects/:projectId/deactivate', authMiddleware,permissionsChecker(['OWNER']), ProjectController.deactivateProject);
userRoutes.delete('/team/:teamId/projects/:projectId/delete', authMiddleware,permissionsChecker(['OWNER']), ProjectController.deleteProject);



export { userRoutes };