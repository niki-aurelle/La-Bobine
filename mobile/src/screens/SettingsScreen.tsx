import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { useAppStore } from '../store/appStore';

const CURRENCIES = ['XAF', 'EUR', 'USD', 'GBP', 'XOF'];

export default function SettingsScreen() {
  const { user, updateUser } = useAuthStore();
  const showToast = useAppStore((s) => s.showToast);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    atelierName: user?.atelierName || '',
    currency: user?.currency || 'XAF',
    notificationsEnabled: user?.notificationsEnabled ?? true,
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (value: any) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setLoading(true);
    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated);
      showToast('Profil mis à jour.', 'success');
    } catch {
      showToast('Erreur lors de la sauvegarde.', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Mon profil</Text>
        <Input label="Nom complet" value={form.name} onChangeText={set('name')} leftIcon="person-outline" />
        <Input label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" />
        <Input label="Nom de l'atelier" value={form.atelierName} onChangeText={set('atelierName')} leftIcon="cut-outline" />

        <Text style={styles.sectionTitle}>Préférences</Text>

        {/* Devise */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Devise</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.currencyBtn, form.currency === c && styles.currencyBtnActive]}
                onPress={() => set('currency')(c)}
              >
                <Text style={[styles.currencyText, form.currency === c && styles.currencyTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Notifications</Text>
          <Switch
            value={form.notificationsEnabled}
            onValueChange={set('notificationsEnabled')}
            trackColor={{ true: Colors.primary, false: Colors.border }}
          />
        </View>

        <Button label="Enregistrer les modifications" onPress={save} loading={loading} />

        <Text style={styles.version}>La Bobine v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  sectionTitle: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, marginTop: Sizes.sm },
  field: { gap: Sizes.sm },
  fieldLabel: { fontSize: Sizes.fontSm, fontWeight: '600', color: Colors.textSecondary },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Sizes.sm },
  currencyBtn: { paddingHorizontal: Sizes.md, paddingVertical: 8, borderRadius: Sizes.radiusFull, borderWidth: 1.5, borderColor: Colors.border },
  currencyBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  currencyText: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textSecondary },
  currencyTextActive: { color: Colors.white },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Sizes.sm },
  switchLabel: { fontSize: Sizes.fontMd, color: Colors.textPrimary },
  version: { textAlign: 'center', fontSize: Sizes.fontXs, color: Colors.textMuted, marginTop: Sizes.md },
});
