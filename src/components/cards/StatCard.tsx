import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../ui/AppCard';
import { colors, typography, spacing } from '../../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = colors.primaryContainer,
  onPress,
}) => {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  value: {
    ...typography.h2,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
});
