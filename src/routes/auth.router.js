import express from "express";
import { loginController, logoutController, signUpController, updatePassword, updateUser } from "../controllers/auth.controller.js";

const router=express.Router();
router.post('/register',signUpController);
router.post('/login',loginController);
router.post('/logout',logoutController);

router.post('/updateProfile',updateUser);
router.post('/updatePassword',updatePassword);


export default router;