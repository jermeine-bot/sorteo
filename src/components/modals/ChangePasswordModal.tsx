import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { X, Lock } from 'lucide-react-native';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordFormData) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onFormSubmit = async (data: PasswordFormData) => {
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
                  <Lock size={20} color={colors.primary} />
                  <Text style={styles.title}>Cambiar Contraseña</Text>
                </View>
                <X size={22} color={colors.textSecondary} onPress={onClose} />
              </View>

              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Contraseña Actual"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.currentPassword?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Nueva Contraseña"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.newPassword?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <AppInput
                    label="Confirmar Nueva Contraseña"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
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
                  title="Cambiar Contraseña"
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
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    marginLeft: 8,
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
