import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error } = useAuthStore();

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email requis.';
    if (!password) e.password = 'Mot de passe requis.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧵</Text>
          <Text style={styles.appName}>La Bobine</Text>
          <Text style={styles.tagline}>Votre atelier dans votre poche</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            error={errors.email}
            placeholder="votre@email.com"
          />

          <Input
            label="Mot de passe"
            value={password}
            onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined })); }}
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
            placeholder="••••••••"
          />

          <Button label="Se connecter" onPress={handleLogin} loading={isLoading} />

          <Button
            label="Créer un compte"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Sizes.lg, justifyContent: 'center', gap: Sizes.xl },
  header: { alignItems: 'center', gap: Sizes.sm },
  logo: { fontSize: 56 },
  appName: { fontSize: Sizes.fontTitle, fontWeight: '800', color: Colors.primary },
  tagline: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  form: { gap: Sizes.md },
  title: { fontSize: Sizes.fontXl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Sizes.sm },
  errorBox: { backgroundColor: '#FEF2F2', padding: Sizes.md, borderRadius: Sizes.radiusMd, borderLeftWidth: 4, borderLeftColor: Colors.error },
  errorText: { color: Colors.error, fontSize: Sizes.fontSm },
});
