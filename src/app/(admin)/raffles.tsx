import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { RaffleCard } from '../../components/cards/RaffleCard';
import { RaffleModal } from '../../components/modals/RaffleModal';
import { WinnerModal } from '../../components/modals/WinnerModal';
import { AppButton } from '../../components/ui/AppButton';
import { Toast } from '../../components/feedback/Toast';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useRaffleStore } from '../../stores/raffleStore';
import { usePrizeStore } from '../../stores/prizeStore';
import { colors, typography, spacing } from '../../theme';
import { Plus, Trophy } from 'lucide-react-native';
import { Raffle } from '../../types/raffle';
import { RaffleFormData } from '../../components/modals/RaffleModal';

export default function RafflesScreen() {
  const {
  raffles,
  isLoading,
  error,
  fetchRaffles,
  createRaffle,
  updateRaffle,
  } = useRaffleStore();

  useEffect(() => {
  fetchRaffles();
  }, []);

  const { registerWinner } = usePrizeStore();

  const [createModal, setCreateModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [winnerModalRaffle, setWinnerModalRaffle] = useState<Raffle | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PROGRAMMED' | 'FINISHED'>('ALL');

  const filteredRaffles = raffles.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const handleCreateOrUpdate = async (
  data: RaffleFormData
  ) => {
    try {
      if (selectedRaffle) {
        await updateRaffle(
          selectedRaffle.id,
          data
        );
        setToastMsg(
          '¡Sorteo actualizado!'
        );
      } else {
        await createRaffle(data);
        setToastMsg(
          '¡Nuevo sorteo creado!'
        );
      }
    } catch (error) {
      console.error(
        'Error guardando sorteo:',
        error
      );
    }
  };

  const handleStatusChange = async (raffle: Raffle, newStatus: 'ACTIVE' | 'FINISHED' | 'CANCELLED') => {
    await updateRaffle(raffle.id, { status: newStatus });
    setToastMsg(`Sorteo cambiado a ${newStatus}`);
  };

  const handleRegisterWinner = async (data: any) => {
    if (!winnerModalRaffle) return;
    await registerWinner(
      winnerModalRaffle.id,
      winnerModalRaffle.name,
      data.winningNumber,
      data.prizeDescription,
      data.amount
    );
    await updateRaffle(winnerModalRaffle.id, {
      status: 'FINISHED',
      winningNumber: data.winningNumber,
    });
    setToastMsg(`¡Ganador #${data.winningNumber} registrado y sorteo finalizado!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gestión de Sorteos"
        subtitle={`${raffles.length} sorteos registrados`}
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setSelectedRaffle(null);
              setCreateModal(true);
            }}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </TouchableOpacity>
        }
      />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      {isLoading && raffles.length === 0 && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Cargando sorteos...
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>

          <AppButton
            title="Reintentar"
            onPress={fetchRaffles}
            size="sm"
          />
        </View>
      )}

      <RaffleModal
        visible={createModal}
        raffle={selectedRaffle}
        onClose={() => setCreateModal(false)}
        onSubmit={handleCreateOrUpdate}
      />

      <WinnerModal
        visible={!!winnerModalRaffle}
        raffle={winnerModalRaffle}
        onClose={() => setWinnerModalRaffle(null)}
        onSubmit={handleRegisterWinner}
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'ACTIVE', 'PROGRAMMED', 'FINISHED'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, statusFilter === filter && styles.filterChipActive]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter === 'ALL'
                ? 'Todos'
                : filter === 'ACTIVE'
                ? 'Activos'
                : filter === 'PROGRAMMED'
                ? 'Programados'
                : 'Finalizados'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRaffles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RaffleCard
            raffle={item}
            onPress={() => {
              setSelectedRaffle(item);
              setCreateModal(true);
            }}
            actionButtons={
              <View style={styles.cardActions}>
                {item.status === 'PROGRAMMED' && (
                  <AppButton
                    title="Activar Sorteo"
                    onPress={() => handleStatusChange(item, 'ACTIVE')}
                    variant="secondary"
                    size="sm"
                  />
                )}
                {item.status === 'ACTIVE' && (
                  <AppButton
                    title="Registrar Ganador"
                    onPress={() => setWinnerModalRaffle(item)}
                    variant="primary"
                    size="sm"
                    icon={<Trophy size={14} color="#FFFFFF" />}
                  />
                )}
              </View>
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Sin sorteos"
            description="No hay sorteos disponibles para el filtro seleccionado."
            actionTitle="Crear Sorteo"
            onAction={() => setCreateModal(true)}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs + 2,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primaryHover,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.sm,
  },
  addBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  loadingContainer: {
  paddingVertical: spacing.xl,
  alignItems: 'center',
  },

  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  errorContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    gap: spacing.sm,
  },

  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});
