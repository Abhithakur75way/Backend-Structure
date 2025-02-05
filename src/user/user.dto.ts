import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
  _id: string;
    name: string;
    email: string;
    active?: boolean;
    role: "USER" | "ADMIN";
    password: string;
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;

    
}