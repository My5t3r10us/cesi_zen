import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BorderRadius, FontSize } from '@/constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export function Badge({ label, color = '#8A9A5B', style }: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '22', borderColor: color + '55' },
        style,
      ]}
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
