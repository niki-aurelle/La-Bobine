import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import api from '../services/api';
import { InventoryItem } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  fabric: 'Tissu', thread: 'Fil', button: 'Bouton',
  zipper: 'Fermeture', accessory: 'Accessoire', other: 'Autre',
};

export default function StockScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showLowOnly, setShowLowOnly] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/inventory', { params: showLowOnly ? { lowStock: 'true' } : {} });
      setItems(res.data.data);
    } catch {}
    setRefreshing(false);
  }, [showLowOnly]);

  useFocusEffect(useCallback(() => { load(); }, [showLowOnly]));

  const lowCount = items.filter((i) => i.isLow).length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Stock</Text>
        {lowCount > 0 && (
          <TouchableOpacity style={styles.alertBtn} onPress={() => setShowLowOnly((v) => !v)}>
            <Ionicons name="warning-outline" size={16} color={Colors.white} />
            <Text style={styles.alertText}>{lowCount} bas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        contentContainerStyle={items.length === 0 ? { flex: 1 } : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        renderItem={({ item }) => (
          <Card style={[styles.item, item.isLow && styles.itemLow]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Badge label={CATEGORY_LABELS[item.category] || item.category} />
            </View>
            <View style={styles.itemFooter}>
              <Text style={[styles.qty, item.isLow && { color: Colors.error }]}>
                {item.quantity} {item.unit}
                {item.isLow && ' ⚠️'}
              </Text>
              {item.color && <Text style={styles.color}>• {item.color}</Text>}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState icon="layers-outline" title="Stock vide" subtitle="Commencez par ajouter des matières." />
        }
        ItemSeparatorComponent={() => <View style={{ height: Sizes.sm }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sizes.md },
  title: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.textPrimary },
  alertBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.error, paddingHorizontal: Sizes.sm, paddingVertical: 4, borderRadius: Sizes.radiusFull },
  alertText: { color: Colors.white, fontSize: Sizes.fontXs, fontWeight: '700' },
  list: { padding: Sizes.md, paddingBottom: Sizes.xxl },
  item: { gap: 4 },
  itemLow: { borderColor: Colors.error },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  itemFooter: { flexDirection: 'row', gap: Sizes.sm, alignItems: 'center' },
  qty: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textSecondary },
  color: { fontSize: Sizes.fontSm, color: Colors.textMuted },
});
