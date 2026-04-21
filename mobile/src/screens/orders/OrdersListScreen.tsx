import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import { OrderStatusBadge } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuthStore } from '../../store/authStore';

type Props = { navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'> };

const FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'En cours', value: 'in_progress' },
  { label: 'Essayage', value: 'fitting' },
  { label: 'Prêtes', value: 'ready' },
  { label: 'Livrées', value: 'delivered' },
];

export default function OrdersListScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const user = useAuthStore((s) => s.user);

  const load = useCallback(async () => {
    try {
      const res = await orderService.list(filter !== 'all' ? { status: filter } : {});
      setOrders(res.data);
    } catch {}
    setRefreshing(false);
  }, [filter]);

  useFocusEffect(useCallback(() => { load(); }, [filter]));

  const renderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.itemTop}>
        <Text style={styles.garment}>{item.garmentType}</Text>
        <OrderStatusBadge status={item.status} />
      </View>
      <Text style={styles.clientName}>
        {typeof item.client === 'object' ? `${item.client.firstName} ${item.client.lastName}` : ''}
      </Text>
      <View style={styles.itemBottom}>
        <Text style={styles.ref}>{item.reference}</Text>
        <Text style={styles.price}>{formatCurrency(item.totalPrice, user?.currency)}</Text>
        {item.estimatedDeliveryDate && (
          <Text style={styles.date}>Livraison : {formatDate(item.estimatedDeliveryDate)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Filtres */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filter, filter === f.value && styles.filterActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={orders.length === 0 ? { flex: 1 } : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title="Aucune commande"
            subtitle="Créez votre première commande."
            actionLabel="Nouvelle commande"
            onAction={() => navigation.navigate('OrderForm', {})}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('OrderForm', {})}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  filtersRow: { flexDirection: 'row', paddingHorizontal: Sizes.md, paddingVertical: Sizes.sm, gap: Sizes.sm },
  filter: { paddingHorizontal: Sizes.md, paddingVertical: 6, borderRadius: Sizes.radiusFull, backgroundColor: Colors.surfaceSecondary },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: Sizes.fontXs, fontWeight: '700', color: Colors.textMuted },
  filterTextActive: { color: Colors.white },
  list: { padding: Sizes.md, paddingBottom: 80 },
  item: { backgroundColor: Colors.surface, borderRadius: Sizes.radiusLg, padding: Sizes.md, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  garment: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  clientName: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
  itemBottom: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Sizes.sm, marginTop: 4 },
  ref: { fontSize: Sizes.fontXs, color: Colors.textMuted },
  price: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.success },
  date: { fontSize: Sizes.fontXs, color: Colors.primary },
  separator: { height: Sizes.sm },
  fab: { position: 'absolute', bottom: Sizes.xl, right: Sizes.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 8 },
});
