import express from "express";
import { registerUser, loginUser, forgotPassword, refreshToken } from "./auth.controller";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/refresh-token", refreshToken);

export default router;
