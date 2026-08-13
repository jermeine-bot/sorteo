import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppCard } from '../../components/ui/AppCard';
import { useAuthStore } from '../../stores/authStore';
import { colors, typography, spacing } from '../../theme';
import { Trophy, BarChart3, User, LogOut, ChevronRight } from 'lucide-react-native';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const menuItems = [
    {
      title: 'Módulo de Premios y Ganadores',
      subtitle: 'Registrar números ganadores y realizar pagos',
      icon: <Trophy size={20} color={colors.accentGold} />,
      onPress: () => router.push('/(admin)/prizes'),
    },
    {
      title: 'Reportes y Exportaciones',
      subtitle: 'Descargar informe en PDF/Excel y análisis financiero',
      icon: <BarChart3 size={20} color={colors.primary} />,
      onPress: () => router.push('/(admin)/reports'),
    },
    {
      title: 'Perfil de Usuario',
      subtitle: 'Ver información de la cuenta y cambiar contraseña',
      icon: <User size={20} color={colors.secondary} />,
      onPress: () => router.push('/(admin)/profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Más Opciones" subtitle="Ajustes y herramientas adicionales" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Admin info badge */}
        <AppCard style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'A'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name} {user?.lastName}</Text>
            <Text style={styles.roleText}>Administrador de Sistema</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </AppCard>

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Módulos y herramientas</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View style={styles.menuIconBox}>{item.icon}</View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h2,
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 1,
  },
  emailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginTop: spacing.lg,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});
