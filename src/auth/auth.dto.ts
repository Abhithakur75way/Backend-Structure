import { type BaseSchema } from "../common/dto/base.dto";

export const userEnum = ["USER", "ADMIN"] as const;
export type UserEnum = (typeof userEnum)[number];

export interface IUser extends BaseSchema {
  name: string;
  email: string;
  role: UserEnum;
  password: string;
  refreshToken?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
