import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { User } from '../../types/user';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X } from 'lucide-react-native';

const sellerSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio (min 2 caracteres)'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  phone: z.string().min(8, 'El teléfono debe ser válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  commissionPercentage: z.coerce.number().min(0, 'Comisión inválida').max(50, 'Máximo 50%'),
});

export type SellerFormData = z.infer<typeof sellerSchema>;

interface SellerModalProps {
  visible: boolean;
  seller?: User | null;
  onClose: () => void;
  onSubmit: (data: SellerFormData) => Promise<void>;
}

export const SellerModal: React.FC<SellerModalProps> = ({
  visible,
  seller,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SellerFormData>({
    resolver: zodResolver(sellerSchema) as any,
    defaultValues: {
      name: seller?.name || '',
      lastName: seller?.lastName || '',
      username: seller?.username || '',
      phone: seller?.phone || '+505 ',
      password: '123456',
      commissionPercentage: seller?.commissionPercentage || 10,
    },
  });

  const onFormSubmit = async (data: SellerFormData) => {
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
                  {seller ? 'Editar Vendedor' : 'Nuevo Vendedor'}
                </Text>
                <X size={22} color={colors.textSecondary} onPress={onClose} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Nombre"
                      placeholder="Ej. Carlos"
                      value={value}
                      onChangeText={onChange}
                      error={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Apellido"
                      placeholder="Ej. Martínez"
                      value={value}
                      onChangeText={onChange}
                      error={errors.lastName?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Nombre de Usuario"
                      placeholder="carlosm"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      error={errors.username?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Teléfono"
                      placeholder="+505 8888-8888"
                      keyboardType="phone-pad"
                      value={value}
                      onChangeText={onChange}
                      error={errors.phone?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Contraseña"
                      isPassword
                      value={value}
                      onChangeText={onChange}
                      error={errors.password?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="commissionPercentage"
                  render={({ field: { onChange, value } }) => (
                    <AppInput
                      label="Porcentaje de Comisión (%)"
                      placeholder="10"
                      keyboardType="numeric"
                      value={String(value ?? 10)}
                      onChangeText={onChange}
                      error={errors.commissionPercentage?.message}
                    />
                  )}
                />
              </ScrollView>

              <View style={styles.actions}>
                <AppButton
                  title="Cancelar"
                  onPress={onClose}
                  variant="ghost"
                  style={styles.btn}
                />
                <AppButton
                  title={seller ? 'Guardar' : 'Crear Vendedor'}
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
