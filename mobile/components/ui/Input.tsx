import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[styles.input, error ? styles.inputError : undefined, style]}
          placeholderTextColor={Colors.mutedForeground}
          {...props}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.foreground,
  },
  input: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: FontSize.base,
    color: Colors.foreground,
  },
  inputError: { borderColor: Colors.destructive },
  error: {
    fontSize: FontSize.xs,
    color: Colors.destructive,
  },
});
