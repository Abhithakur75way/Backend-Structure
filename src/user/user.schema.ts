import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  refreshToken?: string;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
}

const userSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "USER" },
  refreshToken: { type: String },
  forgotPasswordToken: { type: String },
  forgotPasswordTokenExpiry: { type: Date },
});

userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next(); // Only hash if the password is modified
  
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10); // Hash the password
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error as Error);
    }
  });

export default mongoose.model<IUser>("User", userSchema);