import { authApi, articlesApi } from '@/lib/api';
import { storeToken, clearToken } from '@/lib/auth';

const mockFetch = global.fetch as jest.Mock;

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('lib/api (mobile)', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(async () => {
    await clearToken();
  });

  it('login posts JSON without Bearer header', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, token: 'tok' }));
    const r = await authApi.login('a@b.co', 'pass');

    expect(r).toEqual({ success: true, token: 'tok' });
    const [, init] = mockFetch.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'a@b.co', password: 'pass' });
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('authenticated request adds Bearer header from SecureStore', async () => {
    await storeToken('jwt-secret');
    mockFetch.mockResolvedValue(jsonResponse(null));
    await authApi.me();

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer jwt-secret');
  });

  it('throws Error with body.error on non-2xx', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ error: 'Non autorisé' }, 403));
    await expect(authApi.me()).rejects.toThrow('Non autorisé');
  });

  it('throws generic message when no error body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('parse');
      },
    } as unknown as Response);
    await expect(authApi.me()).rejects.toThrow(/Erreur HTTP 500/);
  });

  it('articles.list calls publishedOnly=true and skips auth', async () => {
    mockFetch.mockResolvedValue(jsonResponse([]));
    await articlesApi.list();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain('/api/articles?publishedOnly=true');
    expect(init.headers.Authorization).toBeUndefined();
  });
});
