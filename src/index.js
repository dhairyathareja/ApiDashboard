import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

// File path setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRouter from "./routes/auth.router.js";
import userRouter from "./routes/user.router.js";
import { verifyJWT } from './middleware/verifyJWT.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json({ limit: '5KB' }));
app.use(bodyParser.urlencoded({ extended: true, limit: "5KB" }));
app.use(cookieParser());

// 🔧 Serve static files from 'public' (React build files)
const buildPath = path.join(__dirname, 'public');
app.use(express.static(buildPath));

// API routes
app.use('/auth', authRouter);
app.use('/user', verifyJWT, userRouter);

// 🔄 Fallback route for SPA (must be AFTER API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// DB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at https://65.0.109.216:${PORT}`);
    });
  })
  .catch(err => console.log("❌ Database Connection Error:", err));
