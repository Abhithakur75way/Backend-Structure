export interface IUser {
    name: string;
    email: string;
    password: string;
    role: string;
  }
  
  export interface ILogin {
    email: string;
    password: string;
  }
  
  export interface IRefreshToken {
    refreshToken: string;
  }
  
  export interface IForgotPassword {
    email: string;
  }
  
  export interface IResetPassword {
    token: string;
    newPassword: string;
  }