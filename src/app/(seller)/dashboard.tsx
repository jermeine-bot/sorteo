import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatCard } from '../../components/cards/StatCard';
import { SaleCard } from '../../components/cards/SaleCard';
import { RaffleCard } from '../../components/cards/RaffleCard';
import { AppButton } from '../../components/ui/AppButton';

import { useAuthStore } from '../../stores/authStore';
import { useSaleStore } from '../../stores/saleStore';
import { useRaffleStore } from '../../stores/raffleStore';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../theme';

import {
  PlusCircle,
  Ticket,
  DollarSign,
  Percent,
} from 'lucide-react-native';

import { formatCurrency } from '../../utils/currency';

export default function SellerDashboard() {
  const router = useRouter();

  const { user } = useAuthStore();
  const { sales, fetchSales } = useSaleStore();

  const { getActiveRaffle, fetchRaffles } = useRaffleStore();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadDashboard = async () => {
        try {
          await Promise.all([
            fetchSales(),
            fetchRaffles(),
          ]);
        } catch (error) {
          if (!cancelled) {
            console.error(
              '❌ Error cargando dashboard del vendedor:',
              error
            );
          }
        }
      };

      loadDashboard();

      return () => {
        cancelled = true;
      };
    }, [fetchSales, fetchRaffles])
  );

  const activeRaffle = getActiveRaffle();

  const mySales = user
    ? sales.filter(
        (sale) =>
          sale.sellerId === user.id &&
          sale.status === 'CONFIRMED'
      )
    : [];

  const today = new Date();

  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const myTodaySales = mySales.filter(
    (sale) => sale.date === todayStr
  );

  const todayAmount = myTodaySales.reduce(
    (acc, sale) => acc + Number(sale.amount || 0),
    0
  );

  const todayCount = myTodaySales.length;

  const todayCommission = myTodaySales.reduce(
    (acc, sale) => acc + Number(sale.commission || 0),
    0
  );

  const recentMySales = mySales.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top User Greeting Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingLabel}>
              Vendedor Autenticado
            </Text>

            <Text style={styles.sellerName}>
              Hola, {user?.name || 'Vendedor'}
            </Text>
          </View>
        </View>

        {/* Big High-Speed Sell Action Button */}
        <TouchableOpacity
          style={styles.bigSellCta}
          activeOpacity={0.85}
          onPress={() => router.push('/(seller)/new-sale')}
        >
          <View style={styles.ctaIconBadge}>
            <PlusCircle
              size={32}
              color={colors.primary}
            />
          </View>

          <View style={styles.ctaTextCol}>
            <Text style={styles.ctaTitle}>
              NUEVA VENTA RÁPIDA
            </Text>

            <Text style={styles.ctaSubtitle}>
              Registra una venta en segundos
            </Text>
          </View>
        </TouchableOpacity>

        {/* Balance & Daily Summary */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Balance de hoy
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/(seller)/daily-sales')
            }
          >
            <Text style={styles.linkText}>
              Ver desglose diario
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.kpiGrid}>
          <StatCard
            title="Vendido Hoy"
            value={formatCurrency(todayAmount)}
            subtitle={`${todayCount} boletos emitidos`}
            icon={
              <DollarSign
                size={20}
                color={colors.primary}
              />
            }
          />

          <StatCard
            title="Tu Comisión"
            value={formatCurrency(todayCommission)}
            subtitle={`Comisión: ${
              user?.commissionPercentage || 10
            }%`}
            icon={
              <Percent
                size={20}
                color={colors.secondary}
              />
            }
            iconBgColor={colors.secondaryLight}
          />
        </View>

        {/* Active Raffle Spotlight */}
        <Text style={styles.sectionTitle}>
          Sorteo activo para venta
        </Text>

        {activeRaffle ? (
          <RaffleCard
            raffle={activeRaffle}
            onPress={() =>
              router.push('/(seller)/new-sale')
            }
            actionButtons={
              <AppButton
                title="Vender en este Sorteo"
                onPress={() =>
                  router.push('/(seller)/new-sale')
                }
                size="sm"
                icon={
                  <Ticket
                    size={16}
                    color="#FFFFFF"
                  />
                }
              />
            }
          />
        ) : (
          <Text style={styles.emptyText}>
            No hay sorteos activos en este momento.
          </Text>
        )}

        {/* My Recent Sales */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Mis ventas recientes
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/(seller)/sales')
            }
          >
            <Text style={styles.linkText}>
              Ver mis ventas
            </Text>
          </TouchableOpacity>
        </View>

        {recentMySales.length > 0 ? (
          recentMySales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              showSeller={false}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            Aún no has registrado ventas hoy.
          </Text>
        )}
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

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  greetingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  sellerName: {
    ...typography.h2,
    color: colors.textPrimary,
  },

  bigSellCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },

  ctaIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  ctaTextCol: {
    flex: 1,
  },

  ctaTitle: {
    ...typography.h2,
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 0.5,
  },

  ctaSubtitle: {
    ...typography.caption,
    color: colors.primaryLight,
    marginTop: 2,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },

  linkText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },

  kpiGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginVertical: spacing.md,
  },
});
