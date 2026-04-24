import React, { useState, useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { entriesApi } from '@/lib/api';
import { EntryCard } from '@/components/EntryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { Entry } from '@/lib/types';

type ViewMode = 'list' | 'calendar';

export default function JournalScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: entries = [], isLoading, refetch } = useQuery({
    queryKey: ['entries'],
    queryFn: () => entriesApi.list(),
  });

  const markedDates = entries.reduce<Record<string, { marked: boolean; dotColor: string }>>(
    (acc, entry) => {
      const date = entry.createdAt.split('T')[0];
      acc[date] = { marked: true, dotColor: Colors.primary };
      return acc;
    },
    {}
  );

  const displayedEntries: Entry[] = selectedDate
    ? entries.filter((e) => e.createdAt.startsWith(selectedDate))
    : entries;

  const onDayPress = useCallback((day: DateData) => {
    setSelectedDate((prev) => (prev === day.dateString ? null : day.dateString));
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Sélecteur de vue */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'list' && styles.modeBtnActive]}
          onPress={() => setMode('list')}
        >
          <Ionicons
            name="list"
            size={18}
            color={mode === 'list' ? Colors.primaryForeground : Colors.mutedForeground}
          />
          <Text style={[styles.modeBtnText, mode === 'list' && styles.modeBtnTextActive]}>
            Liste
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'calendar' && styles.modeBtnActive]}
          onPress={() => setMode('calendar')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={mode === 'calendar' ? Colors.primaryForeground : Colors.mutedForeground}
          />
          <Text style={[styles.modeBtnText, mode === 'calendar' && styles.modeBtnTextActive]}>
            Calendrier
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'calendar' ? (
        <FlatList
          ListHeaderComponent={
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                ...markedDates,
                ...(selectedDate
                  ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: Colors.primary,
                        marked: !!markedDates[selectedDate],
                        dotColor: Colors.primaryForeground,
                      },
                    }
                  : {}),
              }}
              theme={{
                backgroundColor: Colors.background,
                calendarBackground: Colors.card,
                textSectionTitleColor: Colors.mutedForeground,
                selectedDayBackgroundColor: Colors.primary,
                selectedDayTextColor: Colors.primaryForeground,
                todayTextColor: Colors.primary,
                dayTextColor: Colors.foreground,
                textDisabledColor: Colors.border,
                arrowColor: Colors.primary,
                monthTextColor: Colors.foreground,
                textMonthFontWeight: '600',
                dotColor: Colors.primary,
              }}
              style={styles.calendar}
            />
          }
          data={selectedDate ? displayedEntries : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => router.push(`/(app)/journal/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            selectedDate ? (
              <Text style={styles.noEntries}>Aucune entrée ce jour-là</Text>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
          }
        />
      ) : (
        <FlatList
          data={displayedEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => router.push(`/(app)/journal/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              title="Aucune entrée pour le moment"
              description="Commencez à suivre vos émotions en ajoutant votre première entrée."
              action={
                <Button onPress={() => router.push('/(app)/journal/new')}>
                  Ajouter une entrée
                </Button>
              }
            />
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.primary} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/journal/new')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.primaryForeground} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modeToggle: {
    flexDirection: 'row',
    margin: Spacing.lg,
    backgroundColor: Colors.muted,
    borderRadius: 10,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: FontSize.sm, color: Colors.mutedForeground, fontWeight: FontWeight.medium },
  modeBtnTextActive: { color: Colors.primaryForeground },
  calendar: { borderRadius: 12, margin: Spacing.lg },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 100 },
  noEntries: {
    textAlign: 'center',
    color: Colors.mutedForeground,
    fontSize: FontSize.sm,
    padding: Spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
