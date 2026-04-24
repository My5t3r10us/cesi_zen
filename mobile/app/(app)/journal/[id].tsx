import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emotionsApi, entriesApi } from '@/lib/api';
import { EmotionPicker } from '@/components/EmotionPicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [emotionId, setEmotionId] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['emotionCategories'],
    queryFn: () => emotionsApi.categories(),
  });

  const { data: entry, isLoading } = useQuery({
    queryKey: ['entry', id],
    queryFn: () => entriesApi.list().then((all) => all.find((e) => e.id === id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (entry) {
      setEmotionId(entry.emotionId);
      setIntensity(entry.intensity);
      setNote(entry.note ?? '');
      setSelectedTags(entry.contextTags ?? []);
    }
  }, [entry]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!emotionId) throw new Error('Sélectionnez une émotion');
      return entriesApi.update(id!, {
        emotionId,
        intensity,
        note: note.trim() || undefined,
        contextTags: selectedTags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => entriesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      router.back();
    },
  });

  function handleDelete() {
    Alert.alert(
      'Supprimer l\'entrée',
      'Cette action est irréversible. Confirmer la suppression ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Émotion */}
          <View style={styles.section}>
            <Text style={styles.label}>Émotion *</Text>
            <EmotionPicker
              categories={categories}
              value={emotionId}
              onChange={setEmotionId}
            />
          </View>

          {/* Intensité */}
          <View style={styles.section}>
            <Text style={styles.label}>Intensité *</Text>
            <IntensityPicker value={intensity} onChange={setIntensity} />
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.label}>Note (optionnel)</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Comment vous sentez-vous ?"
              placeholderTextColor={Colors.mutedForeground}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
            />
          </View>

          <Button
            onPress={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            size="lg"
          >
            Enregistrer les modifications
          </Button>

          <Button
            variant="destructive"
            onPress={handleDelete}
            loading={deleteMutation.isPending}
            size="lg"
          >
            Supprimer cette entrée
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  kav: { flex: 1 },
  container: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  errorBox: {
    backgroundColor: Colors.destructive + '18',
    borderWidth: 1,
    borderColor: Colors.destructive + '44',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: Colors.destructive, fontSize: FontSize.sm },
  section: { gap: 10 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  textarea: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: FontSize.base,
    color: Colors.foreground,
    minHeight: 100,
  },
});
