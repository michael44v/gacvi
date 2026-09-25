import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response.util';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  ResponseUtil.error(res, message, statusCode);
};
