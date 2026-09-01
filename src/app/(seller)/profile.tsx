import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppCard } from '../../components/ui/AppCard';
import { AppButton } from '../../components/ui/AppButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MoneyText } from '../../components/ui/MoneyText';
import { ChangePasswordModal } from '../../components/modals/ChangePasswordModal';
import { PrinterModal } from '../../components/modals/PrinterModal';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { Toast } from '../../components/feedback/Toast';
import { useAuthStore } from '../../stores/authStore';
import { usePrinterStore } from '../../stores/printerStore';
import { colors, typography, spacing } from '../../theme';
import { User as UserIcon, Mail, Phone, Lock, LogOut, Printer } from 'lucide-react-native';

export default function SellerProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { connectedDevice } = usePrinterStore();

  const [passwordModal, setPasswordModal] = useState(false);
  const [printerModal, setPrinterModal] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleChangePassword = async (data: any) => {
    setToastMsg('¡Contraseña cambiada exitosamente!');
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Mi Perfil" subtitle="Vendedor de SorteoApp" />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <PrinterModal
        visible={printerModal}
        onClose={() => setPrinterModal(false)}
      />

      <ChangePasswordModal
        visible={passwordModal}
        onClose={() => setPasswordModal(false)}
        onSubmit={handleChangePassword}
      />

      <ConfirmDialog
        visible={logoutDialog}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas salir?"
        confirmText="Cerrar Sesión"
        isDanger
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialog(false)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Card */}
        <AppCard style={styles.bannerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'V'}</Text>
          </View>
          <Text style={styles.name}>{user?.name} {user?.lastName}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          <View style={styles.badgeBox}>
            <StatusBadge status="ACTIVE_USER" customLabel="Vendedor Oficial" />
          </View>
        </AppCard>

        {/* Stats Card */}
        <AppCard style={styles.infoCard}>
          <Text style={styles.cardTitle}>Comisiones y Rendimiento</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>COMISIÓN</Text>
              <Text style={styles.metricVal}>{user?.commissionPercentage || 10}%</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>TOTAL HISTÓRICO</Text>
              <MoneyText amount={user?.totalSales || 48500} size="md" color={colors.primary} />
            </View>
          </View>
        </AppCard>

        {/* User Details */}
        <AppCard style={styles.infoCard}>
          <Text style={styles.cardTitle}>Información Personal</Text>

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
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
          </View>
        </AppCard>

        {/* Hardware & Security Actions */}
        <AppCard style={styles.infoCard}>
          <Text style={styles.cardTitle}>Dispositivos y Seguridad</Text>
          <AppButton
            title={connectedDevice ? `Impresora: ${connectedDevice.name}` : "Configurar Impresora Bluetooth"}
            onPress={() => setPrinterModal(true)}
            variant="secondary"
            icon={<Printer size={16} color={colors.primary} />}
            style={styles.btn}
          />
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
  avatar: {
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
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: spacing.md,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 2,
  },
  metricVal: {
    ...typography.h2,
    color: colors.primary,
  },
  dividerVertical: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
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
  btn: {
    marginBottom: spacing.sm,
  },
});
