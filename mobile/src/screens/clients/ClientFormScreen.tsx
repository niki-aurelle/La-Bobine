import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClientsStackParamList } from '../../navigation/stacks/ClientsStack';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { clientService } from '../../services/clientService';
import { useAppStore } from '../../store/appStore';

type Props = {
  navigation: NativeStackNavigationProp<ClientsStackParamList, 'ClientForm'>;
  route: RouteProp<ClientsStackParamList, 'ClientForm'>;
};

const INITIAL = { firstName: '', lastName: '', phone: '', email: '', address: '', city: '', notes: '' };

export default function ClientFormScreen({ navigation, route }: Props) {
  const { clientId } = route.params || {};
  const isEdit = !!clientId;
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState<Partial<typeof INITIAL>>({});
  const [loading, setLoading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    if (isEdit) {
      clientService.getOne(clientId).then((c) => {
        setForm({
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
          city: c.city || '',
          notes: c.notes || '',
        });
      });
    }
  }, [clientId]);

  const set = (key: keyof typeof INITIAL) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof INITIAL> = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis.';
    if (!form.lastName.trim()) e.lastName = 'Nom requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await clientService.update(clientId, form);
        showToast('Cliente mise à jour.', 'success');
      } else {
        await clientService.create(form);
        showToast('Cliente créée.', 'success');
      }
      navigation.goBack();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la sauvegarde.', 'error');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Input label="Prénom *" value={form.firstName} onChangeText={set('firstName')} error={errors.firstName} leftIcon="person-outline" placeholder="Marie" />
          <Input label="Nom *" value={form.lastName} onChangeText={set('lastName')} error={errors.lastName} leftIcon="person-outline" placeholder="Dupont" />
          <Input label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" placeholder="+237 6XX XXX XXX" />
          <Input label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" placeholder="marie@email.com" />
          <Input label="Adresse" value={form.address} onChangeText={set('address')} leftIcon="location-outline" placeholder="Rue, quartier..." />
          <Input label="Ville" value={form.city} onChangeText={set('city')} leftIcon="business-outline" placeholder="Yaoundé" />
          <Input label="Notes" value={form.notes} onChangeText={set('notes')} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} placeholder="Informations utiles sur la cliente..." />

          <Button label={isEdit ? 'Enregistrer les modifications' : 'Créer la cliente'} onPress={handleSave} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
});
