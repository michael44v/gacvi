import { JwtUtil } from '../../src/utils/jwt.util';
import { PasswordUtil } from '../../src/utils/password.util';
import bcrypt from 'bcryptjs';

describe('Auth Utilities Test Suite', () => {
  it('should encode and decode JWT tokens correctly', () => {
    const payload = {
      id: 1,
      email: 'admin@gacvi.org',
      first_name: 'System',
      last_name: 'Admin',
      role: 'SUPER_ADMIN',
      roles: ['SUPER_ADMIN'],
    };

    const token = JwtUtil.encode(payload);
    expect(typeof token).toBe('string');

    const decoded = JwtUtil.decode(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(1);
    expect(decoded?.email).toBe('admin@gacvi.org');
    expect(decoded?.role).toBe('SUPER_ADMIN');
  });

  it('should return null when decoding tampered JWT tokens', () => {
    const payload = { id: 1, email: 'test@gacvi.org', first_name: 'Test', last_name: 'User', role: 'STUDENT', roles: ['STUDENT'] };
    const token = JwtUtil.encode(payload);
    const tampered = token + 'invalid';

    const decoded = JwtUtil.decode(tampered);
    expect(decoded).toBeNull();
  });

  it('should verify bcrypt password hashes correctly', async () => {
    const rawPassword = 'Admin123!';
    const hash = await bcrypt.hash(rawPassword, 10);

    const isValid = await PasswordUtil.verify(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await PasswordUtil.verify('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});
