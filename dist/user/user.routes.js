"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catch_error_middleware_1 = require("../common/middleware/catch-error.middleware");
const userController = __importStar(require("./user.controller"));
const userValidator = __importStar(require("./user.validation"));
const auth_middleware_1 = require("../common/middleware/auth.middleware");
const rate_limiter_helper_1 = require("../common/helper/rate-limiter.helper");
const router = (0, express_1.Router)();
// Define routes separately
router.get("/", userController.getAllUsers);
router.post("/", rate_limiter_helper_1.rateLimiter, userValidator.createUser, catch_error_middleware_1.catchError, userController.createUser);
router.post("/login", rate_limiter_helper_1.rateLimiter, userValidator.loginUser, catch_error_middleware_1.catchError, userController.loginUser);
router.post("/refresh", rate_limiter_helper_1.rateLimiter, userValidator.refreshToken, catch_error_middleware_1.catchError, userController.refresh);
router.post("/alerts", rate_limiter_helper_1.rateLimiter, auth_middleware_1.authenticateUser, userController.addOrUpdateAlert);
router.post("/logout", rate_limiter_helper_1.rateLimiter, auth_middleware_1.authenticateUser, userController.logoutController);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
// Uncomment these if needed
// router.get("/:id", userController.getUserById);
// router.delete("/:id", userController.deleteUser);
// router.put("/:id", userValidator.updateUser, catchError, userController.updateUser);
// router.patch("/:id", userValidator.editUser, catchError, userController.editUser);
exports.default = router;
