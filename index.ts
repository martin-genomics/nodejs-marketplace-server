import express from 'express';
import expressFileupload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/api-routes';
import { connectToDb } from './database/db';
import { bgCyan, bgGreen, bgRed, bgYellow } from 'kleur';
import { Request, Response, NextFunction } from 'express';
import formidable from "formidable";
dotenv.config();

const PORT = process.env.PORT || 3336;

const app = express();

//Global middleware functions
app.use(
    cors({
        origin: '*'
    })
);
app.use(express.json());
app.use(express.urlencoded( { extended: true }));
app.use(expressFileupload());
app.use(express.static('public', {}))
//app.use(formidable({uploadDir:}))
//app.use(upload.fields([{name: 'userPhoto'},{name: 'projectCoverImage', maxCount: 1},{'name': 'teamCoverImage',maxCount: 1}]));

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      console.log(bgCyan(req.method), req.path);
    } else if (req.method === 'GET') {
      console.log(bgGreen(req.method), req.path);
    } else if (req.method === 'DELETE') {
      console.log(bgRed(req.method), req.path);
    } else if (req.method === 'PATCH') {
      console.log(bgYellow(req.method), req.path);
    }
    next();
  });

(async ()=> {
    //This self-invoked function iniates a database connection
    await connectToDb();
})();

//Routes
app.use('/api/v1.0/user', userRoutes);
app.use('/api/v1.0/admin', userRoutes);

//Run the app
console.log('Running on port: ', PORT);
app.listen(PORT);