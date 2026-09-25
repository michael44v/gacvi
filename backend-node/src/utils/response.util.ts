import { Response } from 'express';

export class ResponseUtil {
  public static success(
    res: Response,
    data: any = null,
    message: string = 'Operation successful',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  public static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 400,
    errors: any = null
  ): void {
    const payload: Record<string, any> = {
      status: 'error',
      message,
    };
    if (errors) {
      payload.errors = errors;
    }
    res.status(statusCode).json(payload);
  }
}
