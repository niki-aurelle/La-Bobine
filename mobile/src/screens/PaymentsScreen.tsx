import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import api from '../services/api';
import { Payment } from '../types';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { useAuthStore } from '../store/authStore';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces', mobile_money: 'Mobile Money', bank_transfer: 'Virement', card: 'Carte', other: 'Autre',
};

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const currency = useAuthStore((s) => s.user?.currency || 'XAF');

  const load = useCallback(async () => {
    try {
      // Pas encore de route /payments directe — on récupère via les commandes
      // Pour MVP, cette route sera ajoutée. Pour l'instant, affichage placeholder.
      setPayments([]);
    } catch {}
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={payments}
        keyExtractor={(i) => i._id}
        contentContainerStyle={payments.length === 0 ? { flex: 1 } : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View style={styles.row}>
              <Text style={styles.amount}>{formatCurrency(item.amount, currency)}</Text>
              <Text style={styles.date}>{formatDate(item.paidAt)}</Text>
            </View>
            <Text style={styles.method}>{METHOD_LABELS[item.method] || item.method}</Text>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState icon="cash-outline" title="Aucun paiement" subtitle="Les paiements apparaissent ici après enregistrement dans une commande." />
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
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  amount: { fontSize: Sizes.fontMd, fontWeight: '800', color: Colors.success },
  date: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  method: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
});
