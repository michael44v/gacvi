import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ResponseUtil } from '../utils/response.util';

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !user.roles) {
      ResponseUtil.error(res, 'Forbidden: User role missing', 403);
      return;
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role || user.roles];

    if (
      userRoles.includes('SUPER_ADMIN') ||
      (userRoles.includes('ADMIN') && allowedRoles.includes('ADMIN'))
    ) {
      next();
      return;
    }

    const hasAccess = allowedRoles.some((r) => userRoles.includes(r));

    if (!hasAccess) {
      ResponseUtil.error(res, 'Forbidden: Insufficient permissions', 403);
      return;
    }

    next();
  };
};
