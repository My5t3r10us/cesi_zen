import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';

interface IntensityPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function levelColor(n: number): string {
  if (n <= 3) return '#87CEEB';
  if (n <= 6) return '#8A9A5B';
  if (n <= 8) return '#F0E68C';
  return '#E57373';
}

export function IntensityPicker({ value, onChange }: IntensityPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.labelText}>Faible</Text>
        <Text style={styles.labelText}>Élevée</Text>
      </View>
      <View style={styles.row}>
        {LEVELS.map((n) => {
          const isSelected = n === value;
          const color = levelColor(n);
          return (
            <TouchableOpacity
              key={n}
              style={[
                styles.chip,
                { borderColor: color },
                isSelected && { backgroundColor: color },
              ]}
              onPress={() => onChange(n)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#fff' : color }]}>
                {n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.selected}>
        Intensité sélectionnée : <Text style={styles.selectedValue}>{value}/10</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  labelText: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  selected: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  selectedValue: { fontWeight: FontWeight.bold, color: Colors.foreground },
});
