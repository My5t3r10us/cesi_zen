'use client';

import { useActionState, useState, useEffect } from 'react';
import { createArticle, updateArticle, ArticleState } from '@/lib/actions/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Article, ArticleCategory } from '@/lib/db/schema';

interface ArticleFormProps {
  article?: Article;
  categories?: ArticleCategory[];
}

export function ArticleForm({ article, categories = [] }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [coverImage, setCoverImage] = useState(article?.coverImage || '');
  const [categoryId, setCategoryId] = useState<string>(article?.categoryId?.toString() || '');
  const [isPublished, setIsPublished] = useState(article?.isPublished || false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!article) {
      const generatedSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, article]);

  const action = article 
    ? updateArticle.bind(null, article.id)
    : createArticle;

  const [state, formAction, pending] = useActionState<ArticleState, FormData>(
    async (prevState, formData) => {
      const result = await action(prevState, formData);
      if (result.success) {
        toast.success(article ? 'Article mis à jour !' : 'Article créé !');
        router.push('/admin/articles');
      }
      return result;
    },
    {}
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          type="text"
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Comment gérer son stress au quotidien"
          className="h-11"
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL) *</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">/conseils/</span>
          <Input
            type="text"
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="gerer-stress-quotidien"
            className="h-11"
          />
        </div>
        {state.fieldErrors?.slug && (
          <p className="text-sm text-destructive">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Catégorie</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.colorHex }}
                    />
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="categoryId" value={categoryId} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="coverImage">Image de couverture (URL)</Label>
          <Input
            type="url"
            id="coverImage"
            name="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Résumé (optionnel)</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Un court résumé de l'article..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu (Markdown) *</Label>
        <Textarea
          id="content"
          name="content"
          required
          defaultValue={article?.content || ''}
          placeholder="# Introduction&#10;&#10;Votre contenu ici..."
          rows={15}
          className="font-mono text-sm"
        />
        {state.fieldErrors?.content && (
          <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <input type="hidden" name="isPublished" value={isPublished ? 'true' : 'false'} />
        <Label htmlFor="isPublished" className="cursor-pointer">
          Publier l&apos;article
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {article ? 'Mise à jour...' : 'Création...'}
            </>
          ) : (
            article ? 'Mettre à jour' : 'Créer l\'article'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
