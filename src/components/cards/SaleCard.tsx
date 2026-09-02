import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sale } from '../../types/sale';
import { AppCard } from '../ui/AppCard';
import { MoneyText } from '../ui/MoneyText';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, typography, spacing } from '../../theme';
import { Ticket, User as UserIcon, Clock } from 'lucide-react-native';

interface SaleCardProps {
  sale: Sale;
  onPress?: () => void;
  showSeller?: boolean;
}

export const SaleCard: React.FC<SaleCardProps> = ({
  sale,
  onPress,
  showSeller = true,
}) => {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.codeBadge}>
          <Ticket size={14} color={colors.primary} />
          <Text style={styles.codeText}>{sale.code}</Text>
        </View>
        <View style={styles.statusGroup}>
          <StatusBadge status={sale.status} />
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.numberBox}>
          <Text style={styles.numberLabel}>NÚMERO</Text>
          <Text style={styles.numberVal}>{sale.number}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.raffleName} numberOfLines={1}>
            {sale.raffleName}
          </Text>
          {showSeller && (
            <View style={styles.detailRow}>
              <UserIcon size={12} color={colors.textSecondary} />
              <Text style={styles.detailText}>{sale.sellerName}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              {sale.date} • {sale.time}
            </Text>
          </View>
        </View>

        <View style={styles.amountCol}>
          <MoneyText amount={sale.amount} size="lg" color={colors.textPrimary} />
          <Text style={styles.commissionText}>Com: C${sale.commission}</Text>
        </View>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: spacing.xs,
  },
  codeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryHover,
    marginLeft: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberBox: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    minWidth: 70,
  },
  numberLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  numberVal: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 20,
  },
  infoCol: {
    flex: 1,
  },
  raffleName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  commissionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
