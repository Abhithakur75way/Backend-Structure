import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.helper";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import userSchema from "./user.schema";
// Assuming a utility for formatting responses




export const createUser = asyncHandler(async (req: Request, res: Response) => {
    
        const result = await userService.createUser(req.body);
        res.status(201).send(createResponse(result, "User created successfully"));
     
        
});

  

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
      const result = await userService.getAllUsers();

      if (result.success) {
          res.status(200).json(result);
      } else {
          res.status(404).json(result);
      }
  } catch (error: any) {
      res.status(500).json({
          success: false,
          message: "An error occurred while fetching users",
          error: error.message,
      });
  }
};


export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    
        const result = await userService.loginUser(email, password);

        // Set the access token as an HTTP-only cookie
        res.cookie("AccessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only for HTTPS in production
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(200).send(createResponse(result, "Login successful"));
    
});
  

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    try {
        const { accessToken, refreshToken: newRefreshToken } = await userService.refreshTokens(refreshToken);

        // Set the new access token as an HTTP-only cookie
        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.status(200).send(
            createResponse(
                { accessToken, refreshToken: newRefreshToken },
                "Tokens refreshed successfully"
            )
        );
    } catch (error: any) {
        throw new Error(error.message);
    }
});








export const logoutController = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id;  // Assuming user is attached to the request after authentication

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
        await userService.clearRefreshToken(userId);

        // Send a success response
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});



export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
      const { email } = req.body;
      if (!email) {
          res.status(400).json({ message: "Email is required." });
          return; // Add return to stop further execution
      }

      await userService.sendResetToken(email);
      res.status(200).json({
          message: "Password reset link has been sent to your email.",
      });
  } catch (error: any) {
      console.error("Forgot Password Error:", error);
      res.status(500).json({
          message: error.message || "Something went wrong. Please try again later.",
      });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
          res.status(400).json({ message: "Token and new password are required." });
        }

        await userService.resetPassword(token, newPassword);
        res.status(200).json({
            message: "Password has been reset successfully.",
        });
    } catch (error: any) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            message: error.message || "Something went wrong. Please try again later.",
        });
    }
};


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