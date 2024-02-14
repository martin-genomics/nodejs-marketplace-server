import {ProjectModel, UserModel} from "../models";
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

  static  async  addMember(email: string, projectId: string, teamId: string) {

      const user = await UserModel.findOne({ email: email}).select(['-_id', '-password'])
      if(!user) return { success: false, message: 'This user does not exist'};

      const project = await ProjectModel.findOne({ _id: projectId, teamId: teamId});
      if(!project) return {success: false, message: 'The project was not'}

      let isMember = false;
      for(let user of project.users) {
          if(user._id.toString() === user._id.toString()) isMember = true;
      }

      if(!isMember) return {success: false, message: 'This user is already a member of the project.'}

      project.users.push(user._id);
      await project.save();

      return  {success: true, message: 'A new project member has been added.', data: { user: user.toJSON() }}


  }
}