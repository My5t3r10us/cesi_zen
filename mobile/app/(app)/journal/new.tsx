import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emotionsApi, entriesApi } from '@/lib/api';
import { EmotionPicker } from '@/components/EmotionPicker';
import { IntensityPicker } from '@/components/IntensityPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

const CONTEXT_TAGS_SUGGESTIONS = [
  'travail', 'famille', 'amis', 'sport', 'sommeil',
  'alimentation', 'détente', 'stress', 'maladie', 'météo',
];

export default function NewEntryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [emotionId, setEmotionId] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['emotionCategories'],
    queryFn: () => emotionsApi.categories(),
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!emotionId) throw new Error('Sélectionnez une émotion');
      return entriesApi.create({
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

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function addCustomTag() {
    const tag = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags((prev) => [...prev, tag]);
    }
    setCustomTag('');
  }

  function handleSubmit() {
    if (!emotionId) {
      setError('Veuillez sélectionner une émotion');
      return;
    }
    setError('');
    mutation.mutate();
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
              placeholder="Comment vous sentez-vous ? Que s'est-il passé ?"
              placeholderTextColor={Colors.mutedForeground}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{note.length}/2000</Text>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.label}>Contexte (optionnel)</Text>
            <View style={styles.tags}>
              {CONTEXT_TAGS_SUGGESTIONS.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => toggleTag(tag)}
                  style={styles.tagBtn}
                >
                  {tag}
                </Button>
              ))}
            </View>
            <View style={styles.customTagRow}>
              <Input
                placeholder="Ajouter un tag…"
                value={customTag}
                onChangeText={setCustomTag}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={addCustomTag}
                style={styles.customTagInput}
              />
              <Button onPress={addCustomTag} variant="outline" size="sm">
                Ajouter
              </Button>
            </View>
            {selectedTags.length > 0 ? (
              <View style={styles.selectedTags}>
                {selectedTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="primary"
                    size="sm"
                    onPress={() => toggleTag(tag)}
                    style={styles.tagBtn}
                  >
                    #{tag} ✕
                  </Button>
                ))}
              </View>
            ) : null}
          </View>

          <Button onPress={handleSubmit} loading={mutation.isPending} size="lg">
            Enregistrer l'entrée
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
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
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.mutedForeground,
    textAlign: 'right',
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBtn: { borderRadius: 20 },
  customTagRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  customTagInput: { flex: 1 },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
});
