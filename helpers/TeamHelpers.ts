import {TeamModel} from "../models";


export default class TeamHelpers {
    static async isMember(teamId: string, userId: string) {
        return true;
    }


    static async getUserTeams(userId: string) {
        const teams = await TeamModel.find({
            users: {
                $elemMatch: {
                    userId: { $in: userId },
                }

            }
        }).select(['-_id', 'users']);

        let user_teams: { teamId: string; role: string; }[] = [];
        teams.map( team => {
            team.users.forEach( user => {
               if( user.userId.toString() === userId && !user.isDeleted ) {
                   user_teams.push({
                       teamId: team._id.toString(),
                       role: user.role,

                   })
               }

            });
        });

        return user_teams;


    }
}