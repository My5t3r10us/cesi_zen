import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import type { Entry } from '@/lib/types';

interface EntryCardProps {
  entry: Entry;
  onPress?: () => void;
}

function intensityColor(n: number): string {
  if (n <= 1) return '#87CEEB';
  if (n <= 3) return '#8A9A5B';
  if (n <= 4) return '#F0A500';
  return '#E57373';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  const emotionColor =
    entry.emotion?.colorHex ?? entry.emotion?.category?.colorHex ?? Colors.primary;
  const iColor = intensityColor(entry.intensity);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.badges}>
            {entry.emotion && (
              <Badge label={entry.emotion.label} color={emotionColor} />
            )}
            {entry.emotion?.category && (
              <Badge
                label={entry.emotion.category.label}
                color={entry.emotion.category.colorHex}
              />
            )}
          </View>
          <View
            style={[
              styles.intensity,
              { backgroundColor: iColor + '30', borderColor: iColor },
            ]}
          >
            <Text style={[styles.intensityText, { color: iColor }]}>
              {entry.intensity}/5
            </Text>
          </View>
        </View>

        {entry.note ? (
          <Text style={styles.note} numberOfLines={2}>
            {entry.note}
          </Text>
        ) : null}

        {entry.contextTags && entry.contextTags.length > 0 ? (
          <View style={styles.tags}>
            {entry.contextTags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badges: { flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' },
  intensity: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
  },
  intensityText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  note: { fontSize: FontSize.sm, color: Colors.foreground, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    backgroundColor: Colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  date: { fontSize: FontSize.xs, color: Colors.mutedForeground },
});
