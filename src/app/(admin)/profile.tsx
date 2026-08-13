import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ChangePasswordModal } from '../../components/modals/ChangePasswordModal';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { Toast } from '../../components/feedback/Toast';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing } from '../../theme';
import { User as UserIcon, Mail, Phone, ShieldCheck, Lock, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [passwordModal, setPasswordModal] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleChangePassword = async (data: any) => {
    setToastMsg('¡Contraseña actualizada exitosamente!');
  };

  const handleConfirmLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Mi Perfil" subtitle="Información de la cuenta" showBack />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <ChangePasswordModal
        visible={passwordModal}
        onClose={() => setPasswordModal(false)}
        onSubmit={handleChangePassword}
      />

      <ConfirmDialog
        visible={logoutDialog}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas salir de SorteoApp?"
        confirmText="Cerrar Sesión"
        isDanger
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutDialog(false)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Banner */}
        <AppCard style={styles.bannerCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>
            {user?.name} {user?.lastName}
          </Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <View style={styles.badgeBox}>
            <StatusBadge status={user?.role === 'ADMIN' ? 'ACTIVE' : 'ACTIVE_USER'} customLabel={user?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'} />
          </View>
        </AppCard>

        {/* Details list */}
        <AppCard style={styles.infoCard}>
          <Text style={styles.cardTitle}>Datos Personales</Text>

          <View style={styles.infoRow}>
            <Mail size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Correo Electrónico</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Teléfono de Contacto</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ShieldCheck size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Rol en el Sistema</Text>
              <Text style={styles.infoValue}>{user?.role}</Text>
            </View>
          </View>
        </AppCard>

        {/* Security & Session Actions */}
        <AppCard style={styles.actionCard}>
          <Text style={styles.cardTitle}>Seguridad</Text>
          <AppButton
            title="Cambiar Contraseña"
            onPress={() => setPasswordModal(true)}
            variant="outline"
            icon={<Lock size={16} color={colors.primary} />}
            style={styles.btn}
          />
          <AppButton
            title="Cerrar Sesión"
            onPress={() => setLogoutDialog(true)}
            variant="danger"
            icon={<LogOut size={16} color="#FFFFFF" />}
            style={styles.btn}
          />
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  bannerCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.h1,
    color: colors.primary,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  username: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badgeBox: {
    marginTop: spacing.xs,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoCol: {
    marginLeft: spacing.md,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  actionCard: {
    marginBottom: spacing.lg,
  },
  btn: {
    marginBottom: spacing.sm,
  },
});
