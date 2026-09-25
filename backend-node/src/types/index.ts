import { Request } from 'express';

export interface UserPayload {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
