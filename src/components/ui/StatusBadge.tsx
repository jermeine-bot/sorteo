import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';

export type StatusType =
  | 'ACTIVE'
  | 'PROGRAMMED'
  | 'FINISHED'
  | 'CANCELLED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'VERIFIED'
  | 'PAID'
  | 'ACTIVE_USER'
  | 'INACTIVE_USER';

interface StatusBadgeProps {
  status: StatusType | string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'VERIFIED':
      case 'ACTIVE_USER':
      case 'true':
        return {
          label: customLabel || (status === 'ACTIVE_USER' || status === 'true' ? 'Activo' : status === 'ACTIVE' ? 'Activo' : 'Confirmado'),
          bg: colors.badgeActiveBg,
          text: colors.badgeActiveText,
        };
      case 'PROGRAMMED':
      case 'PENDING':
        return {
          label: customLabel || (status === 'PROGRAMMED' ? 'Programado' : 'Pendiente'),
          bg: colors.badgeScheduledBg,
          text: colors.badgeScheduledText,
        };
      case 'FINISHED':
      case 'PAID':
        return {
          label: customLabel || (status === 'FINISHED' ? 'Finalizado' : 'Pagado'),
          bg: colors.badgeFinishedBg,
          text: colors.badgeFinishedText,
        };
      case 'CANCELLED':
      case 'INACTIVE_USER':
      case 'false':
        return {
          label: customLabel || (status === 'INACTIVE_USER' || status === 'false' ? 'Inactivo' : 'Cancelado'),
          bg: colors.badgeCancelledBg,
          text: colors.badgeCancelledText,
        };
      default:
        return {
          label: customLabel || String(status),
          bg: colors.surfaceVariant,
          text: colors.textSecondary,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
});
