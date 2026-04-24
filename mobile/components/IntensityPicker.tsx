import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

interface IntensityPickerProps {
  value: number;
  onChange: (value: number) => void;
}

function sliderColor(n: number): string {
  if (n <= 1) return '#87CEEB';
  if (n <= 3) return '#8A9A5B';
  if (n <= 4) return '#F0A500';
  return '#E57373';
}

const LABELS: Record<number, string> = {
  0: 'Nulle',
  1: 'Très faible',
  2: 'Faible',
  3: 'Modérée',
  4: 'Élevée',
  5: 'Très élevée',
};

export function IntensityPicker({ value, onChange }: IntensityPickerProps) {
  const color = sliderColor(value);
  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={styles.labelText}>Faible</Text>
        <Text style={styles.labelText}>Élevée</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={5}
        step={1}
        value={value}
        onValueChange={(v) => onChange(Math.round(v))}
        minimumTrackTintColor={color}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={color}
      />
      <View style={styles.ticks}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <Text
            key={n}
            style={[styles.tick, n === value && { color, fontWeight: FontWeight.bold }]}
          >
            {n}
          </Text>
        ))}
      </View>
      <Text style={styles.selected}>
        {LABELS[value]} —{' '}
        <Text style={[styles.selectedValue, { color }]}>{value}/5</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  labelText: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  slider: { width: '100%', height: 40 },
  ticks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tick: { fontSize: FontSize.xs, color: Colors.mutedForeground },
  selected: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedValue: { fontWeight: FontWeight.bold },
});
