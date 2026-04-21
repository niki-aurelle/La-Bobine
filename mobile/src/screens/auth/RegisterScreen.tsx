import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', atelierName: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const { register, isLoading, error } = useAuthStore();

  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Nom requis.';
    if (!form.email.trim()) e.email = 'Email requis.';
    if (form.password.length < 6) e.password = 'Minimum 6 caractères.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🧵</Text>
            <Text style={styles.appName}>La Bobine</Text>
          </View>

          <Text style={styles.title}>Créer mon compte</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input label="Votre prénom et nom *" value={form.name} onChangeText={set('name')} leftIcon="person-outline" error={errors.name} placeholder="Marie Dupont" />
          <Input label="Email *" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" error={errors.email} placeholder="marie@atelier.fr" />
          <Input label="Mot de passe *" value={form.password} onChangeText={set('password')} isPassword leftIcon="lock-closed-outline" error={errors.password} placeholder="Minimum 6 caractères" />
          <Input label="Téléphone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" leftIcon="call-outline" placeholder="+237 6XX XXX XXX" />
          <Input label="Nom de l'atelier" value={form.atelierName} onChangeText={set('atelierName')} leftIcon="cut-outline" placeholder="Atelier Marie Couture" />

          <Button label="Créer mon compte" onPress={handleRegister} loading={isLoading} />
          <Button label="Déjà un compte ? Se connecter" onPress={() => navigation.goBack()} variant="ghost" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.lg, gap: Sizes.md, paddingBottom: Sizes.xxl },
  header: { alignItems: 'center', gap: Sizes.sm, marginVertical: Sizes.md },
  logo: { fontSize: 40 },
  appName: { fontSize: Sizes.fontXl, fontWeight: '800', color: Colors.primary },
  title: { fontSize: Sizes.fontXl, fontWeight: '700', color: Colors.textPrimary },
  errorBox: { backgroundColor: '#FEF2F2', padding: Sizes.md, borderRadius: Sizes.radiusMd, borderLeftWidth: 4, borderLeftColor: Colors.error },
  errorText: { color: Colors.error, fontSize: Sizes.fontSm },
});
