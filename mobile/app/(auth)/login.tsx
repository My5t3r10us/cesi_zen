import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(app)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Branding */}
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>🧘</Text>
            </View>
            <Text style={styles.appName}>CESIZen</Text>
            <Text style={styles.tagline}>Votre espace de bien-être mental</Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Connexion</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Adresse email"
              placeholder="exemple@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Input
              ref={passwordRef}
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Button onPress={handleLogin} loading={loading} size="lg" style={styles.submitBtn}>
              Se connecter
            </Button>
          </View>

          {/* Pied de formulaire */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>S'inscrire</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  kav: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.xxxl,
  },
  brand: { alignItems: 'center', gap: Spacing.sm },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  form: { gap: Spacing.lg },
  formTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  errorBox: {
    backgroundColor: Colors.destructive + '18',
    borderWidth: 1,
    borderColor: Colors.destructive + '44',
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: Colors.destructive, fontSize: FontSize.sm },
  submitBtn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: Colors.mutedForeground, fontSize: FontSize.sm },
  link: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
