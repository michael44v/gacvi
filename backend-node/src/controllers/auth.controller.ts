import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response.util';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  public register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ResponseUtil.success(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const user = await this.authService.getMe(req.user.id);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };
}
