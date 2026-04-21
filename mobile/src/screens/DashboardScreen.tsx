import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { OrderStatusBadge } from '../components/Badge';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/formatCurrency';
import { formatShortDate, formatDateTime } from '../utils/formatDate';
import api from '../services/api';
import { DashboardData, Order, Appointment } from '../types';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const currency = user?.currency || 'XAF';

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={onRefresh}>
      {/* En-tête */}
      <View style={styles.hello}>
        <Text style={styles.helloText}>Bonjour, {user?.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.atelierName}>{user?.atelierName || 'Mon Atelier'}</Text>
      </View>

      {/* Statistiques */}
      {data && (
        <View style={styles.statsGrid}>
          <StatCard
            icon="people-outline"
            value={data.stats.totalClients}
            label="Clientes"
            color={Colors.primary}
          />
          <StatCard
            icon="clipboard-outline"
            value={data.stats.ordersInProgress}
            label="En cours"
            color={Colors.statusInProgress}
          />
          <StatCard
            icon="warning-outline"
            value={data.stats.ordersLate}
            label="En retard"
            color={data.stats.ordersLate > 0 ? Colors.error : Colors.success}
          />
          <StatCard
            icon="cash-outline"
            value={formatCurrency(data.stats.monthRevenue, currency)}
            label="Ce mois"
            color={Colors.success}
            isText
          />
        </View>
      )}

      {/* Prochains RDV */}
      {data && data.upcomingAppointments.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Prochains rendez-vous</Text>
          {data.upcomingAppointments.map((appt) => (
            <AppointmentRow key={appt._id} appointment={appt} />
          ))}
        </Card>
      )}

      {/* Commandes récentes */}
      {data && data.recentOrders.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>Commandes récentes</Text>
          {data.recentOrders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </Card>
      )}
    </ScreenContainer>
  );
}

function StatCard({ icon, value, label, color, isText = false }: any) {
  return (
    <Card style={styles.statCard} padding={Sizes.md}>
      <Ionicons name={icon} size={28} color={color} />
      <Text style={[styles.statValue, isText && styles.statValueText, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return (
    <View style={styles.row}>
      <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{appointment.title}</Text>
        {appointment.client && (
          <Text style={styles.rowSub}>{(appointment.client as any).firstName} {(appointment.client as any).lastName}</Text>
        )}
        <Text style={styles.rowDate}>{formatDateTime(appointment.startAt)}</Text>
      </View>
    </View>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <Text style={styles.rowTitle}>{order.garmentType}</Text>
          <OrderStatusBadge status={order.status} />
        </View>
        <Text style={styles.rowSub}>{(order.client as any)?.firstName} {(order.client as any)?.lastName}</Text>
        <Text style={styles.rowRef}>{order.reference}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hello: { gap: 2 },
  helloText: { fontSize: Sizes.fontXl, fontWeight: '800', color: Colors.textPrimary },
  atelierName: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Sizes.sm },
  statCard: { flex: 1, minWidth: '45%', gap: 4 },
  statValue: { fontSize: Sizes.fontXl, fontWeight: '800' },
  statValueText: { fontSize: Sizes.fontMd },
  statLabel: { fontSize: Sizes.fontXs, color: Colors.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, marginBottom: Sizes.sm },
  row: { flexDirection: 'row', gap: Sizes.sm, paddingVertical: Sizes.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  rowContent: { flex: 1, gap: 2 },
  rowTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textPrimary },
  rowSub: { fontSize: Sizes.fontXs, color: Colors.textSecondary },
  rowDate: { fontSize: Sizes.fontXs, color: Colors.primary },
  rowRef: { fontSize: Sizes.fontXs, color: Colors.textMuted },
});
