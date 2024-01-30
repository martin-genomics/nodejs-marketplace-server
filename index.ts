import express from 'express';
import expressFileupload from 'express-fileupload';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/api-routes';

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

//Routes
app.use('/api/v1.0', userRoutes);

//Run the app
console.log('Running pm port: ', PORT);
app.listen(PORT);