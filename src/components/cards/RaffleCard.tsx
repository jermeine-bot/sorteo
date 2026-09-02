import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Raffle } from '../../types/raffle';
import { AppCard } from '../ui/AppCard';
import { MoneyText } from '../ui/MoneyText';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Calendar, Clock, Trophy, Ticket, Hash, Edit2, Trash2 } from 'lucide-react-native';

interface RaffleCardProps {
  raffle: Raffle;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  actionButtons?: React.ReactNode;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
  raffle,
  onPress,
  onEdit,
  onDelete,
  actionButtons,
}) => {
  const ticketDisplay = raffle.isUnlimitedTickets
    ? 'Ilimitados'
    : `${raffle.totalSold.toLocaleString()} / ${raffle.totalTickets.toLocaleString()}`;

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <View style={styles.nameRow}>
            <View style={styles.codeBadge}>
              <Hash size={12} color={colors.primary} />
              <Text style={styles.codeText}>{raffle.raffleNumber || 'SRT'}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {raffle.name}
            </Text>
          </View>
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

      {/* Schedule Info */}
      <View style={styles.scheduleBox}>
        <View style={styles.scheduleCol}>
          <Text style={styles.scheduleLabel}>INICIO VENTA</Text>
          <View style={styles.detailItem}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={styles.detailText}>{raffle.startDate || 'N/A'}</Text>
            <Clock size={12} color={colors.textSecondary} style={{ marginLeft: 6 }} />
            <Text style={styles.detailText}>{raffle.startTime || '08:00'}</Text>
          </View>
        </View>

        <View style={styles.scheduleDivider} />

        <View style={styles.scheduleCol}>
          <Text style={styles.scheduleLabel}>HORA SORTEO</Text>
          <View style={styles.detailItem}>
            <Calendar size={12} color={colors.primary} />
            <Text style={styles.detailTextBold}>{raffle.drawDate}</Text>
            <Clock size={12} color={colors.primary} style={{ marginLeft: 6 }} />
            <Text style={styles.detailTextBold}>{raffle.drawTime}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Info Row: Ticket Capacity & Price */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ticket size={14} color={colors.secondary} />
          <Text style={styles.ticketText}>
            Boletos: <Text style={styles.ticketBold}>{ticketDisplay}</Text>
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailText}>Boleto: </Text>
          <Text style={styles.priceBold}>C$ {raffle.ticketPrice}</Text>
        </View>
      </View>

      {/* Admin Action Buttons or custom actionButtons */}
      {(onEdit || onDelete || actionButtons) && (
        <View style={styles.actionsContainer}>
          <View style={styles.adminActionGroup}>
            {onEdit && (
              <TouchableOpacity style={styles.iconBtn} onPress={onEdit}>
                <Edit2 size={16} color={colors.primary} />
                <Text style={styles.iconBtnTextTextPrimary}>Editar</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={onDelete}>
                <Trash2 size={16} color={colors.error} />
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
          {actionButtons}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  codeText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryHover,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
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
    marginVertical: spacing.xs,
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
  scheduleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
  },
  scheduleCol: {
    flex: 1,
  },
  scheduleLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  scheduleDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
    marginLeft: 3,
  },
  detailTextBold: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: 3,
  },
  ticketText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  ticketBold: {
    fontWeight: '700',
    color: colors.secondary,
  },
  priceBold: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primary,
  },
  actionsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adminActionGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryContainer,
  },
  iconBtnTextTextPrimary: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: colors.errorBg,
  },
  deleteBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.error,
    marginLeft: 4,
  },
});
