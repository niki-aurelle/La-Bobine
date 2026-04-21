import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreStackParamList } from '../navigation/stacks/MoreStack';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'> };

const MenuItem = ({ icon, label, onPress, color = Colors.primary }: any) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.itemIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.itemLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
  </TouchableOpacity>
);

export default function MoreMenuScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profil */}
        <View style={styles.profile}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>{user?.name?.[0] || '?'}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileAtelier}>{user?.atelierName || 'Mon Atelier'}</Text>
          </View>
        </View>

        {/* Fonctionnalités */}
        <Text style={styles.groupTitle}>Gestion</Text>
        <View style={styles.group}>
          <MenuItem icon="cube-outline" label="Livraisons" onPress={() => navigation.navigate('Deliveries')} />
          <MenuItem icon="cash-outline" label="Paiements" onPress={() => navigation.navigate('Payments')} />
          <MenuItem icon="layers-outline" label="Stock" onPress={() => navigation.navigate('Stock')} />
        </View>

        <Text style={styles.groupTitle}>Créations</Text>
        <View style={styles.group}>
          <MenuItem icon="images-outline" label="Galerie photo" onPress={() => navigation.navigate('Gallery', {})} />
          <MenuItem icon="sparkles-outline" label="Retouche IA" onPress={() => navigation.navigate('AIPhoto', {})} color={Colors.secondary} />
        </View>

        <Text style={styles.groupTitle}>Mon compte</Text>
        <View style={styles.group}>
          <MenuItem icon="settings-outline" label="Paramètres" onPress={() => navigation.navigate('Settings')} />
          <MenuItem icon="log-out-outline" label="Déconnexion" onPress={logout} color={Colors.error} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: Sizes.md, backgroundColor: Colors.surface, padding: Sizes.md, borderRadius: Sizes.radiusLg, borderWidth: 1, borderColor: Colors.border },
  profileAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  profileInitials: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.white },
  profileName: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary },
  profileAtelier: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  groupTitle: { fontSize: Sizes.fontSm, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: -4 },
  group: { backgroundColor: Colors.surface, borderRadius: Sizes.radiusLg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: Sizes.md, padding: Sizes.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: Sizes.fontMd, fontWeight: '600', color: Colors.textPrimary },
});
