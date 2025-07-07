import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();

import authRouter from "./routes/auth.router.js"
import userRouter from "./routes/user.router.js"
import { verifyJWT } from './middleware/verifyJWT.js';

const app=express();
const PORT=process.env.PORT;


app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json({ limit: '5KB' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5KB" }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


// For SPA (React) — send index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, '../public');
app.use(express.static(buildPath));

// ROUTES
app.use('/auth',authRouter);
app.use('/user',verifyJWT,userRouter)


mongoose.connect(process.env.MONGODB_URI).then(()=>{
    app.listen(PORT,()=>{
        console.log(`http://localhost:${PORT}`);
    })
}).catch(err=>console.log("Database Connection Error",err));