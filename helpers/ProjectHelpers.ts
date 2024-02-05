import {ProjectModel} from "../models";
import mongoose from "mongoose";

export default class ProjectHelpers {

  static async getUserProjects(myUserId: string) {
    const userId = new mongoose.mongo.ObjectId(myUserId);
      const projects = await ProjectModel.find({
          //teamId: teamId,
        users: {
            $elemMatch: {
                userId: { $in: userId }
            },
        },
      }).select(['-_id', 'users']);

      const user_projects: {projectId: string}[] = [];

      projects.map( project => {
          project.users.forEach( projectUserId => {
              if(projectUserId.toString() === userId.toString())  user_projects.push({ projectId: project._id.toString()});
          })
      });

      return user_projects;
  }
}