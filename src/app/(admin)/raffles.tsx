import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Alert, Modal } from 'react-native';
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
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Plus, Trophy, AlertTriangle } from 'lucide-react-native';
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
    deleteRaffle,
  } = useRaffleStore();

  useEffect(() => {
    fetchRaffles();
  }, []);

  const { registerWinner } = usePrizeStore();

  const [createModal, setCreateModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [winnerModalRaffle, setWinnerModalRaffle] = useState<Raffle | null>(null);
  const [raffleToDelete, setRaffleToDelete] = useState<Raffle | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PROGRAMMED' | 'FINISHED'>('ALL');

  const filteredRaffles = raffles.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  const handleCreateOrUpdate = async (data: RaffleFormData) => {
    try {
      if (selectedRaffle) {
        await updateRaffle(selectedRaffle.id, data);
        setToastMsg('¡Sorteo actualizado correctamente!');
      } else {
        await createRaffle(data);
        setToastMsg('¡Nuevo sorteo creado con éxito!');
      }
    } catch (error: any) {
      console.error('Error guardando sorteo:', error);
      setToastMsg(error?.message || 'Error al guardar el sorteo');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!raffleToDelete) return;
    try {
      await deleteRaffle(raffleToDelete.id);
      setToastMsg(`Sorteo #${raffleToDelete.raffleNumber || raffleToDelete.name} eliminado.`);
      setRaffleToDelete(null);
    } catch (err: any) {
      setToastMsg(err?.message || 'Error al eliminar sorteo');
      setRaffleToDelete(null);
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
          <Text style={styles.loadingText}>Cargando sorteos...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton title="Reintentar" onPress={fetchRaffles} size="sm" />
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

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        visible={!!raffleToDelete}
        animationType="fade"
        onRequestClose={() => setRaffleToDelete(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <View style={styles.iconCircle}>
              <AlertTriangle size={28} color={colors.error} />
            </View>
            <Text style={styles.confirmTitle}>¿Eliminar Sorteo?</Text>
            <Text style={styles.confirmDesc}>
              Esta acción eliminará de forma permanente el sorteo "{raffleToDelete?.name}" ({raffleToDelete?.raffleNumber}). Esta acción no se puede deshacer.
            </Text>

            <View style={styles.confirmActions}>
              <AppButton
                title="Cancelar"
                variant="ghost"
                onPress={() => setRaffleToDelete(null)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Sí, Eliminar"
                variant="primary"
                onPress={handleDeleteConfirm}
                style={{ flex: 1, backgroundColor: colors.error }}
              />
            </View>
          </View>
        </View>
      </Modal>

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
            onEdit={() => {
              setSelectedRaffle(item);
              setCreateModal(true);
            }}
            onDelete={() => setRaffleToDelete(item)}
            actionButtons={
              <View style={styles.cardActions}>
                {item.status === 'PROGRAMMED' && (
                  <AppButton
                    title="Activar"
                    onPress={() => handleStatusChange(item, 'ACTIVE')}
                    variant="secondary"
                    size="sm"
                  />
                )}
                {item.status === 'ACTIVE' && (
                  <AppButton
                    title="Ganador"
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
    gap: spacing.xs,
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  confirmDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
});
