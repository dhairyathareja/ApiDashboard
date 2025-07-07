import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';

dotenv.config();

// Get __dirname inside ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Correct path to public directory from /src
const publicPath = path.join(__dirname, '../public');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '5kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Serve static files from '../public'
app.use(express.static(publicPath));

// Your routes
import authRouter from './routes/auth.router.js';
import userRouter from './routes/user.router.js';
import { verifyJWT } from './middleware/verifyJWT.js';

app.use('/auth', authRouter);
app.use('/user', verifyJWT, userRouter);

// ✅ React fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Connect DB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.log("❌ MongoDB Connection Error:", err));
