import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import Card from '../../components/Card';
import { OrderStatusBadge } from '../../components/Badge';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, Payment } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

type Props = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrderDetail'>;
  route: RouteProp<OrdersStackParamList, 'OrderDetail'>;
};

const STATUS_FLOW: OrderStatus[] = ['confirmed', 'in_progress', 'fitting', 'ready', 'delivered'];

export default function OrderDetailScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const currency = useAuthStore((s) => s.user?.currency);
  const showToast = useAppStore((s) => s.showToast);

  const load = async () => {
    try {
      const data = await orderService.getOne(orderId);
      setOrder(data);
    } catch {}
  };

  useEffect(() => { load(); }, [orderId]);

  const advanceStatus = async () => {
    if (!order) return;
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    try {
      await orderService.updateStatus(orderId, next);
      showToast('Statut mis à jour.', 'success');
      load();
    } catch {}
  };

  if (!order) return null;

  const client = typeof order.client === 'object' ? order.client : null;
  const balance = order.balance;
  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const canAdvance = currentStatusIdx >= 0 && currentStatusIdx < STATUS_FLOW.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* En-tête commande */}
        <Card>
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.garment}>{order.garmentType}</Text>
              <Text style={styles.ref}>{order.reference}</Text>
            </View>
            <OrderStatusBadge status={order.status} />
          </View>
          {client && (
            <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
          )}
          {order.description && <Text style={styles.description}>{order.description}</Text>}
        </Card>

        {/* Avancement statut */}
        {canAdvance && (
          <Button
            label={`Passer à : ${STATUS_FLOW[currentStatusIdx + 1]}`}
            onPress={advanceStatus}
            icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          />
        )}

        {/* Paiements */}
        <Card>
          <Text style={styles.sectionTitle}>Paiements</Text>
          <View style={styles.balanceRow}>
            <BalanceItem label="Total" value={formatCurrency(order.totalPrice, currency)} color={Colors.textPrimary} />
            <BalanceItem label="Payé" value={formatCurrency(balance?.totalPaid || 0, currency)} color={Colors.success} />
            <BalanceItem label="Reste" value={formatCurrency(balance?.remaining || 0, currency)} color={balance?.remaining ? Colors.error : Colors.success} />
          </View>

          {order.payments && order.payments.length > 0 && (
            <View style={{ marginTop: Sizes.sm }}>
              {order.payments.map((p) => (
                <View key={p._id} style={styles.paymentRow}>
                  <Text style={styles.paymentAmount}>{formatCurrency(p.amount, currency)}</Text>
                  <Text style={styles.paymentDate}>{formatDate(p.paidAt)}</Text>
                  <Text style={styles.paymentMethod}>{p.method}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Dates */}
        <Card>
          <Text style={styles.sectionTitle}>Dates</Text>
          <DateRow label="Commande" date={order.orderDate} />
          {order.estimatedDeliveryDate && <DateRow label="Livraison prévue" date={order.estimatedDeliveryDate} highlight />}
          {order.actualDeliveryDate && <DateRow label="Livraison effective" date={order.actualDeliveryDate} />}
        </Card>

        {/* Notes internes */}
        {order.internalNotes && (
          <Card>
            <Text style={styles.sectionTitle}>Notes internes</Text>
            <Text style={styles.notes}>{order.internalNotes}</Text>
          </Card>
        )}

        {/* Essayages */}
        {order.fittings && order.fittings.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Essayages ({order.fittings.length})</Text>
            {order.fittings.map((f) => (
              <View key={f._id} style={styles.fittingRow}>
                <Text style={styles.fittingNum}>Essayage #{f.fittingNumber}</Text>
                <Text style={styles.fittingDate}>{formatDate(f.scheduledAt)}</Text>
                <Text style={[styles.fittingStatus, f.status === 'completed' && styles.done]}>{f.status}</Text>
              </View>
            ))}
          </Card>
        )}

        <Button
          label="Modifier la commande"
          onPress={() => navigation.navigate('OrderForm', { orderId: order._id })}
          variant="outline"
          icon={<Ionicons name="create-outline" size={18} color={Colors.primary} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const BalanceItem = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={styles.balanceItem}>
    <Text style={styles.balanceLabel}>{label}</Text>
    <Text style={[styles.balanceValue, { color }]}>{value}</Text>
  </View>
);

const DateRow = ({ label, date, highlight = false }: { label: string; date: string; highlight?: boolean }) => (
  <View style={styles.dateRow}>
    <Text style={styles.dateLabel}>{label}</Text>
    <Text style={[styles.dateValue, highlight && { color: Colors.primary, fontWeight: '700' }]}>
      {formatDate(date)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Sizes.sm },
  garment: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.textPrimary },
  ref: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  clientName: { fontSize: Sizes.fontMd, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: Sizes.fontSm, color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, marginBottom: Sizes.sm },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceItem: { alignItems: 'center', gap: 2 },
  balanceLabel: { fontSize: Sizes.fontXs, color: Colors.textMuted },
  balanceValue: { fontSize: Sizes.fontLg, fontWeight: '800' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.divider },
  paymentAmount: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textPrimary },
  paymentDate: { fontSize: Sizes.fontXs, color: Colors.textMuted },
  paymentMethod: { fontSize: Sizes.fontXs, color: Colors.textSecondary },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dateLabel: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
  dateValue: { fontSize: Sizes.fontSm, color: Colors.textPrimary },
  notes: { fontSize: Sizes.fontSm, color: Colors.textSecondary, lineHeight: 20 },
  fittingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  fittingNum: { fontSize: Sizes.fontSm, fontWeight: '600', color: Colors.textPrimary },
  fittingDate: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  fittingStatus: { fontSize: Sizes.fontXs, color: Colors.warning },
  done: { color: Colors.success },
});
