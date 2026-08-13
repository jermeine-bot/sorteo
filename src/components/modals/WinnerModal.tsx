import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { Raffle } from '../../types/raffle';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X, Trophy } from 'lucide-react-native';

const winnerSchema = z.object({
  winningNumber: z.string().min(1, 'Debes ingresar el número ganador').regex(/^\d+$/, 'Solo se permiten números'),
  prizeDescription: z.string().min(2, 'Descripción del premio requerida'),
  amount: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : Number(val)),
    z.number().min(1, 'El valor debe ser mayor a 0')
  ),
});

export type WinnerFormData = z.infer<typeof winnerSchema>;

interface WinnerModalProps {
  visible: boolean;
  raffle: Raffle | null;
  onClose: () => void;
  onSubmit: (data: WinnerFormData) => Promise<void>;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  visible,
  raffle,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WinnerFormData>({
    resolver: zodResolver(winnerSchema),
    defaultValues: {
      winningNumber: '',
      prizeDescription: raffle?.mainPrize || 'Premio Mayor',
      amount: raffle?.prizeAmount || 50000,
    },
  });

  const onFormSubmit = async (data: WinnerFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Trophy size={22} color={colors.accentGold} />
                  <Text style={styles.title}>Registrar Ganador</Text>
                </View>
                <X size={22} color={colors.textSecondary} onPress={onClose} />
              </View>

              {raffle && (
                <View style={styles.raffleBox}>
                  <Text style={styles.raffleName}>{raffle.name}</Text>
                  <Text style={styles.raffleDetail}>{raffle.drawDate} • {raffle.drawTime}</Text>
                </View>
              )}

              <Controller
                control={control}
                name="winningNumber"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Número Ganador"
                    placeholder="Ej. 4587"
                    keyboardType="numeric"
                    maxLength={4}
                    value={value}
                    onChangeText={onChange}
                    error={errors.winningNumber?.message}
                    style={styles.bigInput}
                  />
                )}
              />

              <Controller
                control={control}
                name="prizeDescription"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Descripción del Premio"
                    placeholder="Premio Mayor C$ 50,000"
                    value={value}
                    onChangeText={onChange}
                    error={errors.prizeDescription?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Monto Ganador (C$)"
                    placeholder="50000"
                    keyboardType="numeric"
                    value={String(value ?? '')}
                    onChangeText={onChange}
                    error={errors.amount?.message}
                  />
                )}
              />

              <View style={styles.actions}>
                <AppButton
                  title="Cancelar"
                  onPress={onClose}
                  variant="ghost"
                  style={styles.btn}
                />
                <AppButton
                  title="Guardar Ganador"
                  onPress={handleSubmit(onFormSubmit)}
                  loading={isSubmitting}
                  style={styles.btn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginLeft: 6,
  },
  raffleBox: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  raffleName: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  raffleDetail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bigInput: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btn: {
    flex: 1,
  },
});
