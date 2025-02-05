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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.logoutController = exports.getPortfolio = exports.addOrUpdateAlert = exports.refresh = exports.loginUser = exports.getAllUsers = exports.createUser = void 0;
const userService = __importStar(require("./user.service"));
const response_helper_1 = require("../common/helper/response.helper");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
// Assuming a utility for formatting responses
exports.createUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.createUser(req.body);
    res.status(201).send((0, response_helper_1.createResponse)(result, "User created successfully"));
}));
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield userService.getAllUsers();
        if (result.success) {
            res.status(200).json(result);
        }
        else {
            res.status(404).json(result);
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching users",
            error: error.message,
        });
    }
});
exports.getAllUsers = getAllUsers;
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const result = yield userService.loginUser(email, password);
    // Set the access token as an HTTP-only cookie
    res.cookie("AccessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only for HTTPS in production
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).send((0, response_helper_1.createResponse)(result, "Login successful"));
}));
exports.refresh = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    try {
        const { accessToken, refreshToken: newRefreshToken } = yield userService.refreshTokens(refreshToken);
        // Set the new access token as an HTTP-only cookie
        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.status(200).send((0, response_helper_1.createResponse)({ accessToken, refreshToken: newRefreshToken }, "Tokens refreshed successfully"));
    }
    catch (error) {
        throw new Error(error.message);
    }
}));
exports.addOrUpdateAlert = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assume user is authenticated
    if (!userId)
        throw new Error("User not authenticated");
    const { symbol, threshold } = req.body;
    if (!symbol || typeof threshold !== "number") {
        throw new Error("Symbol and threshold are required");
    }
    const alerts = yield userService.addOrUpdateAlert(userId, symbol, threshold);
    res.status(200).send((0, response_helper_1.createResponse)(alerts, "Alert added/updated successfully"));
}));
const getPortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const portfolio = yield userService.getUserPortfolio(userId);
        return res.status(200).send((0, response_helper_1.createResponse)(portfolio, "Fetched portfolio successfully"));
    }
    catch (error) {
        console.error("Error fetching portfolio:", error.message);
        throw new Error("Failed to fetch portfolio");
    }
});
exports.getPortfolio = getPortfolio;
exports.logoutController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming user is attached to the request after authentication
    if (!userId) {
        throw new Error("User not authenticated");
    }
    try {
        // Clear the accessToken cookie
        res.clearCookie("AccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Set secure for production environments
            sameSite: "strict",
        });
        // Call service to update the refresh token in the database
        yield userService.clearRefreshToken(userId);
        // Send a success response
        res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required." });
        }
        yield userService.sendResetToken(email);
        res.status(200).json({
            message: "Password reset link has been sent to your email.",
        });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({
            message: error.message || "Something went wrong. Please try again later.",
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: "Token and new password are required." });
        }
        yield userService.resetPassword(token, newPassword);
        res.status(200).json({
            message: "Password has been reset successfully.",
        });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            message: error.message || "Something went wrong. Please try again later.",
        });
    }
});
exports.resetPassword = resetPassword;
// export const updateUser = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.updateUser(req.params.id, req.body);
//     res.send(createResponse(result, "User updated sucssefully"))
// });
// export const editUser = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.editUser(req.params.id, req.body);
//     res.send(createResponse(result, "User updated sucssefully"))
// });
// export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.deleteUser(req.params.id);
//     res.send(createResponse(result, "User deleted sucssefully"))
// });
// export const getUserById = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.getUserById(req.params.id);
//     res.send(createResponse(result))
// });
// export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
//     const result = await userService.getAllUser();
//     res.send(createResponse(result))
// });
