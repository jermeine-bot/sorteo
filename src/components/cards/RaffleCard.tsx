import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Raffle } from '../../types/raffle';
import { AppCard } from '../ui/AppCard';
import { MoneyText } from '../ui/MoneyText';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, typography, spacing } from '../../theme';
import { Calendar, Clock, Trophy } from 'lucide-react-native';

interface RaffleCardProps {
  raffle: Raffle;
  onPress?: () => void;
  actionButtons?: React.ReactNode;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
  raffle,
  onPress,
  actionButtons,
}) => {
  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.name}>{raffle.name}</Text>
          <Text style={styles.desc} numberOfLines={1}>
            {raffle.description}
          </Text>
        </View>
        <StatusBadge status={raffle.status} />
      </View>

      <View style={styles.prizeBox}>
        <Trophy size={18} color={colors.accentGold} />
        <View style={styles.prizeInfo}>
          <Text style={styles.prizeLabel}>PREMIO PRINCIPAL</Text>
          <Text style={styles.prizeName}>{raffle.mainPrize}</Text>
        </View>
        <MoneyText amount={raffle.prizeAmount} size="md" color={colors.accentGold} />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{raffle.drawDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.detailText}>{raffle.drawTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailBold}>{raffle.totalSold.toLocaleString()} vts</Text>
        </View>
      </View>

      {actionButtons && <View style={styles.actionsContainer}>{actionButtons}</View>}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  desc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  prizeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    marginVertical: spacing.sm,
  },
  prizeInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  prizeLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.accentGold,
  },
  prizeName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  detailBold: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
