import * as UserService from "./user.service";
import { createResponse } from "../common/helper/response.helper";
import asyncHandler from "express-async-handler";
import { type Request, type Response } from "express";
import { IUser } from "./user.dto";
import { sendEmail } from "../common/helper/sendEmail";
import jwt from "jsonwebtoken";
/**
 * create user
 * @route POST /user/register
 * @access private
 * @returns user
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  //Check if user already exists
  const existingUser = await UserService.getUserByEmail(email);
  //if already exists then throw error
  if (existingUser) {
    throw new Error("User already exists");
  }

  const result = await UserService.createUser({
    ...req.body,
  });

  res.send(createResponse(result, "User Created Successfully"));
});
/**
 * login user
 * @route POST /user/login
 * @access public
 * @returns user
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  //check if user does not exist
  const user = await UserService.getUserByEmail(email);
  //if not exist then throw an error
  if (!user) {
    throw new Error("User not found");
  }
  //check if password is valid
  const isPasswordValid = await UserService.comparePassword({
    password,
    userPassword: user.password,
  });
  //if password is not valid then throw an error
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  //if password is valid then generate a token and send token in cookies to validate
  const accessToken = await UserService.generateAccessToken(
    user._id,
    user.role
  );
  const refreshToken = await UserService.generateRefreshToken(
    user._id,
    user.role
  );
  const { password: p, ...rest } = user;
  res
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .send(
      createResponse(
        { user: rest, accessToken, refreshToken },
        "Login Successfully"
      )
    );
});
/**
 * Retrieves all users in the database.
 * @route GET /user/all
 * @access private
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  //get all users from database with USER role
  const result = await UserService.getAllUsers();
  //send the response array
  res.send(createResponse(result, "Users Fetched Successfully"));
});
/**
 * @function
 * @name refreshTokens
 * @description Refreshes access token and refresh token
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * @throws {Error} If refresh token is invalid
 */
export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }
    const response = await UserService.refreshTokens(refreshToken);
    res
      .cookie("accessToken", response.accessToken)
      .cookie("refreshToken", response.refreshToken)
      .send(createResponse(response, "Tokens Refreshed Successfully"));
  }
);
/**
 * Logs out the current user by removing their access and refresh tokens.
 * @function
 * @name logoutUser
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserService.logout((req.user as IUser)?._id);

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .send(createResponse(user, "Logout Successfully"));
});

/**
 * Handles forgot password functionality.
 * @function
 * @name forgotPassword
 * @description Handles forgot password functionality by generating a forgot password token and sending it to the user's email.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @property {string} email - The email address of the user to send the email to.
 * @returns {Promise<void>}
 * @throws {Error} If the forgot password token is not generated successfully.
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new Error("Email is required");
    }

    const forgotPasswordTokenExpiry = new Date();
    forgotPasswordTokenExpiry.setHours(
      forgotPasswordTokenExpiry.getHours() + 1
    );
    const forgotPasswordToken = jwt.sign(
      {
        email: email,
      },
      process.env.JWT_SECRET as string
    );

    const forget = await UserService.forgotPassword(
      email,
      forgotPasswordToken,
      forgotPasswordTokenExpiry
    );

    if (forget) {
      res.send(
        createResponse(forgotPasswordToken, "Email sent successfully to forgot")
      );
    } else {
      throw new Error("Error while forgot password");
    }
  }
);

/**
 * Updates the password for a user using a forgot password token.
 * @function
 * @name updatePassword
 * @description Updates the password for a user using a forgot password token.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @property {string} token - The forgot password token.
 * @property {string} password - The new password to set for the user.
 * @returns {Promise<void>}
 * @throws {Error} If the token is not found.
 * @throws {Error} If the password is not provided.
 * @throws {Error} If the user with the specific token is not found.
 * @throws {Error} If the token has expired.
 */
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;
    if (!token) {
      throw new Error("Token is required");
    }
    if (!password) {
      throw new Error("password is required");
    }
    const user = await UserService.updatePassword(token, password);

    res.send(createResponse(user, "Password Updated Successfully"));
  }
);