import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '@/constants/theme';
import type { EmotionCategory } from '@/lib/types';

interface EmotionPickerProps {
  categories: EmotionCategory[];
  value?: number | null;
  onChange: (emotionId: number) => void;
}

export function EmotionPicker({ categories, value, onChange }: EmotionPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const selectedEmotion = categories
    .flatMap((c) => c.emotions ?? [])
    .find((e) => e.id === value);

  const displayedEmotions = selectedCategoryId
    ? (categories.find((c) => c.id === selectedCategoryId)?.emotions ?? [])
    : [];

  function close() {
    setOpen(false);
    setSelectedCategoryId(null);
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, selectedEmotion ? styles.triggerSelected : undefined]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.triggerText, !selectedEmotion && styles.placeholder]}>
          {selectedEmotion ? selectedEmotion.label : 'Choisir une émotion…'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {selectedCategoryId ? 'Choisir une émotion' : 'Quelle est votre émotion ?'}
            </Text>
            <TouchableOpacity onPress={close}>
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>

          {!selectedCategoryId ? (
            <ScrollView contentContainerStyle={styles.listContent}>
              <Text style={styles.sectionLabel}>Sélectionnez une catégorie</Text>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryBtn, { borderColor: cat.colorHex + '66' }]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.dot, { backgroundColor: cat.colorHex }]} />
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryLabel}>{cat.label}</Text>
                    <Text style={styles.categoryCount}>
                      {cat.emotions?.length ?? 0} émotions
                    </Text>
                  </View>
                  <Text style={[styles.chevron, { color: cat.colorHex }]}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setSelectedCategoryId(null)}
              >
                <Text style={styles.backText}>‹ Retour aux catégories</Text>
              </TouchableOpacity>
              <Text style={styles.sectionLabel}>Choisissez votre émotion</Text>
              <View style={styles.emotionsGrid}>
                {displayedEmotions.map((emotion) => {
                  const isSelected = emotion.id === value;
                  const color = emotion.colorHex ?? Colors.primary;
                  return (
                    <TouchableOpacity
                      key={emotion.id}
                      style={[
                        styles.emotionChip,
                        { borderColor: color },
                        isSelected && { backgroundColor: color + '22' },
                      ]}
                      onPress={() => {
                        onChange(emotion.id);
                        close();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.emotionLabel, { color }]}>{emotion.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerSelected: { borderColor: Colors.primary },
  triggerText: { flex: 1, fontSize: FontSize.base, color: Colors.foreground },
  placeholder: { color: Colors.mutedForeground },
  chevron: { fontSize: 20, color: Colors.mutedForeground },
  modal: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.foreground,
  },
  closeText: { color: Colors.primary, fontSize: FontSize.base },
  listContent: { padding: 16, gap: 12 },
  sectionLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  categoryBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  categoryInfo: { flex: 1 },
  categoryLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.foreground,
  },
  categoryCount: { fontSize: FontSize.xs, color: Colors.mutedForeground, marginTop: 2 },
  backBtn: { marginBottom: 8 },
  backText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  emotionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emotionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: Colors.card,
  },
  emotionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
