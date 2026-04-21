import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ClientsStackParamList } from '../../navigation/stacks/ClientsStack';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { clientService } from '../../services/clientService';
import { Client, Measurement } from '../../types';
import { formatDate } from '../../utils/formatDate';

type Props = {
  navigation: NativeStackNavigationProp<ClientsStackParamList, 'ClientDetail'>;
  route: RouteProp<ClientsStackParamList, 'ClientDetail'>;
};

export default function ClientDetailScreen({ navigation, route }: Props) {
  const { clientId } = route.params;
  const [client, setClient] = useState<(Client & { orderCount: number; lastMeasurement: Measurement | null }) | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await clientService.getOne(clientId);
      setClient(data);
    } catch {}
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [clientId]);

  const handleCall = () => {
    if (client?.phone) Linking.openURL(`tel:${client.phone}`);
  };

  const handleWhatsApp = () => {
    if (client?.phone) {
      const number = client.phone.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${number}`);
    }
  };

  if (!client) return null;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
      {/* Avatar + Infos */}
      <Card>
        <View style={styles.clientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{client.firstName[0]}{client.lastName[0]}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{client.firstName} {client.lastName}</Text>
            {client.phone && <Text style={styles.clientPhone}>{client.phone}</Text>}
            {client.city && <Text style={styles.clientCity}>{client.city}</Text>}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ClientForm', { clientId: client._id })}>
            <Ionicons name="create-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Actions rapides */}
        <View style={styles.actions}>
          {client.phone && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.white} />
              <Text style={styles.actionLabel}>Appeler</Text>
            </TouchableOpacity>
          )}
          {client.phone && (
            <TouchableOpacity style={[styles.actionBtn, styles.actionWhatsapp]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color={Colors.white} />
              <Text style={styles.actionLabel}>WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Statistiques */}
      <View style={styles.stats}>
        <Card style={styles.stat} padding={Sizes.md}>
          <Text style={styles.statValue}>{client.orderCount}</Text>
          <Text style={styles.statLabel}>Commandes</Text>
        </Card>
        <Card style={styles.stat} padding={Sizes.md}>
          <Text style={styles.statValue}>{client.lastMeasurement ? formatDate(client.lastMeasurement.createdAt) : '—'}</Text>
          <Text style={styles.statLabel}>Dernières mesures</Text>
        </Card>
      </View>

      {/* Notes */}
      {client.notes && (
        <Card>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{client.notes}</Text>
        </Card>
      )}

      {/* Navigation */}
      <Button
        label="Voir les mesures"
        onPress={() => navigation.navigate('Measurements', { clientId: client._id })}
        variant="outline"
        icon={<Ionicons name="body-outline" size={18} color={Colors.primary} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  clientHeader: { flexDirection: 'row', alignItems: 'center', gap: Sizes.md, marginBottom: Sizes.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Sizes.fontLg, fontWeight: '700', color: Colors.primary },
  clientInfo: { flex: 1, gap: 2 },
  clientName: { fontSize: Sizes.fontLg, fontWeight: '700', color: Colors.textPrimary },
  clientPhone: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
  clientCity: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Sizes.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Sizes.sm, backgroundColor: Colors.primary, borderRadius: Sizes.radiusMd, padding: Sizes.sm },
  actionWhatsapp: { backgroundColor: '#25D366' },
  actionLabel: { color: Colors.white, fontWeight: '700', fontSize: Sizes.fontSm },
  stats: { flexDirection: 'row', gap: Sizes.sm },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: Sizes.fontXs, color: Colors.textMuted },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, marginBottom: Sizes.sm },
  notes: { fontSize: Sizes.fontSm, color: Colors.textSecondary, lineHeight: 20 },
});
