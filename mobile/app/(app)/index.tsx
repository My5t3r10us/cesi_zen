import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { entriesApi } from '@/lib/api';
import { EntryCard } from '@/components/EntryCard';
import { Card } from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => entriesApi.stats(),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const displayName = user?.prenom ?? user?.email?.split('@')[0] ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {greeting()}, {displayName} 👋
            </Text>
            <Text style={styles.subGreeting}>Comment vous sentez-vous aujourd'hui ?</Text>
          </View>
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>🧘</Text>
          </View>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push('/(app)/journal/new')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primaryForeground} />
          <Text style={styles.ctaText}>Ajouter une entrée</Text>
        </TouchableOpacity>

        {/* Stats rapides */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 16 }} />
        ) : stats ? (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Entrées au total</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.dailyAverages.length > 0
                  ? (
                      stats.dailyAverages.reduce((s, d) => s + d.averageIntensity, 0) /
                      stats.dailyAverages.length
                    ).toFixed(1)
                  : '–'}
              </Text>
              <Text style={styles.statLabel}>Intensité moy.</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.dailyAverages.length}</Text>
              <Text style={styles.statLabel}>Jours actifs</Text>
            </Card>
          </View>
        ) : null}

        {/* Raccourcis */}
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.shortcuts}>
          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/journal')}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="book" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.shortcutLabel}>Mon journal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/conseils')}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#87CEEB22' }]}>
              <Ionicons name="newspaper" size={22} color="#5BA4CE" />
            </View>
            <Text style={styles.shortcutLabel}>Conseils</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcut}
            onPress={() => router.push('/(app)/statistiques')}
            activeOpacity={0.8}
          >
            <View style={[styles.shortcutIcon, { backgroundColor: '#DDA0DD22' }]}>
              <Ionicons name="bar-chart" size={22} color="#9B59B6" />
            </View>
            <Text style={styles.shortcutLabel}>Statistiques</Text>
          </TouchableOpacity>
        </View>

        {/* Dernières entrées */}
        {stats?.recentEntries && stats.recentEntries.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Dernières entrées</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/journal')}>
                <Text style={styles.seeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {stats.recentEntries.slice(0, 3).map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onPress={() => router.push(`/(app)/journal/${entry.id}`)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, gap: Spacing.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  subGreeting: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontSize: 24 },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: {
    color: Colors.primaryForeground,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary },
  shortcuts: { flexDirection: 'row', gap: 12 },
  shortcut: { flex: 1, alignItems: 'center', gap: 8 },
  shortcutIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: FontSize.xs,
    color: Colors.foreground,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
});
