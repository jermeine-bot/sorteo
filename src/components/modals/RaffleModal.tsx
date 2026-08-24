import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { Raffle } from '../../types/raffle';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X } from 'lucide-react-native';

const raffleSchema = z.object({
  name: z.string().min(3, 'Nombre del sorteo requerido'),
  description: z.string().min(3, 'Descripción requerida'),
  drawDate: z.string().min(8, 'Fecha requerida (AAAA-MM-DD)'),
  drawTime: z.string().min(4, 'Hora requerida (HH:MM)'),
  mainPrize: z.string().min(3, 'Premio principal requerido'),
  prizeAmount: z.coerce.number().min(1, 'El valor del premio debe ser mayor a 0'),
  ticketPrice: z.coerce.number().min(1, 'Precio del boleto debe ser mayor a 0'),
  commissionPercentage: z.coerce.number().min(0).max(50),
});

export type RaffleFormData = z.infer<typeof raffleSchema>;

interface RaffleModalProps {
  visible: boolean;
  raffle?: Raffle | null;
  onClose: () => void;
  onSubmit: (data: RaffleFormData) => Promise<void>;
}

export const RaffleModal: React.FC<RaffleModalProps> = ({
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
  } = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema) as any,
    defaultValues: {
      name: raffle?.name || '',
      description: raffle?.description || '',
      drawDate: raffle?.drawDate || new Date().toISOString().split('T')[0],
      drawTime: raffle?.drawTime || '20:00',
      mainPrize: raffle?.mainPrize || '',
      prizeAmount: raffle?.prizeAmount || 10000,
      ticketPrice: raffle?.ticketPrice || 10,
      commissionPercentage: raffle?.commissionPercentage || 10,
    },
  });

  const onFormSubmit = async (data: RaffleFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {raffle ? 'Editar Sorteo' : 'Crear Nuevo Sorteo'}
                </Text>
                <X size={22} color={colors.textSecondary} onPress={onClose} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Nombre del Sorteo"
                      placeholder="Ej. Sorteo Gran Nocturno"
                      value={value}
                      onChangeText={onChange}
                      error={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="description"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Descripción"
                      placeholder="Ej. Sorteo especial con premio en efectivo"
                      value={value}
                      onChangeText={onChange}
                      error={errors.description?.message}
                    />
                  )}
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="drawDate"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Fecha (AAAA-MM-DD)"
                          placeholder="2026-08-15"
                          value={value}
                          onChangeText={onChange}
                          error={errors.drawDate?.message}
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="drawTime"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Hora (HH:MM)"
                          placeholder="20:00"
                          value={value}
                          onChangeText={onChange}
                          error={errors.drawTime?.message}
                        />
                      )}
                    />
                  </View>
                </View>

                <Controller
                  control={control}
                  name="mainPrize"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Premio Principal"
                      placeholder="Ej. C$ 50,000 en efectivo"
                      value={value}
                      onChangeText={onChange}
                      error={errors.mainPrize?.message}
                    />
                  )}
                />

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="prizeAmount"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Monto del Premio (C$)"
                          placeholder="50000"
                          keyboardType="numeric"
                          value={String(value ?? '')}
                          onChangeText={onChange}
                          error={errors.prizeAmount?.message}
                        />
                      )}
                    />
                  </View>
                  
                  {/* input for price */}
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="ticketPrice"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Precio del Boleto (C$)"
                          placeholder="10"
                          keyboardType="numeric"
                          value={String(value ?? '')}
                          onChangeText={onChange}
                          error={errors.ticketPrice?.message}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="commissionPercentage"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Comisión (%)"
                          placeholder="10"
                          keyboardType="numeric"
                          value={String(value ?? '')}
                          onChangeText={onChange}
                          error={errors.commissionPercentage?.message}
                        />
                      )}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.actions}>
                <AppButton
                  title="Cancelar"
                  onPress={onClose}
                  variant="ghost"
                  style={styles.btn}
                />
                <AppButton
                  title={raffle ? 'Guardar Cambios' : 'Crear Sorteo'}
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
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btn: {
    flex: 1,
  },
});
