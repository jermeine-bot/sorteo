import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { LoadingState } from '../components/feedback/LoadingState';
import { colors } from '../theme';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.replace('/(auth)/login');
      } else if (user.role === 'ADMIN') {
        router.replace('/(admin)/dashboard');
      } else if (user.role === 'SELLER') {
        router.replace('/(seller)/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <View style={styles.container}>
      <LoadingState message="Iniciando SorteoApp..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
