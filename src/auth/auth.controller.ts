import { Request, Response } from "express";
import { IUser, RegisterDto, LoginDto, RefreshTokenDto } from "./auth.dto";
import User from "./auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../common/helper/jwt.helper";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password }: RegisterDto = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role: "USER" });
  if (user) {
    res.status(201).json({ message: "User registered successfully" });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("token", accessToken, { httpOnly: true, secure: true });
    res.json({ accessToken, refreshToken });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const resetToken = generateAccessToken(user.id);
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Password Reset",
    text: `Click to reset: ${process.env.CLIENT_URL}/reset-password/${resetToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).json({ message: "Email not sent" });
    res.json({ message: "Email sent successfully" });
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken }: RefreshTokenDto = req.body;
  if (!refreshToken) return res.status(403).json({ message: "Refresh token required" });

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};