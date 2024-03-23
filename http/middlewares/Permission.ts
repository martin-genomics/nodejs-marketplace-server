import { TeamHelpers } from '../../helpers';
import { AllowedRoles } from '../../types/custom-types';
import { Request, Response, NextFunction } from 'express';

/**
 *
 * @param allowedRoles
 * This is a list of allowed roles and expexted by the permission middleware
 * @returns
 *@param permissionsChecker
 The function validates user role
 */


export default function permissionsChecker(allowedRoles: AllowedRoles[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    //console.log(allowedRoles);
    //console.log(res.locals.teams);
    //console.log(req.path);

    const { teamId, projectId, userId } = req.params;
    if (teamId) {
      //api/v1.0/team/create
      //api/v1.0/team/{teamId}/edit
      //api/v1.0/team/{teamId}/view
      //api/v1.0/team/{teamId}/delete
      //api/v1.0/teams/{teamId}/users
      //api/v1.0/teams/{teamId}/users/create
      //api/v1.0/team/{teamId}/projects/create

      const team = res.locals.teams.filter((team: {teamId: string, role: AllowedRoles}) => team.teamId === teamId);

      if (team.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'You are not a member of this team or this team id may not exists.',
        });
      }

      if (!allowedRoles.includes(team[0].role)) {
        return res.status(401).json({
          success: false,
          message: 'You do not have permission to perform this action.',
        });
      }

      res.locals.teamId = teamId;
    }

    if (teamId && projectId) {
      /**
       * This block controlls the and authenticates the routes below
       *
       * api/v1.0/team/{teamId}/projects/projectId/view
       * api/v1.0/team/{teamId}/projects/projectId/edit
       * api/v1.0/team/{teamId}/projects/projectId/delete
       */

      const partProjects = res.locals.projects.some((project: any) => project.projectId === projectId);

      if (!partProjects) {
        return res.status(401).json({
          success: false,
          message: 'You do not have permission to this project.',
        });
      }

      res.locals.projectId = projectId;
    }

    if (teamId && userId) {
      /**
       * This block controls and authenticates the routes below:
       *
       *api/v1.0/teams/{teamId}/users/{userId}/view
       *api/v1.0/teams/{teamId}/users/{userId}/edit
       *api/v1.0/teams/{teamId}/users/{userId}/delete
       */
      const isMember = await TeamHelpers.isMember(teamId, userId);

      if (!isMember) {
        return res.status(404).json({
          success: false,
          message: 'The user is not a member of the team.',
        });
      }
    }

    next();
  };
}