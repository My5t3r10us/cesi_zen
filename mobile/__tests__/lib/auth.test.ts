import { storeToken, getStoredToken, clearToken } from '@/lib/auth';

describe('lib/auth (mobile token storage)', () => {
  beforeEach(async () => {
    await clearToken();
  });

  it('storeToken persists a token', async () => {
    await storeToken('jwt-abc');
    expect(await getStoredToken()).toBe('jwt-abc');
  });

  it('clearToken removes the stored token', async () => {
    await storeToken('jwt-xyz');
    await clearToken();
    expect(await getStoredToken()).toBeNull();
  });

  it('throws on invalid token', async () => {
    await expect(storeToken('')).rejects.toThrow(/Invalid token/);
    // @ts-expect-error - testing runtime guard
    await expect(storeToken(undefined)).rejects.toThrow(/Invalid token/);
  });
});
