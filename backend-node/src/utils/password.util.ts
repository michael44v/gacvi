import bcrypt from 'bcryptjs';
import argon2 from 'argon2';

export class PasswordUtil {
  public static async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;

    if (hash.startsWith('$argon2')) {
      try {
        return await argon2.verify(hash, password);
      } catch {
        return false;
      }
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  public static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
