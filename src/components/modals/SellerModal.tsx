import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { User } from '../../types/user';
import {
  colors,
  typography,
  borderRadius,
  spacing,
  shadows,
} from '../../theme';
import { X } from 'lucide-react-native';

interface SellerModalProps {
  visible: boolean;
  seller?: User | null;
  onClose: () => void;
  onSubmit: (data: SellerFormData) => Promise<void>;
}

const sellerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre es obligatorio (mínimo 2 caracteres)'),

    lastName: z
      .string()
      .trim()
      .min(2, 'El apellido es obligatorio (mínimo 2 caracteres)'),

    username: z
      .string()
      .trim()
      .min(3, 'El usuario debe tener al menos 3 caracteres'),

    email: z 
      .string() 
      .trim() 
      .email('Ingresa un correo electrónico válido'),

    phone: z
      .string()
      .trim()
      .min(8, 'El teléfono debe ser válido'),

    password: z.string().optional(),

    commissionPercentage: z.coerce
      .number({
        invalid_type_error: 'La comisión debe ser un número',
      })
      .min(0, 'Comisión inválida')
      .max(50, 'Máximo 50%'),
  });

export type SellerFormData = z.infer<typeof sellerSchema>;

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
      name: '',
      lastName: '',
      username: '',
      email: '',
      phone: '+505 ',
      password: '',
      commissionPercentage: 10,
    },
  });

  /**
   * Cargar los datos del vendedor cuando se abre
   * el modal en modo edición.
   */
  useEffect(() => {
    if (visible) {
      reset({
        name: seller?.name ?? '',
        lastName: seller?.lastName ?? '',
        username: seller?.username ?? '',
        email: seller?.email ?? '',
        phone: seller?.phone ?? '+505 ',
        password: '',
        commissionPercentage:
          seller?.commissionPercentage ?? 10,
      });
    }
  }, [visible, seller, reset]);

  const onFormSubmit = async (data: SellerFormData) => {
  try {
    const password = data.password?.trim() || '';

    // Al crear un vendedor, la contraseña es obligatoria
    if (!seller && password.length < 6) {
      console.error(
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    // Al editar, la contraseña es opcional.
    // Si está vacía, no se modificará.
    const cleanedData = {
      ...data,
      email: data.email.trim().toLowerCase(),
      password: password || undefined,
    };

    await onSubmit(cleanedData);

    reset();
      onClose();
    } catch (error) {
      console.error('Error al guardar vendedor:', error);
    }
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

                <X
                  size={22}
                  color={colors.textSecondary}
                  onPress={onClose}
                />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
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

                {/* NUEVO: Correo electrónico */} 
                <Controller control={control} name="email" render={({ field: { onChange, value } }) => ( <AppInput label="Correo Electrónico" placeholder="carlos@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={value} onChangeText={onChange} error={errors.email?.message} /> )} />

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
                      label={
                        seller
                          ? 'Nueva Contraseña (opcional)'
                          : 'Contraseña'
                      }
                      placeholder={
                        seller
                          ? 'Dejar vacío para conservarla'
                          : 'Mínimo 6 caracteres'
                      }
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

