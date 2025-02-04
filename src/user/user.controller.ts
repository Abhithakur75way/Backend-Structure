import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.helper";
import {
  IUser,
  ILogin,
  IRefreshToken,
  IForgotPassword,
  IResetPassword,
} from "./user.dto";
import jwt from "jsonwebtoken";
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);
  res.send(createResponse(result, "User created successfully"));
}); 

export const loginUser  = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as ILogin;
    const user = await userService.getUserByEmail(email);
    if (!user) throw new Error("User  not found");
  
    const isMatch = await userService.comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");
  
    const accessToken = await userService.generateAccessToken(
      user._id.toString(),
      user.role
    );
    const refreshToken = await userService.generateRefreshToken(
      user._id.toString(),
      user.role
    );
  
    // Include user information in the response
    res.send(createResponse(
      {
        accessToken,
        refreshToken,
        name: user.name, // Include user's name
        email: user.email // Include user's email
      },
      "Login successful"
    ));
  });
export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body as IRefreshToken;
    const tokens = await userService.refreshTokens(refreshToken);
    res.send(createResponse(tokens, "Tokens refreshed successfully"));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { _id } = req.user as { _id: string };
  const user = await userService.logout(_id);
  res.send(createResponse(user, "Logout successful"));
});

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body as IForgotPassword;
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "10m",
    });
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await userService.forgotPassword(email, token, expiry);
    res.send(createResponse(null, "Password reset email sent"));
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body as IResetPassword;
    const user = await userService.updatePassword(token, newPassword);
    res.send(createResponse(user, "Password reset successfully"));
  }
);

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.send(createResponse(user));
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.send(createResponse(users));
});
