import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.primary,
        headerTitleStyle: { color: Colors.foreground, fontWeight: '600' },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mon journal' }} />
      <Stack.Screen
        name="new"
        options={{ title: 'Nouvelle entrée', presentation: 'modal' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Modifier l\'entrée', presentation: 'modal' }}
      />
    </Stack>
  );
}
