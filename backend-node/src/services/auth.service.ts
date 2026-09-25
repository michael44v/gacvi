import { AuthRepository } from '../repositories/auth.repository';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  public async login(emailInput: string, passwordInput: string) {
    const email = (emailInput || '').trim();
    const password = passwordInput || '';

    if (!email || !password) {
      throw { statusCode: 400, message: 'Email and password are required' };
    }

    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isValidPassword = await PasswordUtil.verify(password, user.password_hash);
    if (!isValidPassword) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    if (user.status !== 'ACTIVE') {
      throw { statusCode: 403, message: 'User account is suspended or inactive' };
    }

    const payload = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.roles[0] || 'STUDENT',
      roles: user.roles,
    };

    const token = JwtUtil.encode(payload);

    return {
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
      },
    };
  }

  public async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) {
    if (!data.first_name || !data.last_name || !data.email || !data.password) {
      throw { statusCode: 400, message: 'First name, last name, email, and password are required' };
    }

    const existingUser = await this.authRepo.findByEmail(data.email);
    if (existingUser) {
      throw { statusCode: 409, message: 'An account with this email address already exists' };
    }

    let role = data.role || 'STUDENT';
    if (!['STUDENT', 'PARENT'].includes(role)) {
      role = 'STUDENT';
    }

    const passwordHash = await PasswordUtil.hash(data.password);
    const user = await this.authRepo.createUser({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password_hash: passwordHash,
      phone: data.phone,
      roleName: role,
    });

    if (!user) {
      throw { statusCode: 500, message: 'Failed to create user' };
    }

    const payload = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.roles[0] || 'STUDENT',
      roles: user.roles,
    };

    const token = JwtUtil.encode(payload);

    return {
      token,
      user,
    };
  }

  public async getMe(userId: number) {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return user;
  }
}
