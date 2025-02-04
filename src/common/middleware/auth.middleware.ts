import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserSchema from "../../user/user.schema";

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
      return; // End the middleware after sending the response
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string };
    const user = await UserSchema.findById(decoded._id).select("-password");
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
      return; // End the middleware after sending the response
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};
