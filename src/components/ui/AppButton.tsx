import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = styles.base;

    // Size
    if (size === 'sm') base = { ...base, paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md };
    else if (size === 'lg') base = { ...base, paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
    else base = { ...base, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg };

    // Variant
    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: disabled ? colors.border : colors.primary,
          ...(isInteractive ? shadows.subtle : {}),
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: disabled ? colors.surfaceVariant : colors.primaryContainer,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: disabled ? colors.border : colors.primary,
        };
      case 'danger':
        return {
          ...base,
          backgroundColor: disabled ? colors.border : colors.error,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = { ...typography.button };

    if (size === 'sm') base = { ...base, fontSize: 13 };
    if (size === 'lg') base = { ...base, fontSize: 16 };

    switch (variant) {
      case 'primary':
      case 'danger':
        return { ...base, color: colors.textOnPrimary };
      case 'secondary':
        return { ...base, color: colors.primaryHover };
      case 'outline':
      case 'ghost':
        return { ...base, color: disabled ? colors.textMuted : colors.primary };
      default:
        return base;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!isInteractive}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.xs + 2 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
});
