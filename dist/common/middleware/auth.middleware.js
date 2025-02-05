"use strict";
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
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../../user/user.schema"));
/**
 * Middleware to authenticate the user using a JWT stored in cookies.
 *
 * @param {AuthenticatedRequest} req - The incoming request object, extended to include user details after authentication.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {void}
 */
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Retrieve the JWT from the cookies
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""); // Use the correct cookie name
        if (!token) {
            // If no token is provided, respond with 401 Unauthorized
            throw new Error("Authorization token is required");
        }
        // Verify the JWT using the secret key
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Look for the user associated with the decoded token's ID in the database
        const user = yield user_schema_1.default.findById(decoded.id);
        if (!user) {
            // If the user is not found, respond with 404 Not Found
            throw new Error("User not found");
        }
        // Attach user details to the request object, excluding the password field
        req.user = {
            _id: user._id.toString(),
            role: user.role,
            name: user.name, // Include name
            email: user.email, // Include email
            createdAt: user.createdAt, // Include createdAt timestamp
            updatedAt: user.updatedAt // Include updatedAt timestamp
        };
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        // Handle errors and respond with a generic server error message
        throw new Error(error.message || "Failed to authenticate user");
    }
});
exports.authenticateUser = authenticateUser;
