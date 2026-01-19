'use server';

import { db } from '@/lib/db';
import { articles, articleCategories } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { articleSchema } from '@/lib/validation/schemas';
import { eq, desc, asc, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type ArticleState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createArticle(
  prevState: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    content: formData.get('content') as string,
    excerpt: formData.get('excerpt') as string || null,
    coverImage: formData.get('coverImage') as string || null,
    categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null,
    isPublished: formData.get('isPublished') === 'true',
  };

  const validationResult = articleSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      error: 'Validation échouée',
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { title, slug, content, isPublished } = validationResult.data;

  try {
    // Vérifier si le slug existe déjà
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existingArticle) {
      return { error: 'Ce slug existe déjà' };
    }

    await db.insert(articles).values({
      title,
      slug,
      content,
      excerpt: rawData.excerpt,
      coverImage: rawData.coverImage,
      categoryId: rawData.categoryId,
      isPublished,
      authorId: session.userId,
    });

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    return { success: true };
  } catch (error) {
    console.error('Create article error:', error);
    return { error: 'Une erreur est survenue lors de la création' };
  }
}

export async function updateArticle(
  articleId: string,
  prevState: ArticleState,
  formData: FormData
): Promise<ArticleState> {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    content: formData.get('content') as string,
    excerpt: formData.get('excerpt') as string || null,
    coverImage: formData.get('coverImage') as string || null,
    categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null,
    isPublished: formData.get('isPublished') === 'true',
  };

  const validationResult = articleSchema.safeParse(rawData);
  
  if (!validationResult.success) {
    return { 
      error: 'Validation échouée',
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>
    };
  }

  const { title, slug, content, isPublished } = validationResult.data;

  try {
    // Vérifier si le slug existe déjà pour un autre article
    const existingArticle = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
    });

    if (existingArticle && existingArticle.id !== articleId) {
      return { error: 'Ce slug existe déjà' };
    }

    await db.update(articles)
      .set({
        title,
        slug,
        content,
        excerpt: rawData.excerpt,
        coverImage: rawData.coverImage,
        categoryId: rawData.categoryId,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, articleId));

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    revalidatePath(`/conseils/${slug}`);
    return { success: true };
  } catch (error) {
    console.error('Update article error:', error);
    return { error: 'Une erreur est survenue lors de la mise à jour' };
  }
}

export async function deleteArticle(articleId: string): Promise<ArticleState> {
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    return { error: 'Non autorisé' };
  }

  try {
    await db.delete(articles).where(eq(articles.id, articleId));

    revalidatePath('/admin/articles');
    revalidatePath('/conseils');
    return { success: true };
  } catch (error) {
    console.error('Delete article error:', error);
    return { error: 'Une erreur est survenue lors de la suppression' };
  }
}

export async function getArticles(publishedOnly: boolean = false) {
  try {
    if (publishedOnly) {
      return await db.query.articles.findMany({
        where: eq(articles.isPublished, true),
        with: {
          author: {
            columns: {
              id: true,
              email: true,
              nom: true,
              prenom: true,
            },
          },
          category: true,
        },
        orderBy: [desc(articles.createdAt)],
      });
    }

    return await db.query.articles.findMany({
      with: {
        author: {
          columns: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
        category: true,
      },
      orderBy: [desc(articles.createdAt)],
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return [];
  }
}

export async function getArticleCategories() {
  try {
    return await db.query.articleCategories.findMany({
      orderBy: [asc(articleCategories.label)],
    });
  } catch (error) {
    console.error('Get article categories error:', error);
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: {
        author: {
          columns: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return article;
  } catch (error) {
    console.error('Get article by slug error:', error);
    return null;
  }
}

export async function getArticleById(articleId: string) {
  try {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId),
      with: {
        author: {
          columns: {
            id: true,
            email: true,
            nom: true,
            prenom: true,
          },
        },
      },
    });

    return article;
  } catch (error) {
    console.error('Get article by id error:', error);
    return null;
  }
}
