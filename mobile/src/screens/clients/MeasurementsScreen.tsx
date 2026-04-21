import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientsStackParamList } from '../../navigation/stacks/ClientsStack';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { clientService } from '../../services/clientService';
import { Measurement } from '../../types';
import { formatDate } from '../../utils/formatDate';

type Props = { route: RouteProp<ClientsStackParamList, 'Measurements'> };

const MEASUREMENT_LABELS: Record<string, string> = {
  totalHeight: 'Taille totale',
  bustCircumference: 'Tour de poitrine',
  underBust: 'Sous-poitrine',
  shoulderWidth: 'Largeur épaules',
  waistCircumference: 'Tour de taille',
  hipCircumference: 'Tour de hanches',
  backLength: 'Longueur dos',
  frontLength: 'Longueur devant',
  armLength: 'Longueur bras',
  armCircumference: 'Tour de bras',
  wristCircumference: 'Tour de poignet',
  inseamLength: 'Entrejambe',
  thighCircumference: 'Tour de cuisse',
  skirtLength: 'Longueur jupe',
};

export default function MeasurementsScreen({ route }: Props) {
  const { clientId } = route.params;
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    clientService.getMeasurements(clientId).then((data) => {
      setMeasurements(data);
      if (data.length > 0) setSelected(data[0]._id);
    });
  }, [clientId]);

  const current = measurements.find((m) => m._id === selected);

  const renderValue = (key: string, value: number | undefined, unit: string) => {
    if (!value) return null;
    return (
      <View key={key} style={styles.measureRow}>
        <Text style={styles.measureLabel}>{MEASUREMENT_LABELS[key] || key}</Text>
        <Text style={styles.measureValue}>{value} {unit}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Sélecteur de jeu de mesures */}
        {measurements.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            <View style={styles.tabs}>
              {measurements.map((m) => (
                <TouchableOpacity
                  key={m._id}
                  style={[styles.tab, selected === m._id && styles.tabActive]}
                  onPress={() => setSelected(m._id)}
                >
                  <Text style={[styles.tabText, selected === m._id && styles.tabTextActive]}>
                    {m.label}
                  </Text>
                  <Text style={styles.tabDate}>{formatDate(m.createdAt)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Mesures actuelles */}
        {current ? (
          <Card>
            <Text style={styles.sectionTitle}>📏 Mesures standard ({current.unit})</Text>
            {Object.keys(MEASUREMENT_LABELS).map((key) =>
              renderValue(key, (current as any)[key], current.unit)
            )}

            {current.customMeasurements && current.customMeasurements.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: Sizes.md }]}>📐 Mesures personnalisées</Text>
                {current.customMeasurements.map((cm, i) => (
                  <View key={i} style={styles.measureRow}>
                    <Text style={styles.measureLabel}>{cm.name}</Text>
                    <Text style={styles.measureValue}>{cm.value} {cm.unit}</Text>
                  </View>
                ))}
              </>
            )}

            {current.notes && (
              <View style={{ marginTop: Sizes.md }}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notes}>{current.notes}</Text>
              </View>
            )}
          </Card>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="body-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>Aucune mesure enregistrée</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  tabsScroll: { marginBottom: Sizes.sm },
  tabs: { flexDirection: 'row', gap: Sizes.sm },
  tab: { padding: Sizes.sm, borderRadius: Sizes.radiusMd, backgroundColor: Colors.surfaceSecondary, minWidth: 120 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Sizes.fontSm, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.white },
  tabDate: { fontSize: Sizes.fontXs, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, marginBottom: Sizes.sm },
  measureRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  measureLabel: { fontSize: Sizes.fontSm, color: Colors.textSecondary },
  measureValue: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textPrimary },
  notesLabel: { fontSize: Sizes.fontSm, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  notes: { fontSize: Sizes.fontSm, color: Colors.textSecondary, lineHeight: 20 },
  empty: { alignItems: 'center', gap: Sizes.md, padding: Sizes.xl },
  emptyTitle: { fontSize: Sizes.fontMd, color: Colors.textMuted },
});
