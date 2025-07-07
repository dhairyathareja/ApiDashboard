import express from "express";
import { apiRequest, changePlan, deleteApiKey, generateKey, getKeys } from "../controllers/user.controller.js";


const router=express.Router();
router.post('/getApiKeys',getKeys);
router.post('/generateApiKeys',generateKey);

router.post('/apiRequest',apiRequest);
router.post('/deleteKey',deleteApiKey);
router.post('/changePlan',changePlan);


export default router;