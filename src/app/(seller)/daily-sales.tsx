import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppCard } from '../../components/ui/AppCard';
import { MoneyText } from '../../components/ui/MoneyText';
import { useAuthStore } from '../../stores/authStore';
import { useSaleStore } from '../../stores/saleStore';
import { colors, typography, spacing } from '../../theme';
import { Calendar, DollarSign, Percent, ArrowDownLeft } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

export default function DailySalesScreen() {
  const { user } = useAuthStore();
  const { getSalesBySeller } = useSaleStore();

  const mySales = user ? getSalesBySeller(user.id) : [];
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = mySales.filter((s) => s.date === todayStr);

  const totalGrossAmount = todaySales.reduce((acc, s) => acc + s.amount, 0);
  const commissionPercentage = user?.commissionPercentage || 10;
  const totalCommission = (totalGrossAmount * commissionPercentage) / 100;
  const netToDeliver = totalGrossAmount - totalCommission;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Arqueo Diario de Ventas" subtitle="Liquidación y comisiones del día" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Liquidation Summary Card */}
        <AppCard style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Resumen del Día ({todayStr})</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Venta Bruta Total ({todaySales.length} boletos)</Text>
            <MoneyText amount={totalGrossAmount} size="lg" color={colors.textPrimary} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Tu Comisión ({commissionPercentage}%)</Text>
            <MoneyText amount={totalCommission} size="md" color={colors.secondary} />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.netLabel}>EFECTIVO A ENTREGAR</Text>
            <MoneyText amount={netToDeliver} size="xl" color={colors.primary} />
          </View>
        </AppCard>

        {/* Detailed Breakdown */}
        <Text style={styles.sectionTitle}>Detalle de boletos de hoy</Text>
        {todaySales.map((sale) => (
          <View key={sale.id} style={styles.itemRow}>
            <View>
              <Text style={styles.itemCode}>{sale.code} • Número: {sale.number}</Text>
              <Text style={styles.itemTime}>{sale.time} - {sale.raffleName}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <MoneyText amount={sale.amount} size="md" color={colors.textPrimary} />
              <Text style={styles.itemComm}>Comisión: C${sale.commission}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginLeft: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.xs + 2,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  netLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemCode: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  itemTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemComm: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
});
