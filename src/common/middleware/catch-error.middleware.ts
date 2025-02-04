import { Request, Response, NextFunction } from "express";

export const catchErrors =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next); // Ensure it waits for a Promise
    } catch (error) {
      next(error); // Pass errors to the global error handler
    }
  };
