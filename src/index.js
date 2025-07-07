import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 4400;

app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}))

app.use(express.json());
app.use(bodyParser.json({ limit: '5kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// const publicPath = path.join(__dirname, '../public');
// app.use(express.static(publicPath));

// Routes
import authRouter from './routes/auth.router.js';
import userRouter from './routes/user.router.js';
import { verifyJWT } from './middleware/verifyJWT.js';

app.use('/auth', authRouter);
app.use('/user', verifyJWT, userRouter);


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT,()=>{
      console.log("Started")
    });
  })
  .catch(err => console.log("❌ MongoDB Connection Error:", err));
