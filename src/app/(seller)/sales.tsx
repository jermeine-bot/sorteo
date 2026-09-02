import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppInput } from '../../components/ui/AppInput';
import { SaleCard } from '../../components/cards/SaleCard';
import { ReceiptModal } from '../../components/modals/ReceiptModal';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useAuthStore } from '../../stores/authStore';
import { useSaleStore } from '../../stores/saleStore';
import { colors, typography, spacing } from '../../theme';
import { Search } from 'lucide-react-native';
import { Sale } from '../../types/sale';

type TimeFilter = 'TODAY' | 'YESTERDAY' | 'WEEK' | 'ALL';

export default function SellerSalesScreen() {
  const { user } = useAuthStore();
  const { getSalesBySeller } = useSaleStore();

  const [filter, setFilter] = useState<TimeFilter>('TODAY');
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Strictly fetch ONLY authenticated seller's sales
  const sellerSales = user ? getSalesBySeller(user.id) : [];

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredSales = sellerSales.filter((sale) => {
    // Search query filter
    const matchesSearch =
      sale.code.toLowerCase().includes(search.toLowerCase()) ||
      sale.number.includes(search) ||
      sale.raffleName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Time filter
    if (filter === 'TODAY') {
      return sale.date === todayStr;
    }
    if (filter === 'YESTERDAY') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return sale.date === yesterday.toISOString().split('T')[0];
    }
    if (filter === 'WEEK') {
      return true; // Simple week filter
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Mis Ventas"
        subtitle={`Total de ${filteredSales.length} boletos registrados`}
      />

      <View style={styles.container}>
        {/* Receipt Modal for viewing / printing any voucher */}
        <ReceiptModal
          visible={!!selectedSale}
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />

        {/* Time Filter Chips */}
        <View style={styles.filterRow}>
          {(['TODAY', 'YESTERDAY', 'WEEK', 'ALL'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {f === 'TODAY'
                  ? 'Hoy'
                  : f === 'YESTERDAY'
                  ? 'Ayer'
                  : f === 'WEEK'
                  ? 'Esta semana'
                  : 'Todas'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Input */}
        <AppInput
          placeholder="Buscar por código o número..."
          leftIcon={<Search size={18} color={colors.textSecondary} />}
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchBox}
        />

        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SaleCard
              sale={item}
              showSeller={false}
              onPress={() => setSelectedSale(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="Sin ventas registradas"
              description="No hay ventas que coincidan con el filtro seleccionado."
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    fontSize: 11,
  },
  chipTextActive: {
    color: colors.primaryHover,
    fontWeight: '700',
  },
  searchBox: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
