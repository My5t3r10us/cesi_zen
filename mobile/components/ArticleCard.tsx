import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import type { Article } from '@/lib/types';

interface ArticleCardProps {
  article: Article;
  onPress?: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ArticleCard({ article, onPress }: ArticleCardProps) {
  const authorName = article.author?.prenom
    ? `${article.author.prenom} ${article.author.nom ?? ''}`.trim()
    : article.author?.email ?? '';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        {article.category ? (
          <Badge label={article.category.label} color={article.category.colorHex} />
        ) : null}
        <Text style={styles.title}>{article.title}</Text>
        {article.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={3}>
            {article.excerpt}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.date}>{formatDate(article.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  date: { fontSize: FontSize.xs, color: Colors.mutedForeground },
});
