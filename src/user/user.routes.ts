import express from "express";
import * as UserController from "./user.controller";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { rateLimiter } from "../common/helper/rate-limiter.helper";
import { authenticate } from "../common/middleware/auth.middleware";
import * as validation from "./user.validation"

const router = express.Router();

router.post("/register", rateLimiter, validation.registerValidation,  UserController.createUser);
router.post("/login", rateLimiter, validation.loginValidation, UserController.loginUser);
router.post("/refresh-token",validation.refreshTokenValidation, UserController.refreshTokens);
router.post("/logout", authenticate, UserController.logout);
router.post("/forgot-password",validation.forgotPasswordValidation, rateLimiter, UserController.forgotPassword);
router.post("/reset-password",validation.resetPasswordValidation, UserController.resetPassword);

router.get("/:id", authenticate, UserController.getUserById);
router.get("/", authenticate, UserController.getAllUsers);

export default router;
