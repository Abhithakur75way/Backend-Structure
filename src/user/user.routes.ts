import { Router } from "express";
import { catchError } from "../common/middleware/catch-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { authenticateUser } from "../common/middleware/auth.middleware";
import { rateLimiter } from "../common/helper/rate-limiter.helper";

const router = Router();

// Define routes separately
router.get("/", userController.getAllUsers);
router.post("/signup", rateLimiter, userValidator.createUser, catchError, userController.createUser);
router.post("/login", rateLimiter, userValidator.loginUser, catchError, userController.loginUser);
router.post("/refresh", rateLimiter, userValidator.refreshToken, catchError, userController.refresh);
router.post("/logout", rateLimiter, authenticateUser, userController.logoutController);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Uncomment these if needed
// router.get("/:id", userController.getUserById);
// router.delete("/:id", userController.deleteUser);
// router.put("/:id", userValidator.updateUser, catchError, userController.updateUser);
// router.patch("/:id", userValidator.editUser, catchError, userController.editUser);

export default router;