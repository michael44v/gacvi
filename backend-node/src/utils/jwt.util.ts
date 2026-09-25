import jwt from 'jsonwebtoken';
import { UserPayload } from '../types';

const DEFAULT_SECRET = 'gacvi_jwt_secret_key_change_in_production_2026';

export class JwtUtil {
  private static getSecret(): string {
    return process.env.JWT_SECRET || DEFAULT_SECRET;
  }

  public static encode(payload: Omit<UserPayload, 'iat' | 'exp'>, ttlSeconds: number = 86400): string {
    return jwt.sign(payload, this.getSecret(), {
      algorithm: 'HS256',
      expiresIn: ttlSeconds,
    });
  }

  public static decode(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, this.getSecret(), {
        algorithms: ['HS256'],
      }) as UserPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
