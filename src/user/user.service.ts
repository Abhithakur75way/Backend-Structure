import { type IUser } from "./user.dto";
import userSchema from "./user.schema";
import UserSchema from "./user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail, resetPasswordEmailTemplate } from "../common/services/email.service";
export const createUser = async (data: IUser) => {
    try {
        const result = await userSchema.create({...data, active: true});
        return result;
    } catch (error: any) {
        if (error.code === 11000) {
            // Handle duplicate key error (e.g., duplicate email)
            throw new Error("Email already exists");
        }
        throw new Error(error.message || "An error occurred while creating the user");
    }
};



export const getAllUsers = async () => {
    try {
      // Fetch all users from the database
      const users = await userSchema.find();
  
      // If no users found, return a message
      if (users.length === 0) {
        return { success: false, message: "No users found" };
      }
  
      return { success: true, data: users };
    } catch (error: any) {
      throw new Error("Failed to retrieve users: " + error.message);
    }
  };


export const loginUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // Find the user by email
    const user = await userSchema.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    user.active = true;
    await user.save();

    return { accessToken, refreshToken, user };
};


export const generateAccessToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, { expiresIn: "1m" });
}


export const generateRefreshToken = (id: string, role: string): string => {
    return jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });
};


export const refreshTokens = async (refreshToken: string) => {
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
            id: string;
        };

        // Find the user and verify if refresh token matches
        const user = await userSchema.findOne({ _id: decoded.id, refreshToken });
        if (!user) {
            throw new Error("Invalid or expired refresh token");
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id, user.role);

        // Update refresh token in database (to prevent reuse)
        user.refreshToken = newRefreshToken;
        await user.save();

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
        console.error("Error refreshing tokens:", error);
        throw new Error("Invalid or expired refresh token");
    }
};




export const clearRefreshToken = async (userId: string) => {
    try {
        // Find the user by ID
        const user = await userSchema.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Set the refresh token to an empty string
        user.refreshToken = "";
        await user.save();  // Save the updated user object

    } catch (error: any) {
        throw new Error(`Error clearing refresh token: ${error.message}`);
    }
};



export const sendResetToken = async (email: string): Promise<void> => {
    const user = await userSchema.findOne({ email });

    // Always respond with a generic message
    if (!user) {
        return; // Prevent revealing user existence
    }

    // Generate a random token (e.g., a UUID or simple string)
    const resetToken = `${user._id}.${Date.now()}`;
    const hashedToken = await bcrypt.hash(resetToken, 10); // Hash token with bcrypt

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // Convert to Date


    try {
      await user.save();
  
      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
      const emailContent = resetPasswordEmailTemplate(resetToken);
  
      await sendEmail(email, "Password Reset Request", emailContent);
  } catch (error) {
      console.error("Failed to send reset token:", error);
      throw new Error("Failed to send password reset email.");
  }
};


export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const user = await userSchema.findOne({
        resetPasswordExpires: { $gt: Date.now() }, // Ensure token is still valid
    });

    if (!user || !user.resetPasswordToken) {
        throw new Error("Invalid or expired reset token.");
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
        throw new Error("Invalid or expired reset token.");
    }

    user.password = newPassword // set new password
    user.resetPasswordToken = undefined; // Clear reset token
    user.resetPasswordExpires = undefined;

    await user.save();
};


// export const updateUser = async (id: string, data: IUser) => {
//     const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
//         new: true,
//     });
//     return result;
// };

// export const editUser = async (id: string, data: Partial<IUser>) => {
//     const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
//     return result;
// };

// export const deleteUser = async (id: string) => {
//     const result = await UserSchema.deleteOne({ _id: id });
//     return result;
// };

// export const getUserById = async (id: string) => {
//     const result = await UserSchema.findById(id).lean();
//     return result;
// };

// export const getAllUser = async () => {
//     const result = await UserSchema.find({}).lean();
//     return result;
// };
export const getUserByEmail = async (email: string) => {
    const result = await UserSchema.findOne({ email }).lean();
    return result;
}