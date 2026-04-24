import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}` as keyof typeof styles],
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.primaryForeground : Colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}` as keyof typeof styles],
            styles[`textSize_${size}` as keyof typeof styles],
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    gap: 8,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.secondary },
  destructive: { backgroundColor: Colors.destructive },
  ghost: { backgroundColor: 'transparent' },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: { opacity: 0.5 },
  size_sm: { paddingHorizontal: 12, paddingVertical: 8 },
  size_md: { paddingHorizontal: 16, paddingVertical: 12 },
  size_lg: { paddingHorizontal: 20, paddingVertical: 16 },
  text: { fontWeight: FontWeight.medium },
  text_primary: { color: Colors.primaryForeground },
  text_secondary: { color: Colors.secondaryForeground },
  text_destructive: { color: '#FFFFFF' },
  text_ghost: { color: Colors.foreground },
  text_outline: { color: Colors.foreground },
  textSize_sm: { fontSize: FontSize.sm },
  textSize_md: { fontSize: FontSize.base },
  textSize_lg: { fontSize: FontSize.lg },
});
