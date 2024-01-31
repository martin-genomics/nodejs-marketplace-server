import { Request, Response } from "express";

export default class TeamController {
    static async index(req: Request, res: Response) {
        //This controller returns the team details
    }

    static async createTeam(req: Request, res: Response) {
        //This controller enables the owner to create a team
    }

    static async joinTeam(req: Request, res: Response) {
        //Allows a user to join a team by invitation
    }

    static async createMember(req: Request, res: Response) {
        //This controller allows the creation of a team member
    }

    static async removeMember(req: Request, res: Response) {
        //This controller allows the creator of the team to remove a member from the team
    }
    
    static async deleteTeam(req: Request, res: Response) {
        //This controller allows the owner to delete the team
    }
    
}