import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '../../components/cards/StatCard';
import { SaleCard } from '../../components/cards/SaleCard';
import { RaffleCard } from '../../components/cards/RaffleCard';
import { AppButton } from '../../components/ui/AppButton';
import { RaffleModal } from '../../components/modals/RaffleModal';
import { WinnerModal } from '../../components/modals/WinnerModal';
import { Toast } from '../../components/feedback/Toast';
import { useAuthStore } from '../../stores/authStore';
import { useSaleStore } from '../../stores/saleStore';
import { useRaffleStore } from '../../stores/raffleStore';
import { useSellerStore } from '../../stores/sellerStore';
import { usePrizeStore } from '../../stores/prizeStore';
import { colors, typography, spacing } from '../../theme';
import {
  DollarSign,
  Ticket,
  Trophy,
  Users,
  PlusCircle,
  Award,
  BarChart3,
} from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sales, getTodaySalesAmount, getTodaySalesCount } = useSaleStore();
  const { getActiveRaffle, createRaffle } = useRaffleStore();
  const { sellers } = useSellerStore();
  const { prizes, registerWinner } = usePrizeStore();

  const [createRaffleModal, setCreateRaffleModal] = useState(false);
  const [winnerModal, setWinnerModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const activeRaffle = getActiveRaffle();
  const todayAmount = getTodaySalesAmount();
  const todayCount = getTodaySalesCount();
  const activeSellersCount = sellers.filter((s) => s.active).length;
  const pendingPrizesCount = prizes.filter((p) => p.status === 'PENDING').length;
  const recentSales = sales.slice(0, 4);

  const handleCreateRaffleSubmit = async (data: any) => {
    await createRaffle({
      name: data.name,
      description: data.description,
      drawDate: data.drawDate,
      drawTime: data.drawTime,
      mainPrize: data.mainPrize,
      prizeAmount: data.prizeAmount,
      ticketPrice: data.ticketPrice,
      commissionPercentage: data.commissionPercentage,
      status: 'ACTIVE',
      totalTickets: 10000,
    });
    setToastMsg('¡Sorteo creado exitosamente!');
  };

  const handleRegisterWinnerSubmit = async (data: any) => {
    if (!activeRaffle) return;
    await registerWinner(
      activeRaffle.id,
      activeRaffle.name,
      data.winningNumber,
      data.prizeDescription,
      data.amount
    );
    setToastMsg(`¡Ganador #${data.winningNumber} registrado!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <RaffleModal
        visible={createRaffleModal}
        onClose={() => setCreateRaffleModal(false)}
        onSubmit={handleCreateRaffleSubmit}
      />

      <WinnerModal
        visible={winnerModal}
        raffle={activeRaffle || null}
        onClose={() => setWinnerModal(false)}
        onSubmit={handleRegisterWinnerSubmit}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header User Profile Bar */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.welcomeLabel}>Panel de Control</Text>
            <Text style={styles.adminName}>
              Hola, {user?.name || 'Administrador'} 
            </Text>
          </View>
        </View>

        {/* Resumen KPI Cards */}
        <Text style={styles.sectionTitle}>Resumen general</Text>
        <View style={styles.kpiGrid}>
          <StatCard
            title="Ventas Hoy"
            value={`${todayCount} boletos`}
            subtitle="Tickets emitidos"
            icon={<Ticket size={20} color={colors.primary} />}
            iconBgColor={colors.primaryContainer}
            onPress={() => router.push('/(admin)/sales')}
          />
          <StatCard
            title="Dinero Vendido"
            value={formatCurrency(todayAmount)}
            subtitle="Recaudado hoy"
            icon={<DollarSign size={20} color={colors.secondary} />}
            iconBgColor={colors.secondaryLight}
            onPress={() => router.push('/(admin)/sales')}
          />
          <StatCard
            title="Premios Pendientes"
            value={`${pendingPrizesCount} por pagar`}
            subtitle="Ganadores sin liquidar"
            icon={<Trophy size={20} color={colors.accentGold} />}
            iconBgColor={colors.accentLight}
            onPress={() => router.push('/(admin)/prizes')}
          />
          <StatCard
            title="Vendedores Activos"
            value={`${activeSellersCount} de ${sellers.length}`}
            subtitle="Operando hoy"
            icon={<Users size={20} color={colors.info} />}
            iconBgColor={colors.infoBg}
            onPress={() => router.push('/(admin)/sellers')}
          />
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setCreateRaffleModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primaryContainer }]}>
              <PlusCircle size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>Crear Sorteo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(admin)/sales')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondaryLight }]}>
              <Ticket size={22} color={colors.secondary} />
            </View>
            <Text style={styles.actionText}>Ver Ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setWinnerModal(true)}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
              <Award size={22} color={colors.accentGold} />
            </View>
            <Text style={styles.actionText}>Registrar Ganador</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(admin)/reports')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.infoBg }]}>
              <BarChart3 size={22} color={colors.info} />
            </View>
            <Text style={styles.actionText}>Ver Reportes</Text>
          </TouchableOpacity>
        </View>

        {/* Sorteo Actual */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Sorteo actual en curso</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/raffles')}>
            <Text style={styles.linkText}>Gestionar todo</Text>
          </TouchableOpacity>
        </View>
        {activeRaffle ? (
          <RaffleCard raffle={activeRaffle} />
        ) : (
          <Text style={styles.emptyText}>No hay sorteos activos en este momento.</Text>
        )}

        {/* Actividad Reciente */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Actividad reciente de ventas</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/sales')}>
            <Text style={styles.linkText}>Ver historial completo</Text>
          </TouchableOpacity>
        </View>

        {recentSales.map((sale) => (
          <SaleCard key={sale.id} sale={sale} />
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  welcomeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  adminName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  linkText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginVertical: spacing.md,
  },
});
