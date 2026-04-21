import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/colors';
import { Sizes } from '../constants/sizes';
import api from '../services/api';
import { Photo } from '../types';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - Sizes.md * 2 - Sizes.sm * 2) / 3;
const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api').replace('/api', '');

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const showToast = useAppStore((s) => s.showToast);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/photos');
      setPhotos(res.data.data);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { load(); }, []));

  const uploadPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const formData = new FormData();
    const filename = asset.uri.split('/').pop() || 'photo.jpg';
    formData.append('photo', { uri: asset.uri, name: filename, type: 'image/jpeg' } as any);

    setUploading(true);
    try {
      await api.post('/photos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Photo ajoutée.', 'success');
      load();
    } catch {
      showToast('Erreur lors de l\'upload.', 'error');
    }
    setUploading(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Galerie</Text>
        <TouchableOpacity style={styles.addBtn} onPress={uploadPhoto} disabled={uploading}>
          <Ionicons name={uploading ? 'cloud-upload-outline' : 'add'} size={22} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(i) => i._id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={photos.length === 0 ? { flex: 1 } : styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8}>
            <Image
              source={{ uri: `${BASE_URL}${item.originalUrl}` }}
              style={styles.photo}
              resizeMode="cover"
            />
            {item.isPortfolio && (
              <View style={styles.portfolioBadge}>
                <Ionicons name="star" size={10} color={Colors.white} />
              </View>
            )}
            {item.aiEnhanced && (
              <View style={[styles.portfolioBadge, { backgroundColor: Colors.primary, right: 24 }]}>
                <Ionicons name="sparkles" size={10} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="images-outline"
            title="Galerie vide"
            subtitle="Ajoutez vos premières photos de créations."
            actionLabel="Ajouter une photo"
            onAction={uploadPhoto}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Sizes.md },
  title: { fontSize: Sizes.fontLg, fontWeight: '800', color: Colors.textPrimary },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Sizes.md, paddingBottom: Sizes.xxl },
  row: { gap: Sizes.sm, marginBottom: Sizes.sm },
  photo: { width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: Sizes.radiusSm },
  portfolioBadge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' },
});
