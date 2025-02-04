import { Request, Response, NextFunction } from "express";
import {IUser} from '../../user/user.dto';

export const roleAuth = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes((req.user as IUser).role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};
