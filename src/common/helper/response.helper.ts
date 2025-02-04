interface IResponse<T = any> {
    success: boolean;
    message?: string;
    data: T | null;
  }
  
  export type ErrorResponse = IResponse & {
    error_code: number;
  };
  
  export const createResponse = <T>(
    data: T,
    message: string = "Success"
  ): IResponse<T> => {
    return { data, message, success: true };
  };
  