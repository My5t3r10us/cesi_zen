import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { entriesApi } from '@/lib/api';
import { MoodChart } from '@/components/MoodChart';
import { Card } from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

type Period = '7j' | '30j' | '90j';

const PERIODS: { label: string; value: Period; days: number }[] = [
  { label: '7 jours', value: '7j', days: 7 },
  { label: '30 jours', value: '30j', days: 30 },
  { label: '90 jours', value: '90j', days: 90 },
];

export default function StatistiquesScreen() {
  const [period, setPeriod] = useState<Period>('30j');

  const days = PERIODS.find((p) => p.value === period)?.days ?? 30;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['detailedStats', period],
    queryFn: () =>
      entriesApi.detailedStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      ),
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Mes statistiques</Text>

        {/* Sélecteur de période */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodBtn, period === p.value && styles.periodBtnActive]}
              onPress={() => setPeriod(p.value)}
            >
              <Text
                style={[
                  styles.periodText,
                  period === p.value && styles.periodTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : stats ? (
          <>
            {/* Cartes récapitulatives */}
            <View style={styles.kpiRow}>
              <Card style={styles.kpi}>
                <Text style={styles.kpiValue}>{stats.totalEntries}</Text>
                <Text style={styles.kpiLabel}>Entrées</Text>
              </Card>
              <Card style={styles.kpi}>
                <Text style={styles.kpiValue}>
                  {stats.averageIntensity > 0 ? stats.averageIntensity.toFixed(1) : '–'}
                </Text>
                <Text style={styles.kpiLabel}>Intensité moy.</Text>
              </Card>
              <Card style={styles.kpi}>
                <Text style={styles.kpiValue}>{stats.streakDays}</Text>
                <Text style={styles.kpiLabel}>Jours de suite 🔥</Text>
              </Card>
            </View>

            {/* Graphique d'humeur */}
            <Card>
              <MoodChart data={stats.dailyAverages} title="Évolution de l'humeur" />
            </Card>

            {/* Émotion & catégorie les plus fréquentes */}
            <View style={styles.row}>
              {stats.mostFrequentEmotion ? (
                <Card style={styles.half}>
                  <Text style={styles.cardLabel}>Émotion fréquente</Text>
                  <Text style={styles.cardValue}>{stats.mostFrequentEmotion.label}</Text>
                  <Text style={styles.cardCount}>
                    {stats.mostFrequentEmotion.count} fois
                  </Text>
                </Card>
              ) : null}
              {stats.mostFrequentCategory ? (
                <Card style={styles.half}>
                  <Text style={styles.cardLabel}>Catégorie fréquente</Text>
                  <Text style={styles.cardValue}>{stats.mostFrequentCategory.label}</Text>
                  <Text style={styles.cardCount}>
                    {stats.mostFrequentCategory.count} fois
                  </Text>
                </Card>
              ) : null}
            </View>

            {/* Distribution des émotions */}
            {stats.emotionDistribution.length > 0 ? (
              <Card>
                <Text style={styles.sectionTitle}>Distribution des émotions</Text>
                <View style={styles.distList}>
                  {stats.emotionDistribution.slice(0, 8).map((item) => {
                    const pct = Math.round((item.count / stats.totalEntries) * 100);
                    const color = item.colorHex ?? Colors.primary;
                    return (
                      <View key={item.emotionId} style={styles.distItem}>
                        <View style={styles.distLabelRow}>
                          <Text style={styles.distLabel}>{item.label}</Text>
                          <Text style={styles.distCount}>
                            {item.count} ({pct}%)
                          </Text>
                        </View>
                        <View style={styles.bar}>
                          <View
                            style={[
                              styles.barFill,
                              { width: `${pct}%`, backgroundColor: color },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            ) : null}

            {/* Tags de contexte */}
            {stats.contextTagsDistribution.length > 0 ? (
              <Card>
                <Text style={styles.sectionTitle}>Contextes fréquents</Text>
                <View style={styles.tagCloud}>
                  {stats.contextTagsDistribution.slice(0, 10).map((item) => (
                    <View key={item.tag} style={styles.tagItem}>
                      <Text style={styles.tagLabel}>#{item.tag}</Text>
                      <Text style={styles.tagCount}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </>
        ) : (
          <Card>
            <Text style={styles.empty}>
              Aucune donnée pour cette période. Commencez à enregistrer vos émotions !
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  pageTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: Colors.muted,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  periodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodBtnActive: { backgroundColor: Colors.card },
  periodText: { fontSize: FontSize.sm, color: Colors.mutedForeground },
  periodTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, alignItems: 'center', gap: 4 },
  kpiValue: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  kpiLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1, gap: 4 },
  cardLabel: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  cardValue: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  cardCount: { fontSize: FontSize.xs, color: Colors.primary },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
    marginBottom: 12,
  },
  distList: { gap: 10 },
  distItem: { gap: 4 },
  distLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  distLabel: { fontSize: FontSize.sm, color: Colors.foreground },
  distCount: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  bar: {
    height: 6,
    backgroundColor: Colors.muted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagItem: {
    backgroundColor: Colors.muted,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagLabel: { fontSize: FontSize.xs, color: Colors.foreground },
  tagCount: {
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    fontWeight: FontWeight.semibold,
  },
  empty: {
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});
