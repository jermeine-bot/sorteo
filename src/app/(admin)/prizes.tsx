import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { PrizeCard } from '../../components/cards/PrizeCard';
import { AppButton } from '../../components/ui/AppButton';
import { WinnerModal } from '../../components/modals/WinnerModal';
import { Toast } from '../../components/feedback/Toast';
import { EmptyState } from '../../components/feedback/EmptyState';
import { usePrizeStore } from '../../stores/prizeStore';
import { useRaffleStore } from '../../stores/raffleStore';
import { colors, typography, spacing } from '../../theme';
import { Trophy, Plus } from 'lucide-react-native';
import { Prize } from '../../types/prize';

export default function PrizesScreen() {
  const { prizes, registerWinner, markAsPaid } = usePrizeStore();
  const { getActiveRaffle } = useRaffleStore();

  const [registerModal, setRegisterModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const activeRaffle = getActiveRaffle();

  const handleRegisterSubmit = async (data: any) => {
    if (!activeRaffle) return;
    await registerWinner(
      activeRaffle.id,
      activeRaffle.name,
      data.winningNumber,
      data.prizeDescription,
      data.amount
    );
    setToastMsg(`¡Número ganador #${data.winningNumber} registrado!`);
  };

  const handlePay = async (prize: Prize) => {
    await markAsPaid(prize.id);
    setToastMsg(`¡Premio de ${prize.prizeDescription} marcado como PAGADO!`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gestión de Premios"
        subtitle="Ganadores y liquidación de premios"
        showBack
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setRegisterModal(true)}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Registrar</Text>
          </TouchableOpacity>
        }
      />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <WinnerModal
        visible={registerModal}
        raffle={activeRaffle || null}
        onClose={() => setRegisterModal(false)}
        onSubmit={handleRegisterSubmit}
      />

      <FlatList
        data={prizes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.prizeWrapper}>
            <PrizeCard prize={item} />
            {item.status !== 'PAID' && (
              <AppButton
                title="Marcar Premio como Pagado"
                onPress={() => handlePay(item)}
                variant="secondary"
                size="sm"
                icon={<Trophy size={14} color={colors.primaryHover} />}
                style={styles.payBtn}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Sin premios registrados"
            description="Aún no se han registrado números ganadores."
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  prizeWrapper: {
    marginBottom: spacing.sm,
  },
  payBtn: {
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
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
});
