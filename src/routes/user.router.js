import express from "express";
import { generateKey, getKeys } from "../controllers/user.controller.js";


const router=express.Router();
router.post('/getApiKeys',getKeys);
router.post('/generateApiKeys',generateKey);


export default router;