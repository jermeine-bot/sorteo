import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppInput } from '../../components/ui/AppInput';
import { AppButton } from '../../components/ui/AppButton';
import { colors, typography, spacing } from '../../theme';
import { Mail, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Recuperar Contraseña" showBack />
      <View style={styles.content}>
        {sent ? (
          <View style={styles.successBox}>
            <CheckCircle2 size={48} color={colors.success} />
            <Text style={styles.successTitle}>¡Correo enviado!</Text>
            <Text style={styles.successDesc}>
              Hemos enviado las instrucciones para restablecer tu contraseña a {email}.
            </Text>
            <AppButton
              title="Volver a Iniciar Sesión"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backBtn}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electrónico y te enviaremos un enlace de recuperación.
            </Text>

            <AppInput
              label="Correo Electrónico"
              placeholder="vendedor@sorteo.com"
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
              value={email}
              onChangeText={setEmail}
            />

            <AppButton
              title="Enviar Enlace de Recuperación"
              onPress={handleReset}
              loading={loading}
              style={styles.resetBtn}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  resetBtn: {
    marginTop: spacing.md,
  },
  successBox: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    marginTop: spacing.xl,
  },
  successTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  successDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  backBtn: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
