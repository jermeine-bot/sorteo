import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../../types/user';
import { AppCard } from '../ui/AppCard';
import { MoneyText } from '../ui/MoneyText';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, typography, spacing } from '../../theme';
import { User as UserIcon, Phone, Percent } from 'lucide-react-native';

interface SellerCardProps {
  seller: User;
  onPress?: () => void;
  onToggleStatus?: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({
  seller,
  onPress,
}) => {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <UserIcon size={20} color={colors.primary} />
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.fullName}>
            {seller.name} {seller.lastName}
          </Text>
          <Text style={styles.username}>@{seller.username}</Text>
        </View>
        <StatusBadge status={seller.active ? 'ACTIVE_USER' : 'INACTIVE_USER'} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>VENTAS HOY</Text>
          <MoneyText amount={seller.dailySales} size="md" color={colors.primary} />
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TOTAL VENDIDO</Text>
          <MoneyText amount={seller.totalSales} size="md" color={colors.textPrimary} />
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.infoRow}>
          <Phone size={12} color={colors.textSecondary} />
          <Text style={styles.infoText}>{seller.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Percent size={12} color={colors.textSecondary} />
          <Text style={styles.infoText}>Comisión: {seller.commissionPercentage}%</Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nameCol: {
    flex: 1,
  },
  fullName: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  username: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
