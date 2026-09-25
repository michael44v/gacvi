import request from 'supertest';
import app from '../../src/app';
import { JwtUtil } from '../../src/utils/jwt.util';
import { prisma } from '../../src/config/prisma.config';

jest.mock('../../src/config/prisma.config', () => ({
  prisma: {
    course: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, title: 'Test Course', code: 'TC-101', category: 'Testing' },
      ]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
    courseOffering: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, course_id: 1, delivery_mode: 'ONLINE', title: 'Offering 1', price: 100, course: { title: 'Test', code: 'TC' } },
      ]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(1),
    },
    location: {
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Main Campus', city: 'Toronto', country: 'Canada', _count: { classrooms: 1 } },
      ]),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(5),
    },
    role: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'STUDENT' }),
    },
    userRole: {
      count: jest.fn().mockResolvedValue(5),
    },
    enrollment: {
      count: jest.fn().mockResolvedValue(2),
    },
    payment: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 500 } }),
    },
  },
}));

describe('Express API Endpoints Integration Test Suite', () => {
  it('GET /api/v1/courses - should return list of courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].title).toBe('Test Course');
  });

  it('GET /api/v1/offerings - should return course offerings', async () => {
    const res = await request(app).get('/api/v1/offerings');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/locations - should return locations', async () => {
    const res = await request(app).get('/api/v1/locations');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/auth/me - should return 401 when token missing', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('GET /api/v1/admin/stats - should return 403 for unauthorized role', async () => {
    const token = JwtUtil.encode({
      id: 99,
      email: 'student@gacvi.org',
      first_name: 'Student',
      last_name: 'User',
      role: 'STUDENT',
      roles: ['STUDENT'],
    });

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('error');
  });

  it('GET /api/v1/admin/stats - should return stats for SUPER_ADMIN', async () => {
    const token = JwtUtil.encode({
      id: 1,
      email: 'admin@gacvi.org',
      first_name: 'Admin',
      last_name: 'User',
      role: 'SUPER_ADMIN',
      roles: ['SUPER_ADMIN'],
    });

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.total_revenue).toBe(500);
  });
});
