import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../stores/authStore';
import { Home, PlusCircle, History, User } from 'lucide-react-native';

export default function SellerLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/(auth)/login');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-sale"
        options={{
          title: 'Nueva venta',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size + 4} color={colors.primary} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Mis ventas',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />

      {/* Sub-routes hidden from tab bar */}
      <Tabs.Screen name="receipt" options={{ href: null }} />
      <Tabs.Screen name="daily-sales" options={{ href: null }} />
    </Tabs>
  );
}
