import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { Colors } from '../../constants/colors';
import { Sizes } from '../../constants/sizes';
import { aiService } from '../../services/aiService';
import { AIJob } from '../../types';

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'failed';

export default function AIPhotoScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [job, setJob] = useState<AIJob | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à vos photos dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setJob(null);
      setPhase('idle');
      setError(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra dans les paramètres.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setJob(null);
      setPhase('idle');
      setError(null);
    }
  };

  const enhance = async () => {
    if (!imageUri) return;
    setPhase('uploading');
    setError(null);
    try {
      const { jobId } = await aiService.enhancePhoto(imageUri, { analyzeWithAI: true });
      setPhase('processing');
      const result = await aiService.pollJobUntilDone(jobId, (j) => setJob(j));
      setJob(result);
      setPhase('done');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du traitement.');
      setPhase('failed');
    }
  };

  const reset = () => {
    setImageUri(null);
    setJob(null);
    setPhase('idle');
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>✨ Retouche IA</Text>
        <Text style={styles.subtitle}>Améliorez la qualité de vos photos de créations</Text>

        {/* Zone image originale */}
        <Card style={styles.imageCard}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={Colors.primaryLight} />
              <Text style={styles.placeholderText}>Aucune photo sélectionnée</Text>
            </View>
          )}
        </Card>

        {/* Boutons sélection */}
        {!imageUri && (
          <View style={styles.pickButtons}>
            <Button label="Galerie" onPress={pickImage} variant="outline" icon={<Ionicons name="images-outline" size={18} color={Colors.primary} />} style={{ flex: 1 }} />
            <Button label="Caméra" onPress={takePhoto} variant="outline" icon={<Ionicons name="camera-outline" size={18} color={Colors.primary} />} style={{ flex: 1 }} />
          </View>
        )}

        {/* Statut traitement */}
        {phase === 'uploading' && <StatusBanner icon="cloud-upload-outline" text="Envoi de la photo..." color={Colors.info} />}
        {phase === 'processing' && <StatusBanner icon="sparkles-outline" text="L'IA améliore votre photo..." color={Colors.primary} loading />}
        {phase === 'done' && <StatusBanner icon="checkmark-circle-outline" text="Photo améliorée avec succès !" color={Colors.success} />}
        {phase === 'failed' && <StatusBanner icon="close-circle-outline" text={error || 'Échec du traitement.'} color={Colors.error} />}

        {/* Image résultat */}
        {phase === 'done' && job?.outputUrl && (
          <Card style={styles.imageCard}>
            <Text style={styles.resultLabel}>Photo améliorée</Text>
            <Image
              source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}${job.outputUrl}` }}
              style={styles.image}
              resizeMode="cover"
            />
            {job.processingMs && (
              <Text style={styles.processingTime}>Traitement en {(job.processingMs / 1000).toFixed(1)}s</Text>
            )}
          </Card>
        )}

        {/* Actions */}
        {imageUri && phase === 'idle' && (
          <Button label="Améliorer la photo" onPress={enhance} icon={<Ionicons name="sparkles" size={18} color={Colors.white} />} />
        )}
        {(phase === 'done' || phase === 'failed') && (
          <Button label="Recommencer" onPress={reset} variant="outline" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const StatusBanner = ({ icon, text, color, loading = false }: { icon: string; text: string; color: string; loading?: boolean }) => (
  <View style={[styles.banner, { borderColor: color, backgroundColor: `${color}15` }]}>
    {loading ? (
      <ActivityIndicator size="small" color={color} />
    ) : (
      <Ionicons name={icon as any} size={20} color={color} />
    )}
    <Text style={[styles.bannerText, { color }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Sizes.md, gap: Sizes.md, paddingBottom: Sizes.xxl },
  title: { fontSize: Sizes.fontXl, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  imageCard: { overflow: 'hidden', padding: 0 },
  image: { width: '100%', height: 280, borderRadius: Sizes.radiusLg },
  imagePlaceholder: { height: 200, alignItems: 'center', justifyContent: 'center', gap: Sizes.sm },
  placeholderText: { fontSize: Sizes.fontSm, color: Colors.textMuted },
  pickButtons: { flexDirection: 'row', gap: Sizes.sm },
  banner: { flexDirection: 'row', alignItems: 'center', gap: Sizes.sm, padding: Sizes.md, borderRadius: Sizes.radiusMd, borderWidth: 1 },
  bannerText: { fontSize: Sizes.fontSm, fontWeight: '600', flex: 1 },
  resultLabel: { fontSize: Sizes.fontMd, fontWeight: '700', color: Colors.textPrimary, padding: Sizes.md },
  processingTime: { fontSize: Sizes.fontXs, color: Colors.textMuted, textAlign: 'right', padding: Sizes.sm },
});
