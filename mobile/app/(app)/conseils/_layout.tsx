import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ConseilsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.primary,
        headerTitleStyle: { color: Colors.foreground, fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Conseils & Articles' }} />
      <Stack.Screen name="[slug]" options={{ title: 'Article' }} />
    </Stack>
  );
}
