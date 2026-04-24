import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, value, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon as React.ComponentProps<typeof Ionicons>['name']}
          size={18}
          color={danger ? Colors.destructive : Colors.primary}
        />
      </View>
      <Text style={[styles.menuLabel, danger && { color: Colors.destructive }]}>
        {label}
      </Text>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={Colors.mutedForeground} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    user?.prenom && user?.nom
      ? `${user.prenom} ${user.nom}`
      : user?.prenom ?? user?.email ?? '';

  const initials = displayName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  function confirmLogout() {
    Alert.alert(
      'Se déconnecter',
      'Voulez-vous vraiment vous déconnecter de CESIZen ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Avatar + nom */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || '?'}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === 'admin' ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrateur</Text>
            </View>
          ) : null}
        </View>

        {/* Informations */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <MenuItem icon="person-outline" label="Prénom" value={user?.prenom ?? '–'} />
          <View style={styles.divider} />
          <MenuItem icon="person-outline" label="Nom" value={user?.nom ?? '–'} />
          <View style={styles.divider} />
          <MenuItem icon="mail-outline" label="Email" value={user?.email} />
        </Card>

        {/* Navigation rapide */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <MenuItem
            icon="book-outline"
            label="Mon journal"
            onPress={() => router.push('/(app)/journal')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="bar-chart-outline"
            label="Mes statistiques"
            onPress={() => router.push('/(app)/statistiques')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="newspaper-outline"
            label="Conseils & Articles"
            onPress={() => router.push('/(app)/conseils')}
          />
        </Card>

        {/* À propos */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <MenuItem icon="shield-checkmark-outline" label="Confidentialité" value="Chiffrement AES-256" />
          <View style={styles.divider} />
          <MenuItem icon="information-circle-outline" label="Version" value="1.0.0" />
        </Card>

        {/* Déconnexion */}
        <Button
          variant="outline"
          size="lg"
          loading={loggingOut}
          onPress={confirmLogout}
          style={styles.logoutBtn}
        >
          Se déconnecter
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  hero: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.primaryForeground,
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
  },
  email: { fontSize: FontSize.sm, color: Colors.mutedForeground },
  adminBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  adminBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  section: { gap: 0, padding: 0, overflow: 'hidden' },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.foreground },
  menuValue: { fontSize: FontSize.sm, color: Colors.mutedForeground },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  logoutBtn: {
    borderColor: Colors.destructive,
  },
});
