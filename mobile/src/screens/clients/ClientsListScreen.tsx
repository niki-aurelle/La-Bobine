import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientsStackParamList } from '../../navigation/stacks/ClientsStack';
import Input from '../../components/Input';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { clientService } from '../../services/clientService';
import { Client } from '../../types';
import { useFocusEffect } from '@react-navigation/native';

type Props = { navigation: NativeStackNavigationProp<ClientsStackParamList, 'ClientsList'> };

export default function ClientsListScreen({ navigation }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    try {
      const res = await clientService.list({ search: q });
      setClients(res.data);
    } catch {}
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(search); }, [search]));

  const onSearch = (q: string) => { setSearch(q); load(q); };

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ClientDetail', { clientId: item._id })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.firstName} {item.lastName}</Text>
        {item.phone && <Text style={styles.itemPhone}>{item.phone}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.searchBar}>
        <Input
          placeholder="Rechercher une cliente..."
          value={search}
          onChangeText={onSearch}
          leftIcon="search-outline"
          containerStyle={{ flex: 1 }}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('ClientForm', {})}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={clients}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={clients.length === 0 ? styles.emptyContainer : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(search); }}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Aucune cliente"
            subtitle="Commencez par ajouter votre première cliente."
            actionLabel="Ajouter une cliente"
            onAction={() => navigation.navigate('ClientForm', {})}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  searchBar: { flexDirection: 'row', gap: Sizes.sm, padding: Sizes.md, paddingBottom: Sizes.sm },
  addBtn: { width: 52, height: 52, backgroundColor: Colors.primary, borderRadius: Sizes.radiusMd, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Sizes.md, paddingBottom: Sizes.xxl },
  emptyContainer: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: Sizes.md, gap: Sizes.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.primary },
  itemContent: { flex: 1, gap: 2 },
  itemName: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  itemPhone: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  separator: { height: 1, backgroundColor: Colors.divider },
});
