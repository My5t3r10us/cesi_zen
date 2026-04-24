import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.foreground,
    textAlign: 'center',
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  action: { marginTop: 8 },
});
