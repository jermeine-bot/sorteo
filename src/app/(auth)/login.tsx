import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, borderRadius, spacing, shadows } from '../../theme';
import { Clover, Lock, User, ShieldCheck, Tag } from 'lucide-react-native';

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      const user = await login(data.username, data.password);
      if (user.role === 'ADMIN') {
        router.replace('/(admin)/dashboard');
      } else if(user.role === 'SELLER'){
        router.replace('/(seller)/dashboard');
      }
    } catch (e) {
      // Error handles in authStore
    }
  };

  const fillQuickMock = (userType: 'admin' | 'seller') => {
    if (userType === 'admin') {
      setValue('username', 'admin@sorteo.com');
      setValue('password', '123456');
    } else {
      setValue('username', 'vendedor@sorteo.com');
      setValue('password', '123456');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Clover size={36} color={colors.primary} />
            </View>
            <Text style={styles.appName}></Text>
            <Text style={styles.appSub}>Sistema de Ventas y Lotería</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>Ingresa tus credenciales para acceder</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Correo electronico"
                  placeholder="admin@sorteo.com"
                  autoCapitalize="none"
                  leftIcon={<User size={18} color={colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  error={errors.username?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Contraseña"
                  placeholder="••••••••"
                  isPassword
                  leftIcon={<Lock size={18} color={colors.textSecondary} />}
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <AppButton
              title="Iniciar sesión"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            {/* Quick Demo Access Pills */}
            {/* <View style={styles.mockSection}>
              <Text style={styles.mockLabel}>Acceso rápido para pruebas:</Text>
              <View style={styles.pillsRow}>
                <TouchableOpacity
                  style={[styles.pill, styles.pillAdmin]}
                  onPress={() => fillQuickMock('admin')}
                >
                  <ShieldCheck size={14} color={colors.primary} />
                  <Text style={styles.pillAdminText}>Admin Demo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pill, styles.pillSeller]}
                  onPress={() => fillQuickMock('seller')}
                >
                  <Tag size={14} color={colors.secondary} />
                  <Text style={styles.pillSellerText}>Vendedor Demo</Text>
                </TouchableOpacity>
              </View>
            </View> */}
          </View>

         
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.subtle,
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  appSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorBoxText: {
    ...typography.body,
    color: colors.error,
    fontSize: 13,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  loginBtn: {
    width: '100%',
  },
  mockSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  mockLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  pillAdmin: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  pillAdminText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryHover,
    marginLeft: 4,
  },
  pillSeller: {
    backgroundColor: colors.secondaryLight,
    borderColor: colors.secondary,
  },
  pillSellerText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.secondary,
    marginLeft: 4,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
