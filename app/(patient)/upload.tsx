import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';

interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export default function UploadScreen() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    addFile(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería de fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const name = asset.uri.split('/').pop() ?? 'imagen.jpg';
    addFile(asset.uri, name, 'image/jpeg');
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const name = `orden_${Date.now()}.jpg`;
    addFile(asset.uri, name, 'image/jpeg');
  };

  const addFile = (uri: string, name: string, type: string) => {
    setUploadedFiles(prev => [...prev, { uri, name, type, uploadedAt: new Date().toLocaleTimeString('es-CL') }]);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const submitUpload = async () => {
    if (uploadedFiles.length === 0) {
      Alert.alert('Sin archivos', 'Adjunta al menos una orden médica antes de enviar.');
      return;
    }
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    Alert.alert(
      '¡Orden enviada!',
      `Se envió ${uploadedFiles.length} archivo(s) correctamente. El equipo médico revisará tu orden a la brevedad.`,
      [{ text: 'Aceptar', onPress: () => { setUploadedFiles([]); setNotes(''); } }]
    );
  };

  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return 'document-text';
    if (type.includes('image')) return 'image';
    return 'attach';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Subir Orden Médica</Text>
      <Text style={styles.pageSubtitle}>
        Adjunta tu orden médica para que nuestro equipo pueda programar tus exámenes domiciliarios.
      </Text>

      {/* Upload Options */}
      <Card elevated style={styles.card}>
        <Text style={styles.cardTitle}>Seleccionar Archivo</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity style={[styles.optionBtn, { borderColor: Colors.primary }]} onPress={pickDocument}>
            <Ionicons name="document-text" size={28} color={Colors.primary} />
            <Text style={[styles.optionLabel, { color: Colors.primary }]}>PDF / Doc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, { borderColor: Colors.secondary }]} onPress={pickImage}>
            <Ionicons name="images" size={28} color={Colors.secondary} />
            <Text style={[styles.optionLabel, { color: Colors.secondary }]}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionBtn, { borderColor: Colors.warning }]} onPress={takePhoto}>
            <Ionicons name="camera" size={28} color={Colors.warning} />
            <Text style={[styles.optionLabel, { color: Colors.warning }]}>Cámara</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Attached Files */}
      {uploadedFiles.length > 0 && (
        <Card elevated style={styles.card}>
          <Text style={styles.cardTitle}>Archivos Adjuntos ({uploadedFiles.length})</Text>
          {uploadedFiles.map((file, i) => (
            <View key={i} style={styles.fileRow}>
              <View style={[styles.fileIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name={getFileIcon(file.type) as any} size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.fileTime}>Adjuntado a las {file.uploadedAt}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFile(i)} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}

      {/* Notes */}
      <Card elevated style={styles.card}>
        <Text style={styles.cardTitle}>Notas Adicionales</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          placeholder="Describe brevemente qué exámenes requieres, si tienes alguna restricción médica, o cualquier información relevante..."
          placeholderTextColor={Colors.textLight}
          value={notes}
          onChangeText={setNotes}
        />
      </Card>

      {/* Guidelines */}
      <Card style={[styles.card, { backgroundColor: Colors.primary + '08' }]}>
        <View style={styles.guidesHeader}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
          <Text style={[styles.cardTitle, { color: Colors.primary }]}>Indicaciones</Text>
        </View>
        {[
          'Asegúrate de que la orden esté legible y completa.',
          'Formatos aceptados: PDF, JPG, PNG.',
          'Tamaño máximo por archivo: 10 MB.',
          'Puedes adjuntar múltiples documentos.',
        ].map((tip, i) => (
          <View key={i} style={styles.guideItem}>
            <View style={styles.guideDot} />
            <Text style={styles.guideText}>{tip}</Text>
          </View>
        ))}
      </Card>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
        onPress={submitUpload}
        disabled={uploading}
        activeOpacity={0.85}
      >
        {uploading ? (
          <Text style={styles.submitBtnText}>Enviando...</Text>
        ) : (
          <>
            <Ionicons name="send" size={18} color={Colors.surface} />
            <Text style={styles.submitBtnText}>Enviar Orden Médica</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 18 },
  card: { marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  optionsGrid: { flexDirection: 'row', gap: 10 },
  optionBtn: {
    flex: 1, borderWidth: 2, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface,
  },
  optionLabel: { fontSize: 12, fontWeight: '700' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  fileIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  fileTime: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  removeBtn: { padding: 4 },
  notesInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    padding: 12, fontSize: 14, color: Colors.textPrimary,
    textAlignVertical: 'top', minHeight: 100,
  },
  guidesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  guideItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  guideDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  guideText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  submitBtn: {
    backgroundColor: Colors.patientColor,
    borderRadius: 12, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.patientColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: Colors.surface },
});
