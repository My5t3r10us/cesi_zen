export type User = {
  userId: string;
  email: string;
  nom?: string | null;
  prenom?: string | null;
  role: 'user' | 'admin';
};

export type EmotionCategory = {
  id: number;
  label: string;
  colorHex: string;
  iconName: string;
  emotions?: Emotion[];
};

export type Emotion = {
  id: number;
  label: string;
  categoryId: number;
  colorHex?: string | null;
  iconName?: string | null;
  category?: EmotionCategory;
};

export type Entry = {
  id: string;
  userId: string;
  emotionId: number;
  intensity: number;
  note?: string | null;
  contextTags?: string[] | null;
  createdAt: string;
  emotion?: Emotion;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; email: string; nom?: string | null; prenom?: string | null };
  category?: { id: number; label: string; slug: string; colorHex: string };
};

export type ArticleCategory = {
  id: number;
  label: string;
  slug: string;
  colorHex: string;
};

export type StatsData = {
  totalEntries: number;
  dailyAverages: Array<{ date: string; averageIntensity: number; count: number }>;
  recentEntries: Entry[];
};

export type DetailedStats = {
  totalEntries: number;
  averageIntensity: number;
  mostFrequentEmotion: { label: string; count: number } | null;
  mostFrequentCategory: { label: string; count: number } | null;
  emotionDistribution: Array<{ emotionId: number; label: string; count: number; colorHex?: string | null }>;
  categoryDistribution: Array<{ categoryId: number; label: string; count: number; colorHex: string }>;
  dailyAverages: Array<{ date: string; averageIntensity: number; count: number }>;
  streakDays: number;
  contextTagsDistribution: Array<{ tag: string; count: number }>;
};
