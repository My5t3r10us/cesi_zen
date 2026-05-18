import { describe, it, expect, beforeEach } from 'vitest';
import {
  GET as articlesGET,
  POST as articlesPOST,
} from '@/app/api/articles/route';
import { GET as bySlugGET } from '@/app/api/articles/by-slug/[slug]/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb, seedArticleCategory } from '../helpers/db';
import { createTestUser } from '../helpers/auth';
import { db } from '@/lib/db';
import { articles } from '@/lib/db/schema';

type Article = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  authorId: string;
};

describe('Articles API', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('GET /api/articles returns all articles by default', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const cat = await seedArticleCategory();
    await db.insert(articles).values([
      { title: 'Pub', slug: 'pub', content: 'x', isPublished: true, authorId: admin.user.id, categoryId: cat.id },
      { title: 'Draft', slug: 'draft', content: 'x', isPublished: false, authorId: admin.user.id, categoryId: cat.id },
    ]);

    const res = await articlesGET(buildRequest('/api/articles'));
    const { body } = await readJson<Article[]>(res);
    expect(body).toHaveLength(2);
  });

  it('GET /api/articles?publishedOnly=true filters drafts', async () => {
    const admin = await createTestUser({ role: 'admin' });
    await db.insert(articles).values([
      { title: 'Pub', slug: 'pub', content: 'x', isPublished: true, authorId: admin.user.id },
      { title: 'Draft', slug: 'draft', content: 'x', isPublished: false, authorId: admin.user.id },
    ]);

    const res = await articlesGET(
      buildRequest('/api/articles', { query: { publishedOnly: 'true' } })
    );
    const { body } = await readJson<Article[]>(res);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe('pub');
  });

  it('POST /api/articles requires admin role', async () => {
    // No session → 403 (uses getSession cookie-only, no cookie set)
    const res = await articlesPOST(
      buildRequest('/api/articles', {
        method: 'POST',
        body: { title: 't', slug: 'foo', content: 'x', isPublished: true },
      })
    );
    expect(res.status).toBe(403);
  });

  it('GET /api/articles/by-slug/[slug] returns 404 if not found', async () => {
    const res = await bySlugGET(buildRequest('/api/articles/by-slug/nope'), {
      params: Promise.resolve({ slug: 'nope' }),
    });
    expect(res.status).toBe(404);
  });

  it('GET /api/articles/by-slug/[slug] returns the article', async () => {
    const admin = await createTestUser({ role: 'admin' });
    await db.insert(articles).values({
      title: 'Hello',
      slug: 'hello',
      content: '<p>Hi</p>',
      isPublished: true,
      authorId: admin.user.id,
    });
    const res = await bySlugGET(buildRequest('/api/articles/by-slug/hello'), {
      params: Promise.resolve({ slug: 'hello' }),
    });
    const { body } = await readJson<Article>(res);
    expect(body.title).toBe('Hello');
    expect(body.slug).toBe('hello');
  });
});
