import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppCard } from '../../components/ui/AppCard';
import { MoneyText } from '../../components/ui/MoneyText';
import { Toast } from '../../components/feedback/Toast';
import { useSaleStore } from '../../stores/saleStore';
import { useSellerStore } from '../../stores/sellerStore';
import { useRaffleStore } from '../../stores/raffleStore';
import { usePrizeStore } from '../../stores/prizeStore';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { FileText, Download, BarChart2, TrendingUp, DollarSign } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

export default function ReportsScreen() {
  const { sales, getTodaySalesAmount, getTotalCommissions } = useSaleStore();
  const { sellers } = useSellerStore();
  const { raffles } = useRaffleStore();
  const { prizes } = usePrizeStore();

  const [toastMsg, setToastMsg] = useState('');

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.amount, 0);
  const totalCommissions = getTotalCommissions();
  const paidPrizesAmount = prizes
    .filter((p) => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingPrizesAmount = prizes
    .filter((p) => p.status !== 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleExport = (type: 'PDF' | 'EXCEL') => {
    setToastMsg(`Generando reporte en formato ${type}... ¡Descarga iniciada!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Reportes y Estadísticas" subtitle="Análisis consolidado" showBack />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Export Actions Bar */}
        <View style={styles.exportBar}>
          <Text style={styles.exportBarTitle}>Exportar informes</Text>
          <View style={styles.exportBtnRow}>
            <TouchableOpacity
              style={[styles.exportBtn, styles.pdfBtn]}
              onPress={() => handleExport('PDF')}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.exportBtn, styles.excelBtn]}
              onPress={() => handleExport('EXCEL')}
            >
              <Download size={16} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Global Summary */}
        <AppCard style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart2 size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Consolidado Financiero</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Venta Total Bruta</Text>
            <MoneyText amount={totalSalesAmount} size="lg" color={colors.primary} />
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Comisiones Pagadas a Vendedores</Text>
            <MoneyText amount={totalCommissions} size="md" color={colors.secondary} />
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Premios Liquidados</Text>
            <MoneyText amount={paidPrizesAmount} size="md" color={colors.success} />
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Premios Pendientes de Pago</Text>
            <MoneyText amount={pendingPrizesAmount} size="md" color={colors.warning} />
          </View>
        </AppCard>

        {/* Sales by Seller Breakdown */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Ventas por Vendedor</Text>
          {sellers.map((seller) => {
            const sellerSales = sales.filter((s) => s.sellerId === seller.id);
            const total = sellerSales.reduce((acc, s) => acc + s.amount, 0);
            const pct = totalSalesAmount > 0 ? (total / totalSalesAmount) * 100 : 0;

            return (
              <View key={seller.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.sellerName}>
                    {seller.name} {seller.lastName}
                  </Text>
                  <Text style={styles.sellerVal}>{formatCurrency(total)}</Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[styles.fill, { width: `${Math.min(pct, 100)}%` }]}
                  />
                </View>
              </View>
            );
          })}
        </AppCard>

        {/* Sales by Raffle */}
        <AppCard style={styles.card}>
          <Text style={styles.cardTitle}>Ventas por Sorteo</Text>
          {raffles.map((raffle) => {
            const raffleSales = sales.filter((s) => s.raffleId === raffle.id);
            const total = raffleSales.reduce((acc, s) => acc + s.amount, 0);

            return (
              <View key={raffle.id} style={styles.raffleRow}>
                <Text style={styles.raffleName}>{raffle.name}</Text>
                <MoneyText amount={total} size="md" color={colors.textPrimary} />
              </View>
            );
          })}
        </AppCard>
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
  exportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exportBarTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  exportBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.sm,
  },
  pdfBtn: {
    backgroundColor: colors.error,
  },
  excelBtn: {
    backgroundColor: colors.primary,
  },
  exportBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
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
    marginBottom: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metricLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressItem: {
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sellerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  sellerVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  raffleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  raffleName: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
