import { vi } from 'vitest';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(process.cwd(), '.env.test') });

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32chars-long';
}
if (!process.env.ENCRYPTION_KEY) {
  // 32 bytes = 64 hex chars (AES-256)
  process.env.ENCRYPTION_KEY =
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
}

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const cookieStore = new Map<string, { value: string }>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => cookieStore.get(name),
    set: (name: string, value: string) => {
      cookieStore.set(name, { value });
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
}));

export function clearTestCookies() {
  cookieStore.clear();
}
