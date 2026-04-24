import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function ConseilsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['articleCategories'],
    queryFn: () => articlesApi.categories(),
  });

  const filtered =
    selectedCategory
      ? articles.filter((a) => a.category?.id === selectedCategory)
      : articles;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.subtitle}>
              Articles rédigés par nos experts pour votre bien-être mental
            </Text>

            {/* Filtres par catégorie */}
            {categories.length > 0 ? (
              <View style={styles.filters}>
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedCategory === null && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedCategory === null && styles.filterTextActive,
                    ]}
                  >
                    Tous
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.filterChip,
                      selectedCategory === cat.id && styles.filterChipActive,
                      selectedCategory === cat.id && { borderColor: cat.colorHex },
                    ]}
                    onPress={() =>
                      setSelectedCategory((prev) => (prev === cat.id ? null : cat.id))
                    }
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedCategory === cat.id && { color: cat.colorHex, fontWeight: FontWeight.semibold },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {filtered.length > 0 ? (
              <Text style={styles.count}>
                {filtered.length} article{filtered.length > 1 ? 's' : ''}
              </Text>
            ) : null}
          </>
        }
        data={isLoading ? [] : filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => router.push(`/(app)/conseils/${item.slug}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <EmptyState
              title="Aucun article disponible"
              description="Les articles seront publiés prochainement."
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  count: {
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  list: { padding: Spacing.lg, gap: 14, paddingBottom: 40 },
});
