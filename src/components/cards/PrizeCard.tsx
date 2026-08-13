import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Prize } from '../../types/prize';
import { AppCard } from '../ui/AppCard';
import { MoneyText } from '../ui/MoneyText';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, typography, spacing } from '../../theme';
import { Trophy, Hash, User } from 'lucide-react-native';

interface PrizeCardProps {
  prize: Prize;
  onPress?: () => void;
  onPayPress?: () => void;
}

export const PrizeCard: React.FC<PrizeCardProps> = ({
  prize,
  onPress,
}) => {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.raffleBox}>
          <Trophy size={16} color={colors.accentGold} />
          <Text style={styles.raffleName} numberOfLines={1}>
            {prize.raffleName}
          </Text>
        </View>
        <StatusBadge status={prize.status} />
      </View>

      <View style={styles.winnerRow}>
        <View style={styles.numberBadge}>
          <Hash size={16} color={colors.primary} />
          <Text style={styles.numberText}>{prize.winningNumber}</Text>
        </View>

        <View style={styles.prizeDetails}>
          <Text style={styles.desc}>{prize.prizeDescription}</Text>
          <MoneyText amount={prize.amount} size="lg" color={colors.accentGold} />
        </View>
      </View>

      {prize.winnerSellerName && (
        <View style={styles.sellerRow}>
          <User size={12} color={colors.textSecondary} />
          <Text style={styles.sellerText}>Vendedor: {prize.winnerSellerName}</Text>
          {prize.winnerCode && <Text style={styles.codeText}>({prize.winnerCode})</Text>}
        </View>
      )}
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
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  raffleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  raffleName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginLeft: 6,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: spacing.sm,
  },
  numberBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numberText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: 2,
  },
  prizeDetails: {
    flex: 1,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sellerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  codeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
});
