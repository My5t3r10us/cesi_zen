import React from 'react';
import { Text } from 'react-native';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { storeToken, getStoredToken, clearToken } from '@/lib/auth';

const mockFetch = global.fetch as jest.Mock;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(async () => {
    mockFetch.mockReset();
    await clearToken();
  });

  it('initAuth restores user when token is present', async () => {
    await storeToken('persisted-jwt');
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        userId: 'u1',
        email: 'me@test.com',
        role: 'user',
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user?.email).toBe('me@test.com');
  });

  it('login stores token and sets user', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ success: true, token: 'new-jwt' })) // login
      .mockResolvedValueOnce(jsonResponse({ userId: 'u1', email: 'a@b.co', role: 'user' })); // me

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('a@b.co', 'Password123');
    });

    expect(await getStoredToken()).toBe('new-jwt');
    expect(result.current.user?.email).toBe('a@b.co');
  });

  it('login throws if server returns no token', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ success: false }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(
      result.current.login('a@b.co', 'Password123')
    ).rejects.toThrow(/token/);
  });

  it('logout clears token and user', async () => {
    await storeToken('jwt');
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ userId: 'u1', email: 'x@y.z', role: 'user' })) // initAuth me
      .mockResolvedValueOnce(jsonResponse({ success: true })); // logout

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).not.toBeNull());

    await act(async () => {
      await result.current.logout();
    });

    expect(await getStoredToken()).toBeNull();
    expect(result.current.user).toBeNull();
  });
});

// Touch React import to avoid unused warning if minimal hook test
void Text;
