import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { JwtUtil } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ResponseUtil.error(res, 'Unauthorized access. Token missing.', 401);
    return;
  }

  const token = authHeader.substring(7);
  const payload = JwtUtil.decode(token);

  if (!payload) {
    ResponseUtil.error(res, 'Invalid or expired authentication token.', 401);
    return;
  }

  req.user = payload;
  next();
};
