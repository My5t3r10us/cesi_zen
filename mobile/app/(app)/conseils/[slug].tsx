import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import RenderHtml from 'react-native-render-html';
import { articlesApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesApi.bySlug(slug!),
    enabled: !!slug,
  });

  useEffect(() => {
    if (article?.title) {
      navigation.setOptions({ title: article.title });
    }
  }, [article?.title, navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Article introuvable</Text>
      </View>
    );
  }

  const authorName = article.author?.prenom
    ? `${article.author.prenom} ${article.author.nom ?? ''}`.trim()
    : article.author?.email ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête de l'article */}
        <View style={styles.header}>
          {article.category ? (
            <Badge label={article.category.label} color={article.category.colorHex} />
          ) : null}

          <Text style={styles.title}>{article.title}</Text>

          {article.excerpt ? (
            <Text style={styles.excerpt}>{article.excerpt}</Text>
          ) : null}

          <View style={styles.meta}>
            {authorName ? (
              <Text style={styles.metaText}>Par {authorName}</Text>
            ) : null}
            <Text style={styles.metaText}>
              {new Date(article.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.separator} />
        </View>

        {/* Contenu HTML */}
        <RenderHtml
          contentWidth={width - Spacing.xl * 2}
          source={{ html: article.content }}
          tagsStyles={{
            body: {
              color: Colors.foreground,
              fontSize: FontSize.base,
              lineHeight: 26,
            },
            p: {
              color: Colors.foreground,
              fontSize: FontSize.base,
              lineHeight: 26,
              marginBottom: 12,
            },
            h1: {
              color: Colors.foreground,
              fontSize: FontSize['2xl'],
              fontWeight: FontWeight.bold,
              marginTop: 20,
              marginBottom: 8,
            },
            h2: {
              color: Colors.foreground,
              fontSize: FontSize.xl,
              fontWeight: FontWeight.bold,
              marginTop: 16,
              marginBottom: 6,
            },
            h3: {
              color: Colors.foreground,
              fontSize: FontSize.lg,
              fontWeight: FontWeight.semibold,
              marginTop: 12,
              marginBottom: 4,
            },
            strong: { fontWeight: FontWeight.bold },
            em: { fontStyle: 'italic' },
            a: { color: Colors.primary },
            ul: { paddingLeft: 20, marginBottom: 12 },
            ol: { paddingLeft: 20, marginBottom: 12 },
            li: {
              color: Colors.foreground,
              fontSize: FontSize.base,
              lineHeight: 24,
              marginBottom: 4,
            },
            blockquote: {
              borderLeftWidth: 3,
              borderLeftColor: Colors.primary,
              paddingLeft: 12,
              marginLeft: 0,
              marginBottom: 12,
            },
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: Colors.mutedForeground, fontSize: FontSize.base },
  container: { padding: Spacing.xl, paddingBottom: 40 },
  header: { gap: 12, marginBottom: Spacing.xl },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    lineHeight: 36,
  },
  excerpt: {
    fontSize: FontSize.base,
    color: Colors.mutedForeground,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  meta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  metaText: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
});
