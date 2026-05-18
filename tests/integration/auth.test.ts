import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as logoutPOST } from '@/app/api/auth/logout/route';
import { GET as meGET } from '@/app/api/auth/me/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb } from '../helpers/db';
import { createTestUser } from '../helpers/auth';

describe('Auth API', () => {
  beforeAll(async () => {
    await resetDb();
  });

  beforeEach(async () => {
    await resetDb();
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns token', async () => {
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'new@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          nom: 'Doe',
          prenom: 'Jane',
        },
      });
      const res = await registerPOST(req);
      const { status, body } = await readJson<{ success: boolean; token: string }>(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
    });

    it('rejects invalid input with 400 + fieldErrors', async () => {
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'bad', password: 'short', confirmPassword: 'short' },
      });
      const res = await registerPOST(req);
      const { status, body } = await readJson<{ fieldErrors: Record<string, string[]> }>(res);
      expect(status).toBe(400);
      expect(body.fieldErrors).toBeDefined();
    });

    it('rejects duplicate email with 409', async () => {
      await createTestUser({ email: 'dup@test.com' });
      const req = buildRequest('/api/auth/register', {
        method: 'POST',
        body: {
          email: 'dup@test.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        },
      });
      const res = await registerPOST(req);
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('authenticates an existing user', async () => {
      await createTestUser({ email: 'log@test.com', password: 'Password123' });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'log@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      const { status, body } = await readJson<{ success: boolean; token: string }>(res);
      expect(status).toBe(200);
      expect(body.token).toBeTruthy();
    });

    it('rejects wrong password with 401', async () => {
      await createTestUser({ email: 'log2@test.com', password: 'Password123' });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'log2@test.com', password: 'WrongPass1' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(401);
    });

    it('rejects banned user with 403', async () => {
      await createTestUser({ email: 'ban@test.com', password: 'Password123', isBanned: true });
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'ban@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(403);
    });

    it('rejects unknown email with 401', async () => {
      const req = buildRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'nobody@test.com', password: 'Password123' },
      });
      const res = await loginPOST(req);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns null without token', async () => {
      const req = buildRequest('/api/auth/me');
      const res = await meGET(req);
      const { body } = await readJson(res);
      expect(body).toBeNull();
    });

    it('returns session with valid Bearer', async () => {
      const { user, token } = await createTestUser({ email: 'me@test.com' });
      const req = buildRequest('/api/auth/me', { token });
      const res = await meGET(req);
      const { body } = await readJson<{ userId: string; email: string }>(res);
      expect(body.userId).toBe(user.id);
      expect(body.email).toBe(user.email);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('returns success', async () => {
      const res = await logoutPOST();
      const { status, body } = await readJson<{ success: boolean }>(res);
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
