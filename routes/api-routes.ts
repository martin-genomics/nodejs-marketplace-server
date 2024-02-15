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
    updateUserTypeRequestValidation, teamInfoUpdateRequestValidation, teamCoverImageRequestValidation,
} from "../http/middlewares/validationMiddleares";
import permissionsChecker from "../http/middlewares/Permission";

const userRoutes = Router();

//AUTH ROUTES
userRoutes.post('/sign-in', validateSignInRequest, AuthController.signIn)
userRoutes.post('/verify-otp', AuthController.verifyUser );
userRoutes.get('/get-otp', AuthController.getOTP);

//ACCOUNT ROUTES
userRoutes.get('/profile',authMiddleware, AccountController.index);
userRoutes.patch('/profile/:profileId/update/photo', authMiddleware, AccountController.updateUserPhoto);
userRoutes.patch('/profile/:profileId/update/userInfo', authMiddleware, AccountController.updateUserInfo);
userRoutes.put('/profile/:profileId/update/userType', updateUserTypeRequestValidation, AccountController.updateUserType);
userRoutes.post('/sign-up', createAccountRequest, AccountController.createAccount );
userRoutes.delete('/profile/delete', authMiddleware, AccountController.deleteAccount);


//TEAM ROUTES
userRoutes.get('/team/:teamId', authMiddleware, TeamController.index);
userRoutes.get('/team/:teamId/users', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), TeamController.getTeamMembers);
userRoutes.get('/team/:teamId/users/:userId/profile', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), TeamController.getTeamMember);
userRoutes.post('/team/create', createTeamRequestValidation, TeamController.createTeam);
userRoutes.post('/team/:teamId/users/create', createTeamUserRequestValidation,permissionsChecker(['OWNER', 'MANAGER']), TeamController.createUser);
userRoutes.put('/team/:teamId/users/:userId/updateRole', updateUserRoleRequestValidation,permissionsChecker(['OWNER', 'MANAGER']), TeamController.updateUserRole);
//THE ROUTE BELOW IS INCOMPLETE 1
userRoutes.post('/team/:teamId/users/joinTeam', teamInvitationRequestValidation, TeamController.joinTeam);
//THE ROUTE BELOW IS INCOMPLETE 2
userRoutes.put('/team/:teamId/update', teamInfoUpdateRequestValidation, TeamController.updateTeamInfo);
//THE ROUTE BELOW IS INCOMPLETE 3
userRoutes.put('/team/:teamId/updateCover', teamCoverImageRequestValidation, TeamController.updateTeamCoverImage);
userRoutes.delete('/team/:teamId/users/:userId/delete', removeTeamUserRequestValidation ,permissionsChecker(['OWNER']), TeamController.removeMember);
userRoutes.delete('/team/:teamId/delete', authMiddleware,permissionsChecker(['OWNER']), TeamController.deleteTeam);

//PROJECTS ROUTES
userRoutes.get('/team/:teamId/projects',authMiddleware,permissionsChecker(['OWNER', 'USER', 'VIEWER','MANAGER']), ProjectController.index); //DONE
userRoutes.get('/team/:teamId/projects/:projectId', authMiddleware,permissionsChecker(['OWNER', 'USER', 'VIEWER','MANAGER']), ProjectController.index); //DONE
userRoutes.post('/team/:teamId/projects/create', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), ProjectController.createProject); //DONE
userRoutes.post('/team/:teamId/projects/:projectId/addMember', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), ProjectController.addProjectMember); //DONE
userRoutes.put('/team/:teamId/projects/:projectId/update', authMiddleware,permissionsChecker(['OWNER','MANAGER']), ProjectController.updateProject ); //DONE
userRoutes.put('/team/:teamId/projects/:projectId/activation', authMiddleware,permissionsChecker(['OWNER']), ProjectController.projectActivation); //DONE
//THE ROUTE BELOW IS INCOMPLETE 5
userRoutes.put('/team/:teamId/projects/:projectId/updateCover', authMiddleware,permissionsChecker(['OWNER', 'MANAGER']), ProjectController.updateProjectCoverImage);
userRoutes.delete('/team/:teamId/projects/:projectId/delete', authMiddleware,permissionsChecker(['OWNER']), ProjectController.deleteProject); //DONE


//5 routes INCOMPLETE ROUTES
//22 routes COMPLETE

export { userRoutes };