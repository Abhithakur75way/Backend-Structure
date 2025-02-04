import UserSchema from "./user.schema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../common/helper/email.service";
import { IUser, ILogin, IRefreshToken, IForgotPassword, IResetPassword } from "./user.dto";
import mongoose from "mongoose";

export const createUser = async (data: IUser) => {
    
  const result = await UserSchema.create({ ...data });
  return result;
};

export const getUserByEmail = async (email: string) => {
  const result = await UserSchema.findOne({ email }).lean();
  return result;
};

export const getAllUsers = async () => {
  const result = await UserSchema.find({ role: "USER" }).select("-password").lean();
  return result;
};

export const generateAccessToken = async (_id: string, role: string) => {
    if (!process.env.JWT_ACCESS_TOKEN_EXPIRY) {
      throw new Error('JWT_ACCESS_TOKEN_EXPIRY is not set');
    }
    const expiry = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRY, 10);
    if (isNaN(expiry)) {
      throw new Error('JWT_ACCESS_TOKEN_EXPIRY must be a numeric value');
    }
    return jwt.sign({ _id, role }, process.env.JWT_SECRET as string, {
      expiresIn: expiry,
    });
  };
  
  export const generateRefreshToken = async (_id: string, role: string) => {
    if (!process.env.JWT_REFRESH_TOKEN_EXPIRY) {
      throw new Error('JWT_REFRESH_TOKEN_EXPIRY is not set');
    }
    const expiry = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRY, 10);
    if (isNaN(expiry)) {
      throw new Error('JWT_REFRESH_TOKEN_EXPIRY must be a numeric value');
    }
    const token = jwt.sign({ _id, role }, process.env.JWT_SECRET as string, {
      expiresIn: expiry,
    });
    await UserSchema.findByIdAndUpdate(_id, { refreshToken: token }, { new: true });
    return token;
  };

export const comparePassword = async (password: string, userPassword: string) => {
  return await bcrypt.compare(password, userPassword);
};

export const refreshTokens = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { _id: string; role: string };
  const user = await UserSchema.findById(decoded._id);
  if (!user) throw new Error("User not found");

  const accessToken = await generateAccessToken(user._id as string, user.role);
  const refreshToken = await generateRefreshToken(user._id as string, user.role);

  return { accessToken, refreshToken };
};

export const logout = async (_id: string) => {
  const user = await UserSchema.findByIdAndUpdate(_id, { $unset: { refreshToken: 1 } }, { new: true }).select("-password");
  return user;
};

export const forgotPassword = async (email: string, forgotPasswordToken: string, forgotPasswordTokenExpiry: Date) => {
    const user = await UserSchema.findOne({ email });
    if (!user) throw new Error("User not found");
  
    user.forgotPasswordToken = forgotPasswordToken;
    user.forgotPasswordTokenExpiry = forgotPasswordTokenExpiry;
    await user.save();
  
    const resetPasswordUrl = `http://localhost:5000/reset-password/${forgotPasswordToken}`;
  
    await sendEmail({
      email,
      subject: "Reset Your Password",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <p><a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>
             <p>If you did not request this, please ignore this email.</p>`,
    });
  
    return true;
  };
  export const updatePassword = async (token: string, password: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await UserSchema.findOne({ forgotPasswordToken: token }).session(session);
      if (!user) throw new Error("Invalid token");
  
      // Remove manual hashing - schema pre-save will handle it
      user.password = password; // ✅ Let pre-save hook hash it
      user.forgotPasswordToken = undefined;
      await user.save({ session });
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };


export const getUserById = async (_id: string) => {
  const user = await UserSchema.findById(_id);
  return user;
};