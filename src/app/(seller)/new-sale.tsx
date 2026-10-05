import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/ui/AppHeader';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { MoneyText } from '../../components/ui/MoneyText';
import { AppCard } from '../../components/ui/AppCard';
import { Toast } from '../../components/feedback/Toast';

import { useRaffleStore } from '../../stores/raffleStore';
import { useSaleStore } from '../../stores/saleStore';
import { useAuthStore } from '../../stores/authStore';

import {
  colors,
  typography,
  borderRadius,
  spacing,
  shadows,
} from '../../theme';

import { QUICK_AMOUNTS } from '../../utils/currency';

import {
  Hash,
  DollarSign,
  CheckCircle2,
} from 'lucide-react-native';

export default function NewSaleScreen() {
  const router = useRouter();

  const { user } = useAuthStore();

  const {
    raffles,
    isLoading: rafflesLoading,
    error: rafflesError,
    fetchRaffles,
  } = useRaffleStore();

  const {
    createSale,
    setCurrentReceipt,
  } = useSaleStore();

  const [selectedRaffleId, setSelectedRaffleId] = useState('');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('50');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRaffles();
  }, [fetchRaffles]);

  const activeRaffles = useMemo(() => {
    return raffles.filter(
      (raffle) => raffle.status === 'ACTIVE'
    );
  }, [raffles]);

  useEffect(() => {
    if (activeRaffles.length === 0) {
      setSelectedRaffleId('');
      return;
    }

    const selectedStillExists = activeRaffles.some(
      (raffle) => raffle.id === selectedRaffleId
    );

    if (!selectedStillExists) {
      setSelectedRaffleId(activeRaffles[0].id);
    }
  }, [activeRaffles, selectedRaffleId]);

  const currentRaffle = activeRaffles.find(
    (raffle) => raffle.id === selectedRaffleId
  );

  const numAmount = parseFloat(amount) || 0;

  const commissionPct =
    user?.commissionPercentage ??
    currentRaffle?.commissionPercentage ??
    0;

  const commissionVal =
    (numAmount * commissionPct) / 100;

  useEffect(() => {
    if (rafflesError) {
      setErrorMsg(rafflesError);
    }
  }, [rafflesError]);

  const handleSelectQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  const handleConfirmSale = async () => {
    if (!currentRaffle) {
      setErrorMsg(
        'No hay un sorteo activo seleccionado.'
      );
      return;
    }

    const cleanNumber = number.trim();

    if (!cleanNumber) {
      setErrorMsg(
        'Debes introducir el número para la venta.'
      );
      return;
    }

    if (!/^\d{1,4}$/.test(cleanNumber)) {
      setErrorMsg(
        'El número debe contener entre 1 y 4 dígitos.'
      );
      return;
    }

    if (numAmount <= 0) {
      setErrorMsg(
        'El monto debe ser mayor a C$ 0.'
      );
      return;
    }

    try {
      setErrorMsg('');
      setLoading(true);

      const created = await createSale({
        raffleId: currentRaffle.id,
        number: cleanNumber,
        amount: numAmount,
      });

      await fetchRaffles();

      setCurrentReceipt(created);

      setNumber('');
      setLoading(false);

      router.push('/(seller)/receipt');
    } catch (err: any) {
      console.error(
        '❌ Error procesando venta:',
        err
      );

      setLoading(false);

      setErrorMsg(
        err?.message ||
        'Error al procesar la venta.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Nueva Venta"
        subtitle="Registro ultrarrápido de boletos"
      />

      <Toast
        visible={!!errorMsg}
        message={errorMsg}
        type="error"
        onDismiss={() => setErrorMsg('')}
      />

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <Text style={styles.sectionTitle}>
            1. Seleccionar Sorteo
          </Text>

          {rafflesLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Cargando sorteos...
              </Text>
            </View>
          ) : activeRaffles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No hay sorteos activos
              </Text>

              <Text style={styles.emptyText}>
                Actualmente no existe ningún sorteo
                disponible para registrar ventas.
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.rafflesSelectorRow
              }
            >
              {activeRaffles.map((raffle) => {
                const isSelected =
                  raffle.id === selectedRaffleId;

                return (
                  <TouchableOpacity
                    key={raffle.id}
                    activeOpacity={0.8}
                    style={[
                      styles.raffleChip,
                      isSelected &&
                        styles.raffleChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedRaffleId(raffle.id)
                    }
                  >
                    <Text
                      style={[
                        styles.raffleChipName,
                        isSelected &&
                          styles.textSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {raffle.raffleNumber
                        ? `[${raffle.raffleNumber}] `
                        : ''}
                      {raffle.name}
                    </Text>

                    <Text
                      style={[
                        styles.raffleChipTime,
                        isSelected &&
                          styles.textSelectedSub,
                      ]}
                    >
                      Sorteo: {raffle.drawTime}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>
            2. Introducir Número
          </Text>

          <View style={styles.numberCard}>
            <Hash
              size={24}
              color={colors.primary}
              style={styles.numIcon}
            />

            <AppInput
              placeholder="0000"
              keyboardType="numeric"
              maxLength={4}
              value={number}
              onChangeText={(text) =>
                setNumber(
                  text.replace(/[^0-9]/g, '')
                )
              }
              style={styles.bigNumberInput}
              containerStyle={styles.numContainer}
            />
          </View>

          <Text style={styles.sectionTitle}>
            3. Monto a Apostar (C$)
          </Text>

          <View style={styles.chipsGrid}>
            {QUICK_AMOUNTS.map((val) => {
              const isSelected =
                numAmount === val;

              return (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.8}
                  style={[
                    styles.amountChip,
                    isSelected &&
                      styles.amountChipActive,
                  ]}
                  onPress={() =>
                    handleSelectQuickAmount(val)
                  }
                >
                  <Text
                    style={[
                      styles.amountChipText,
                      isSelected &&
                        styles.amountChipTextActive,
                    ]}
                  >
                    C$ {val}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <AppInput
            label="Otro Monto Personalizado (C$)"
            placeholder="Ej. 150"
            keyboardType="numeric"
            leftIcon={
              <DollarSign
                size={18}
                color={colors.textSecondary}
              />
            }
            value={amount}
            onChangeText={(text) =>
              setAmount(
                text.replace(/[^0-9]/g, '')
              )
            }
          />

          <AppCard style={styles.summaryCard}>
            <Text style={styles.summaryHeader}>
              Resumen de la Venta
            </Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Sorteo:
              </Text>

              <Text
                style={styles.summaryVal}
                numberOfLines={1}
              >
                {currentRaffle?.name ||
                  'Sin sorteo seleccionado'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Número Elegido:
              </Text>

              <Text
                style={styles.summaryValNumber}
              >
                {number || '----'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Monto de Venta:
              </Text>

              <MoneyText
                amount={numAmount}
                size="md"
                color={colors.textPrimary}
              />
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Tu Comisión ({commissionPct}%):
              </Text>

              <MoneyText
                amount={commissionVal}
                size="sm"
                color={colors.secondary}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>
                TOTAL A COBRAR:
              </Text>

              <MoneyText
                amount={numAmount}
                size="xl"
                color={colors.primary}
              />
            </View>
          </AppCard>

          <AppButton
            title="CONFIRMAR VENTA"
            onPress={handleConfirmSale}
            loading={loading}
            size="lg"
            disabled={
              loading ||
              rafflesLoading ||
              !currentRaffle
            }
            icon={
              <CheckCircle2
                size={24}
                color="#FFFFFF"
              />
            }
            style={styles.confirmBtn}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.md,
  },

  rafflesSelectorRow: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },

  raffleChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 160,
    maxWidth: 240,
  },

  raffleChipSelected: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },

  raffleChipName: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },

  raffleChipTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  textSelected: {
    color: colors.primaryHover,
    fontWeight: '700',
  },

  textSelectedSub: {
    color: colors.primary,
  },

  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },

  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },

  numIcon: {
    marginRight: spacing.sm,
  },

  numContainer: {
    flex: 1,
    marginBottom: 0,
  },

  bigNumberInput: {
    ...typography.ticketNumber,
    color: colors.primary,
    textAlign: 'center',
    minHeight: 56,
  },

  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  amountChip: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  amountChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  amountChipText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },

  amountChipTextActive: {
    color: '#FFFFFF',
  },

  summaryCard: {
    marginVertical: spacing.lg,
  },

  summaryHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },

  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  summaryVal: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },

  summaryValNumber: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  totalLabel: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },

  confirmBtn: {
    width: '100%',
    height: 56,
  },
});

