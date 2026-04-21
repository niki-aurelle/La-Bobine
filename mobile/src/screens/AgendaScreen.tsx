import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import api from '../services/api';
import { Appointment } from '../types';
import { formatDateTime } from '../utils/formatDate';

const TYPE_ICONS: Record<string, string> = {
  fitting: 'body-outline',
  delivery: 'cube-outline',
  consultation: 'chatbubble-outline',
  pickup: 'bag-handle-outline',
  other: 'calendar-outline',
};

const TYPE_LABELS: Record<string, string> = {
  fitting: 'Essayage',
  delivery: 'Livraison',
  consultation: 'Consultation',
  pickup: 'Retrait',
  other: 'Autre',
};

export default function AgendaScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const from = new Date().toISOString();
      const res = await api.get('/appointments', { params: { from, status: 'scheduled' } });
      setAppointments(res.data.data);
    } catch {}
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const renderItem = ({ item }: { item: Appointment }) => (
    <Card style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={(TYPE_ICONS[item.type] || 'calendar-outline') as any} size={22} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemType}>{TYPE_LABELS[item.type] || item.type}</Text>
        </View>
      </View>
      <View style={styles.itemFooter}>
        <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.itemDate}>{formatDateTime(item.startAt)}</Text>
        {item.client && (
          <>
            <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.itemDate}>{(item.client as any).firstName} {(item.client as any).lastName}</Text>
          </>
        )}
      </View>
      {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={appointments}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={appointments.length === 0 ? { flex: 1 } : styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); load(); }}
        ListHeaderComponent={<Text style={styles.heading}>Prochains rendez-vous</Text>}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title="Agenda vide"
            subtitle="Aucun rendez-vous à venir."
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Sizes.sm }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Sizes.md, paddingBottom: Sizes.xxl },
  heading: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.textPrimary, marginBottom: Sizes.md },
  item: { gap: Sizes.sm },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: Sizes.sm },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  itemType: { fontSize: Sizes.fontXs, color: Colors.primary, fontWeight: '600' },
  itemFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  itemDate: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  itemNotes: { fontSize: Sizes.fontSm, color: Colors.textSecondary, fontStyle: 'italic' },
});
