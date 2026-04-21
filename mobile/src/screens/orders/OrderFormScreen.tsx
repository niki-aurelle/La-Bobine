import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { orderService } from '../../services/orderService';
import { clientService } from '../../services/clientService';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Client } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<OrdersStackParamList, 'OrderForm'>;
  route: RouteProp<OrdersStackParamList, 'OrderForm'>;
};

const INITIAL_FORM = {
  garmentType: '',
  description: '',
  fabric: '',
  totalPrice: '',
  depositAmount: '',
  estimatedDeliveryDate: '',
  internalNotes: '',
};

export default function OrderFormScreen({ navigation, route }: Props) {
  const { orderId, clientId: initialClientId } = route.params || {};
  const isEdit = !!orderId;
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);
  const currency = useAuthStore((s) => s.user?.currency || 'XAF');

  useEffect(() => {
    if (initialClientId) {
      clientService.getOne(initialClientId).then(setSelectedClient).catch(() => {});
    }
    if (isEdit) {
      orderService.getOne(orderId).then((order) => {
        if (typeof order.client === 'object') setSelectedClient(order.client as any);
        setForm({
          garmentType: order.garmentType,
          description: order.description || '',
          fabric: order.fabric || '',
          totalPrice: String(order.totalPrice),
          depositAmount: String(order.depositAmount || ''),
          estimatedDeliveryDate: order.estimatedDeliveryDate
            ? order.estimatedDeliveryDate.split('T')[0]
            : '',
          internalNotes: order.internalNotes || '',
        });
      });
    }
  }, [orderId, initialClientId]);

  const set = (key: keyof typeof INITIAL_FORM) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.garmentType.trim()) return showToast('Type de vêtement requis.', 'error');
    if (!selectedClient) return showToast('Sélectionnez une cliente.', 'error');
    if (!form.totalPrice || isNaN(+form.totalPrice)) return showToast('Prix total requis.', 'error');

    setLoading(true);
    const payload = {
      client: selectedClient._id,
      garmentType: form.garmentType.trim(),
      description: form.description,
      fabric: form.fabric,
      totalPrice: parseFloat(form.totalPrice),
      depositAmount: parseFloat(form.depositAmount || '0'),
      estimatedDeliveryDate: form.estimatedDeliveryDate || undefined,
      internalNotes: form.internalNotes,
    };

    try {
      if (isEdit) {
        await orderService.update(orderId, payload);
        showToast('Commande mise à jour.', 'success');
      } else {
        await orderService.create(payload);
        showToast('Commande créée.', 'success');
      }
      navigation.goBack();
    } catch (err: any) {
      showToast(err.message || 'Erreur.', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Cliente */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            {selectedClient ? (
              <View style={styles.clientSelected}>
                <Text style={styles.clientName}>{selectedClient.firstName} {selectedClient.lastName}</Text>
                <TouchableOpacity onPress={() => setSelectedClient(null)}>
                  <Text style={styles.changeClient}>Changer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.hint}>Aucune cliente sélectionnée (sélection via la liste clientes)</Text>
            )}
          </View>

          {/* Vêtement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vêtement</Text>
            <Input label="Type de vêtement *" value={form.garmentType} onChangeText={set('garmentType')} placeholder="Robe de soirée, tailleur..." leftIcon="shirt-outline" />
            <Input label="Description" value={form.description} onChangeText={set('description')} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} placeholder="Détails du modèle..." />
            <Input label="Tissu" value={form.fabric} onChangeText={set('fabric')} placeholder="Wax, soie, coton..." leftIcon="color-palette-outline" />
          </View>

          {/* Prix */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prix ({currency})</Text>
            <Input label="Prix total *" value={form.totalPrice} onChangeText={set('totalPrice')} keyboardType="numeric" leftIcon="cash-outline" placeholder="0" />
            <Input label="Acompte reçu" value={form.depositAmount} onChangeText={set('depositAmount')} keyboardType="numeric" leftIcon="wallet-outline" placeholder="0" />
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Livraison</Text>
            <Input label="Date de livraison prévue (YYYY-MM-DD)" value={form.estimatedDeliveryDate} onChangeText={set('estimatedDeliveryDate')} placeholder="2024-12-31" leftIcon="calendar-outline" />
          </View>

          <Input label="Notes internes" value={form.internalNotes} onChangeText={set('internalNotes')} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} placeholder="Notes privées sur la commande..." />

          <Button label={isEdit ? 'Enregistrer' : 'Créer la commande'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  section: { gap: Sizes.sm },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  clientSelected: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surfaceSecondary, padding: Sizes.md, borderRadius: Sizes.radiusMd },
  clientName: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  changeClient: { fontSize: Sizes.fontSm, color: Colors.primary, fontWeight: '600' },
  hint: { fontSize: Sizes.fontSm, color: Colors.textMuted, fontStyle: 'italic' },
});
