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

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const prenomRef = useRef<TextInput>(null);
  const nomRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [form, setForm] = useState({
    email: '',
    prenom: '',
    nom: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: keyof typeof form) {
    return (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        nom: form.nom || undefined,
        prenom: form.prenom || undefined,
      });
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
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Créer un compte</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email *"
              placeholder="exemple@email.com"
              value={form.email}
              onChangeText={update('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => prenomRef.current?.focus()}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Input
                  ref={prenomRef}
                  label="Prénom"
                  placeholder="Marie"
                  value={form.prenom}
                  onChangeText={update('prenom')}
                  returnKeyType="next"
                  onSubmitEditing={() => nomRef.current?.focus()}
                />
              </View>
              <View style={styles.half}>
                <Input
                  ref={nomRef}
                  label="Nom"
                  placeholder="Dupont"
                  value={form.nom}
                  onChangeText={update('nom')}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            <Input
              ref={passwordRef}
              label="Mot de passe *"
              placeholder="••••••••"
              value={form.password}
              onChangeText={update('password')}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <Text style={styles.hint}>
              8 caractères min., une majuscule, une minuscule, un chiffre
            </Text>

            <Input
              ref={confirmRef}
              label="Confirmer le mot de passe *"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChangeText={update('confirmPassword')}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <Button onPress={handleRegister} loading={loading} size="lg" style={styles.submitBtn}>
              Créer mon compte
            </Button>
          </View>

          {/* Pied */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà inscrit ? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Se connecter</Text>
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
    gap: Spacing.xxl,
  },
  brand: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xl },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 30 },
  appName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  form: { gap: Spacing.md },
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
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  hint: { fontSize: FontSize.xs, color: Colors.mutedForeground, marginTop: -6 },
  submitBtn: { marginTop: Spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: Spacing.xl },
  footerText: { color: Colors.mutedForeground, fontSize: FontSize.sm },
  link: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
