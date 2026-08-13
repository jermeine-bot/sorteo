import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { AppInput } from '../../components/ui/AppInput';
import { SellerCard } from '../../components/cards/SellerCard';
import { SellerModal } from '../../components/modals/SellerModal';
import { Toast } from '../../components/feedback/Toast';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useSellerStore } from '../../stores/sellerStore';
import { colors, typography, spacing } from '../../theme';
import { UserPlus, Search } from 'lucide-react-native';
import { User } from '../../types/user';

export default function SellersScreen() {
  const { sellers, addSeller, toggleSellerActive } = useSellerStore();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<User | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSeller = async (data: any) => {
    await addSeller(data);
    setToastMsg(`¡Vendedor ${data.name} creado correctamente!`);
  };

  const handleToggle = async (seller: User) => {
    await toggleSellerActive(seller.id);
    setToastMsg(
      `Vendedor ${seller.name} ${!seller.active ? 'activado' : 'desactivado'}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader
        title="Gestión de Vendedores"
        subtitle={`${sellers.length} registrados`}
        rightAction={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setSelectedSeller(null);
              setModalVisible(true);
            }}
          >
            <UserPlus size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Nuevo</Text>
          </TouchableOpacity>
        }
      />

      <Toast
        visible={!!toastMsg}
        message={toastMsg}
        type="success"
        onDismiss={() => setToastMsg('')}
      />

      <SellerModal
        visible={modalVisible}
        seller={selectedSeller}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateSeller}
      />

      <View style={styles.content}>
        <AppInput
          placeholder="Buscar por nombre o usuario..."
          leftIcon={<Search size={18} color={colors.textSecondary} />}
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchBox}
        />

        <FlatList
          data={filteredSellers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SellerCard
              seller={item}
              onPress={() => {
                setSelectedSeller(item);
                setModalVisible(true);
              }}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No se encontraron vendedores"
              description="Intenta buscar con otro nombre o agrega un nuevo vendedor."
              actionTitle="Agregar Vendedor"
              onAction={() => setModalVisible(true)}
            />
          }
        />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchBox: {
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.sm,
  },
  addBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});
