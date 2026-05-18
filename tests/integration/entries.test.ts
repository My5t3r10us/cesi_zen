import { describe, it, expect, beforeEach } from 'vitest';
import {
  GET as entriesGET,
  POST as entriesPOST,
} from '@/app/api/entries/route';
import {
  GET as entryGET,
  PUT as entryPUT,
  DELETE as entryDELETE,
} from '@/app/api/entries/[id]/route';
import { GET as statsGET } from '@/app/api/entries/stats/route';
import { GET as detailedGET } from '@/app/api/entries/detailed-stats/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedEmotion } from '../helpers/db';
import { createTestUser } from '../helpers/auth';

type Entry = {
  id: string;
  userId: string;
  emotionId: number;
  intensity: number;
  note: string | null;
  contextTags: string[] | null;
};

describe('Entries API', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await entriesGET(buildRequest('/api/entries'));
    expect(res.status).toBe(401);
  });

  it('creates an entry with encrypted note and reads it back decrypted', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    const createRes = await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: {
          emotionId: emotion.id,
          intensity: 7,
          note: 'Ma note privée',
          contextTags: ['travail', 'sommeil'],
        },
      })
    );
    expect(createRes.status).toBe(200);

    const listRes = await entriesGET(buildRequest('/api/entries', { token }));
    const { body } = await readJson<Entry[]>(listRes);
    expect(body).toHaveLength(1);
    expect(body[0].note).toBe('Ma note privée');
    expect(body[0].intensity).toBe(7);
    expect(body[0].contextTags).toEqual(['travail', 'sommeil']);
  });

  it('enforces ownership: cannot read another user\'s entry', async () => {
    const userA = await createTestUser({ email: 'a@test.com' });
    const userB = await createTestUser({ email: 'b@test.com' });
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token: userA.token,
        body: { emotionId: emotion.id, intensity: 5 },
      })
    );

    const listB = await entriesGET(buildRequest('/api/entries', { token: userB.token }));
    const { body } = await readJson<Entry[]>(listB);
    expect(body).toEqual([]);
  });

  it('rejects invalid input with 400', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();
    const res = await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 99 },
      })
    );
    expect(res.status).toBe(400);
  });

  it('updates and deletes own entry', async () => {
    const { token, user } = await createTestUser();
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 3, note: 'first' },
      })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const params = Promise.resolve({ id: entry.id });
    const putRes = await entryPUT(
      buildRequest(`/api/entries/${entry.id}`, {
        method: 'PUT',
        token,
        body: { emotionId: emotion.id, intensity: 9, note: 'updated' },
      }),
      { params }
    );
    expect(putRes.status).toBe(200);

    const detailRes = await entryGET(
      buildRequest(`/api/entries/${entry.id}`, { token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    const { body: detail } = await readJson<Entry>(detailRes);
    expect(detail.intensity).toBe(9);
    expect(detail.note).toBe('updated');
    expect(detail.userId).toBe(user.id);

    const delRes = await entryDELETE(
      buildRequest(`/api/entries/${entry.id}`, { method: 'DELETE', token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(delRes.status).toBe(200);
  });

  it('returns 404 when getting another user\'s entry by id', async () => {
    const userA = await createTestUser({ email: 'aa@test.com' });
    const userB = await createTestUser({ email: 'bb@test.com' });
    const { emotion } = await seedEmotion();

    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token: userA.token,
        body: { emotionId: emotion.id, intensity: 5 },
      })
    );
    const list = await entriesGET(buildRequest('/api/entries', { token: userA.token }));
    const [entry] = (await readJson<Entry[]>(list)).body;

    const res = await entryGET(
      buildRequest(`/api/entries/${entry.id}`, { token: userB.token }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(res.status).toBe(404);
  });

  it('stats endpoint returns aggregates', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();

    for (const intensity of [3, 5, 7]) {
      await entriesPOST(
        buildRequest('/api/entries', {
          method: 'POST',
          token,
          body: { emotionId: emotion.id, intensity },
        })
      );
    }

    const res = await statsGET(buildRequest('/api/entries/stats', { token }));
    const { body } = await readJson<{ totalEntries: number; dailyAverages: unknown[] }>(res);
    expect(body.totalEntries).toBe(3);
    expect(Array.isArray(body.dailyAverages)).toBe(true);
  });

  it('detailed-stats requires startDate + endDate', async () => {
    const { token } = await createTestUser();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', { token })
    );
    expect(res.status).toBe(400);
  });

  it('detailed-stats returns full breakdown', async () => {
    const { token } = await createTestUser();
    const { emotion } = await seedEmotion();
    await entriesPOST(
      buildRequest('/api/entries', {
        method: 'POST',
        token,
        body: { emotionId: emotion.id, intensity: 5, contextTags: ['sport'] },
      })
    );

    const start = new Date(Date.now() - 86400_000).toISOString();
    const end = new Date(Date.now() + 86400_000).toISOString();
    const res = await detailedGET(
      buildRequest('/api/entries/detailed-stats', {
        token,
        query: { startDate: start, endDate: end },
      })
    );
    const { body } = await readJson<{
      totalEntries: number;
      averageIntensity: number;
      contextTagsDistribution: Array<{ tag: string; count: number }>;
    }>(res);
    expect(body.totalEntries).toBe(1);
    expect(body.averageIntensity).toBe(5);
    expect(body.contextTagsDistribution[0]).toMatchObject({ tag: 'sport', count: 1 });
  });
});
