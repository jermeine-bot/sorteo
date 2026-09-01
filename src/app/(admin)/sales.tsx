import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppInput } from '../../components/ui/AppInput';
import { SaleCard } from '../../components/cards/SaleCard';
import { StatCard } from '../../components/cards/StatCard';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useSaleStore } from '../../stores/saleStore';
import { colors, typography, spacing } from '../../theme';
import { Search, DollarSign, Ticket, Percent, TrendingUp } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';
import { Sale } from '../../types/sale';

export default function AdminSalesScreen() {
  const { sales } = useSaleStore();
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.number.includes(q) ||
      s.sellerName.toLowerCase().includes(q) ||
      s.raffleName.toLowerCase().includes(q)
    );
  });

  const totalAmount = filteredSales.reduce((acc, s) => acc + s.amount, 0);
  const totalCount = filteredSales.length;
  const totalCommission = filteredSales.reduce((acc, s) => acc + s.commission, 0);
  const avgSale = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Auditoría de Ventas" subtitle="Monitoreo de todas las transacciones" />

      <View style={styles.container}>
        {/* Receipt Voucher Viewer Modal */}
        <ReceiptModal
          visible={!!selectedSale}
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />

        {/* KPI Banner */}
        <View style={styles.kpiGrid}>
          <StatCard
            title="Total Recaudado"
            value={formatCurrency(totalAmount)}
            subtitle="Monto bruto"
            icon={<DollarSign size={18} color={colors.primary} />}
          />
          <StatCard
            title="Total Boletos"
            value={`${totalCount}`}
            subtitle="Emitidos"
            icon={<Ticket size={18} color={colors.secondary} />}
            iconBgColor={colors.secondaryLight}
          />
          <StatCard
            title="Comisiones"
            value={formatCurrency(totalCommission)}
            subtitle="Para vendedores"
            icon={<Percent size={18} color={colors.warning} />}
            iconBgColor={colors.warningBg}
          />
          <StatCard
            title="Promedio Venta"
            value={formatCurrency(avgSale)}
            subtitle="Por boleto"
            icon={<TrendingUp size={18} color={colors.info} />}
            iconBgColor={colors.infoBg}
          />
        </View>

        {/* Search */}
        <AppInput
          placeholder="Buscar por código, número, vendedor o sorteo..."
          leftIcon={<Search size={18} color={colors.textSecondary} />}
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchBox}
        />

        {/* List */}
        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SaleCard
              sale={item}
              showSeller
              onPress={() => setSelectedSale(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No hay ventas registradas"
              description="No se encontraron transacciones que coincidan con la búsqueda."
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBox: {
    marginVertical: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
