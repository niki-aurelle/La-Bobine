import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import api from '../services/api';
import { Delivery } from '../types';
import { formatDate } from '../utils/formatDate';
import { useAppStore } from '../store/appStore';

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: Colors.warning },
  delivered: { label: 'Livrée',      color: Colors.success },
  late:      { label: 'En retard',   color: Colors.error },
  cancelled: { label: 'Annulée',     color: Colors.statusCancelled },
};

export default function DeliveriesScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/deliveries');
      setDeliveries(res.data.data);
    } catch {}
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const markDelivered = async (id: string) => {
    try {
      await api.put(`/deliveries/${id}`, { status: 'delivered', actualDate: new Date().toISOString() });
      showToast('Livraison confirmée.', 'success');
      load();
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={deliveries}
        keyExtractor={(i) => i._id}
        contentContainerStyle={deliveries.length === 0 ? { flex: 1 } : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status];
          const isLate = item.status === 'pending' && new Date(item.plannedDate) < new Date();
          return (
            <Card style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.garment}>{(item.order as any)?.garmentType}</Text>
                <Text style={[styles.status, { color: isLate ? Colors.error : cfg.color }]}>
                  {isLate ? 'En retard' : cfg.label}
                </Text>
              </View>
              <Text style={styles.client}>{(item.client as any)?.firstName} {(item.client as any)?.lastName}</Text>
              <Text style={[styles.date, isLate && { color: Colors.error }]}>
                Prévue le {formatDate(item.plannedDate)}
              </Text>
              {item.status === 'pending' && (
                <TouchableOpacity style={styles.deliverBtn} onPress={() => markDelivered(item._id)}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
                  <Text style={styles.deliverBtnText}>Marquer livrée</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="cube-outline" title="Aucune livraison" subtitle="Les livraisons s'affichent ici." />
        }
        ItemSeparatorComponent={() => <View style={{ height: Sizes.sm }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Sizes.md, paddingBottom: Sizes.xxl },
  item: { gap: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  garment: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  status: { fontSize: Sizes.fontSm, fontWeight: '700' },
  client: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
  date: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  deliverBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Sizes.sm },
  deliverBtnText: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.success },
});
