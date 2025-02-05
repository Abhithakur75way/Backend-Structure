import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../../user/user.schema";
import { IUser } from "../../user/user.dto";

export interface AuthenticatedRequest extends Request {
    user?: Omit<IUser, "password">;
}

export const authenticateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Retrieve the JWT token from Authorization header
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ message: "Authorization token is required" });
            return; // Stop further processing
        }

        // Verify the JWT using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
        };

        // Find the user associated with the decoded token
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return; // Stop further processing
        }

        // Attach user details to the request object, excluding the password field
        req.user = {
            _id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        // Proceed to the next middleware or route handler
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ message: "Token expired. Please refresh the token." });
            return; // Stop further processing
        }

        // Catch any other errors and return 401 Unauthorized
        res.status(401).json({ message: error.message || "Failed to authenticate user" });
    }
};
