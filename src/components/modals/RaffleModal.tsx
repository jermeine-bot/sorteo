import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableWithoutFeedback, Switch, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { Raffle } from '../../types/raffle';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X, Ticket, Calendar, Clock, Hash } from 'lucide-react-native';

const raffleSchema = z.object({
  raffleNumber: z.string().min(1, 'Número/código de sorteo requerido'),
  name: z.string().min(3, 'Nombre del sorteo requerido'),
  description: z.string().min(3, 'Descripción requerida'),
  startDate: z.string().min(8, 'Fecha inicio requerida (AAAA-MM-DD)'),
  startTime: z.string().min(4, 'Hora inicio requerida (HH:MM)'),
  drawDate: z.string().min(8, 'Fecha sorteo requerida (AAAA-MM-DD)'),
  drawTime: z.string().min(4, 'Hora sorteo requerida (HH:MM)'),
  mainPrize: z.string().min(3, 'Premio principal requerido'),
  prizeAmount: z.coerce.number().min(1, 'El valor del premio debe ser mayor a 0'),
  ticketPrice: z.coerce.number().min(1, 'Precio del boleto debe ser mayor a 0'),
  commissionPercentage: z.coerce.number().min(0).max(50),
  isUnlimitedTickets: z.boolean(),
  totalTickets: z.coerce.number().min(0),
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
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema) as any,
    defaultValues: {
      raffleNumber: raffle?.raffleNumber || `SRT-${Math.floor(100 + Math.random() * 900)}`,
      name: raffle?.name || '',
      description: raffle?.description || '',
      startDate: raffle?.startDate || new Date().toISOString().split('T')[0],
      startTime: raffle?.startTime || '08:00',
      drawDate: raffle?.drawDate || new Date().toISOString().split('T')[0],
      drawTime: raffle?.drawTime || '20:00',
      mainPrize: raffle?.mainPrize || '',
      prizeAmount: raffle?.prizeAmount || 10000,
      ticketPrice: raffle?.ticketPrice || 10,
      commissionPercentage: raffle?.commissionPercentage || 10,
      isUnlimitedTickets: raffle?.isUnlimitedTickets ?? true,
      totalTickets: raffle?.totalTickets || 5000,
    },
  });

  const isUnlimited = watch('isUnlimitedTickets');

  useEffect(() => {
    if (visible) {
      reset({
        raffleNumber: raffle?.raffleNumber || `SRT-${Math.floor(100 + Math.random() * 900)}`,
        name: raffle?.name || '',
        description: raffle?.description || '',
        startDate: raffle?.startDate || new Date().toISOString().split('T')[0],
        startTime: raffle?.startTime || '08:00',
        drawDate: raffle?.drawDate || new Date().toISOString().split('T')[0],
        drawTime: raffle?.drawTime || '20:00',
        mainPrize: raffle?.mainPrize || '',
        prizeAmount: raffle?.prizeAmount || 10000,
        ticketPrice: raffle?.ticketPrice || 10,
        commissionPercentage: raffle?.commissionPercentage || 10,
        isUnlimitedTickets: raffle?.isUnlimitedTickets ?? true,
        totalTickets: raffle?.totalTickets || 5000,
      });
    }
  }, [visible, raffle, reset]);

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
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollForm}>
                <View style={styles.row}>
                  <View style={styles.col1}>
                    <Controller
                      control={control}
                      name="raffleNumber"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Nº / Código Sorteo"
                          placeholder="Ej. SRT-101"
                          leftIcon={<Hash size={18} color={colors.primary} />}
                          value={value}
                          onChangeText={onChange}
                          error={errors.raffleNumber?.message}
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col2}>
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
                  </View>
                </View>

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

                {/* Section: Start Schedule */}
                <Text style={styles.sectionHeader}>Horario de Inicio de Venta</Text>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Fecha Inicio (AAAA-MM-DD)"
                          placeholder="2026-08-01"
                          leftIcon={<Calendar size={16} color={colors.textSecondary} />}
                          value={value}
                          onChangeText={onChange}
                          error={errors.startDate?.message}
                        />
                      )}
                    />
                  </View>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="startTime"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Hora Inicio (HH:MM)"
                          placeholder="08:00"
                          leftIcon={<Clock size={16} color={colors.textSecondary} />}
                          value={value}
                          onChangeText={onChange}
                          error={errors.startTime?.message}
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Section: Draw Schedule */}
                <Text style={styles.sectionHeader}>Horario de Sorteo / Finalización</Text>
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="drawDate"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Fecha Sorteo (AAAA-MM-DD)"
                          placeholder="2026-08-15"
                          leftIcon={<Calendar size={16} color={colors.primary} />}
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
                          label="Hora Sorteo (HH:MM)"
                          placeholder="20:00"
                          leftIcon={<Clock size={16} color={colors.primary} />}
                          value={value}
                          onChangeText={onChange}
                          error={errors.drawTime?.message}
                        />
                      )}
                    />
                  </View>
                </View>

                {/* Section: Tickets Config */}
                <Text style={styles.sectionHeader}>Capacidad de Boletos</Text>
                <View style={styles.toggleCard}>
                  <View style={styles.toggleRow}>
                    <Ticket size={20} color={colors.primary} />
                    <View style={styles.toggleTextCol}>
                      <Text style={styles.toggleTitle}>Boletos Ilimitados</Text>
                      <Text style={styles.toggleSubtitle}>
                        {isUnlimited ? 'Sin límite máximo de tiquetes' : 'Capacidad limitada por cantidad'}
                      </Text>
                    </View>
                    <Controller
                      control={control}
                      name="isUnlimitedTickets"
                      render={({ field: { onChange, value } }) => (
                        <Switch
                          value={value}
                          onValueChange={onChange}
                          trackColor={{ false: colors.border, true: colors.primaryContainer }}
                          thumbColor={value ? colors.primary : colors.textSecondary}
                        />
                      )}
                    />
                  </View>

                  {!isUnlimited && (
                    <View style={{ marginTop: spacing.md }}>
                      <Controller
                        control={control}
                        name="totalTickets"
                        render={({ field: { onChange, value } }) => (
                          <AppInput
                            label="Límite Total de Boletos"
                            placeholder="5000"
                            keyboardType="numeric"
                            value={String(value ?? '')}
                            onChangeText={onChange}
                            error={errors.totalTickets?.message}
                          />
                        )}
                      />
                    </View>
                  )}
                </View>

                {/* Section: Prize & Price */}
                <Text style={styles.sectionHeader}>Premio y Precios</Text>
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
                          label="Monto Premio (C$)"
                          placeholder="50000"
                          keyboardType="numeric"
                          value={String(value ?? '')}
                          onChangeText={onChange}
                          error={errors.prizeAmount?.message}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.col}>
                    <Controller
                      control={control}
                      name="ticketPrice"
                      render={({ field: { onChange, value } }) => (
                        <AppInput
                          label="Precio Boleto (C$)"
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
    maxHeight: '90%',
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scrollForm: {
    paddingBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
  },
  col1: {
    flex: 1,
  },
  col2: {
    flex: 2,
  },
  toggleCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextCol: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  toggleTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  toggleSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  btn: {
    flex: 1,
  },
});
