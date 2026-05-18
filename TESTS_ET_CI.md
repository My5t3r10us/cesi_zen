# Tests & CI/CD — CESIZen

> Documentation complète de l'infrastructure de tests (web, API, mobile) et du pipeline CI/CD GitHub Actions.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Pyramide de tests](#2-pyramide-de-tests)
3. [Web — Vitest (unit)](#3-web--vitest-unit)
4. [Web — Supertest / Vitest (intégration API)](#4-web--supertest--vitest-intégration-api)
5. [Web — Playwright (E2E)](#5-web--playwright-e2e)
6. [Mobile — Jest (unit)](#6-mobile--jest-unit)
7. [Mobile — Maestro (E2E)](#7-mobile--maestro-e2e)
8. [GitHub Actions CI/CD](#8-github-actions-cicd)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Lancer les tests en local](#10-lancer-les-tests-en-local)
11. [Ajouter un nouveau test](#11-ajouter-un-nouveau-test)
12. [Dépannage](#12-dépannage)

---

## 1. Vue d'ensemble

CESIZen possède **5 couches de tests** sur 3 surfaces :

| Couche | Outil | Surface | Localisation | Quand ça tourne |
|--------|-------|---------|--------------|------------------|
| Unit web | **Vitest** | Web (Next.js) | `tests/unit/` | À chaque push (CI + local) |
| Intégration API | **Vitest + Supertest** | API REST `/app/api/*` | `tests/integration/` | À chaque push (CI + local, requiert Postgres) |
| E2E web | **Playwright** | Frontend Next.js | `e2e/` | À chaque push (CI + local, requiert build) |
| Unit mobile | **Jest** | Expo / React Native | `mobile/__tests__/` | À chaque push (CI + local) |
| E2E mobile | **Maestro** | App native iOS/Android | `mobile/.maestro/flows/` | Local + lint en CI |

Le pipeline **GitHub Actions** (`.github/workflows/ci.yml`) orchestre **10 jobs** parallèles à chaque push (toutes branches) et chaque pull request vers `master`/`main` :

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ web-quality  │  │mobile-quality│  │mobile-maestro│
│ (lint+tsc)   │  │ (lint+tsc)   │  │   -lint      │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
   ┌───┴────┐        ┌───┴────┐
   │web-build│       │mobile-unit│
   │web-unit │       └────────┘
   │web-integ│
   └────┬────┘
        │
   ┌────┴───┐
   │web-e2e │
   └────────┘

   (sur push master uniquement, conditionnel à EXPO_TOKEN)
   ┌─────────────────┬─────────────────┐
   │mobile-build-and │mobile-build-ios │
   └─────────────────┴─────────────────┘
```

---

## 2. Pyramide de tests

```
                     ▲
                    ╱ ╲
                   ╱   ╲   E2E (peu nombreux, lents, coûteux)
                  ╱     ╲   ─ Playwright (web)
                 ╱       ╲  ─ Maestro (mobile)
                ╱─────────╲
               ╱           ╲
              ╱  Intégra-   ╲   ─ Supertest (API + DB)
             ╱   tion        ╲
            ╱─────────────────╲
           ╱                   ╲   ─ Vitest (web)
          ╱       Unit          ╲  ─ Jest (mobile)
         ╱_______________________╲  (très nombreux, rapides)
```

**Quoi tester à quel niveau ?**

| Niveau | Quand l'utiliser |
|--------|------------------|
| **Unit** | Logique pure : hash mot de passe, chiffrement notes, validation Zod, helpers, hooks isolés. Pas de DB, pas de réseau. |
| **Intégration** | Endpoints API : routage + validation + auth + DB + chiffrement bout-en-bout. Vérifie l'ownership, les codes HTTP, les contraintes RBAC. |
| **E2E** | Parcours utilisateur complets : signup → dashboard → ajout d'émotion → stats → logout. Vérifie la stack entière. |

---

## 3. Web — Vitest (unit)

### 3.1 Configuration

**`vitest.config.ts`** (racine)

```ts
{
  environment: 'node',
  setupFiles: ['./tests/setup.ts'],
  include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  exclude: ['node_modules', '.next', 'mobile', 'e2e'],
  coverage: {
    provider: 'v8',
    thresholds: { lines: 60, functions: 60, branches: 60, statements: 60 },
  },
  pool: 'forks',
  poolOptions: { forks: { singleFork: true } }, // évite les races sur la DB
}
```

**`tests/setup.ts`** — chargé avant chaque suite :
- Charge `.env.test` via `dotenv`
- Force des valeurs par défaut pour `JWT_SECRET` / `ENCRYPTION_KEY` si absents
- Mock `next/cache` (`revalidatePath` no-op)
- Mock `next/headers` (`cookies()` → Map en mémoire) — la fonction `clearTestCookies()` est exportée pour reset entre tests
- Alias `@/*` → racine du projet

### 3.2 Fichiers de tests

| Fichier | Couvre | Tests |
|---------|--------|-------|
| `tests/unit/password.test.ts` | `lib/auth/password.ts` | Format `salt:hash` hex, salts aléatoires, vérif bonne/mauvaise/empty/case |
| `tests/unit/encryption.test.ts` | `lib/security/encryption.ts` | Round-trip, IV aléatoire, format `iv:tag:cipher`, rejet altération, format invalide, unicode + long contenu |
| `tests/unit/session.test.ts` | `lib/auth/session.ts` | `createSession` signe JWT 7j, `getSession` lit cookie, `getSessionFromRequest` lit Bearer puis fallback cookie, JWT invalide → null |
| `tests/unit/validation.test.ts` | `lib/validation/schemas.ts` | `registerSchema` (regex maj/min/chiffre, confirm match), `loginSchema`, `entrySchema` (1-10, ≤2000), `articleSchema` (slug regex) |

**Total : 30 tests, ~4s d'exécution.**

### 3.3 Exemple

```ts
// tests/unit/encryption.test.ts
import { encryptNote, decryptNote } from '@/lib/security/encryption';

it('round-trips a plaintext note', async () => {
  const plain = "Aujourd'hui je me sens bien.";
  expect(await decryptNote(await encryptNote(plain))).toBe(plain);
});
```

### 3.4 Lancer

```bash
bun run test:unit         # tests unit uniquement
bun run test              # tous les tests Vitest (unit + intégration)
bun run test:watch        # mode watch
bun run test:coverage     # rapport HTML dans ./coverage/
```

---

## 4. Web — Supertest / Vitest (intégration API)

### 4.1 Approche

Plutôt que de démarrer un serveur HTTP, les tests **importent directement les fonctions exportées par les Route Handlers Next** (`POST`, `GET`, `PUT`, `DELETE`, `PATCH`) et leur passent un `NextRequest` mocké. C'est l'approche officielle Next.js (« unit-testing of route handlers ») — rapide, fiable, sans port à gérer.

```
buildRequest('/api/entries', { method: 'POST', token, body: {...} })
        │
        ▼  NextRequest
   POST(req)              ← exporté par app/api/entries/route.ts
        │
        ▼  Postgres (test DB)
   Response (200/400/401/...)
        │
        ▼  readJson(res)
   { status, body }       ← assertions
```

### 4.2 Helpers (`tests/helpers/`)

**`request.ts`** — Construction `NextRequest`
```ts
buildRequest(url, {
  method?, body?, query?, token?, headers?
}): NextRequest

readJson<T>(res): { status, body }
```

**`auth.ts`** — Création utilisateurs de test
```ts
createTestUser({ email?, password?, role?, isBanned? })
  → { user, token, password }
```
Hashe le mot de passe (scrypt), insère en DB, signe un JWT 7j compatible avec `getSessionFromRequest`.

**`db.ts`** — Reset / seed
```ts
resetDb()              // TRUNCATE CASCADE sur toutes les tables
seedEmotion()          // crée Joie + Heureux
seedArticleCategory()  // crée Bien-être / bien-etre
```

### 4.3 Fichiers de tests

| Fichier | Endpoints couverts | Cas testés |
|---------|--------------------|-----------:|
| `tests/integration/auth.test.ts` | `/api/auth/{register,login,logout,me}` | register success/400/409 dup, login success/401/403 banned/401 unknown, me sans/avec Bearer, logout |
| `tests/integration/entries.test.ts` | `/api/entries{,/[id],/stats,/detailed-stats}` | 401 sans auth, create+read decrypted, ownership inter-users, 400 invalid, update+delete, 404 cross-user, stats agrégées, detailed-stats avec/sans dates |
| `tests/integration/articles.test.ts` | `/api/articles{,/by-slug/[slug]}` | GET all vs `publishedOnly=true`, POST sans admin → 403, by-slug 404, by-slug success |
| `tests/integration/admin.test.ts` | `/api/admin/{users,users/[id],stats}` | 403 sans session admin, list users, refus auto-modif, refus ban admin, toggleBan user OK, refus delete admin, stats |

### 4.4 Pré-requis local

```bash
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test \
  postgres:16

bunx drizzle-kit migrate    # applique le schéma
bun run test:integration
```

### 4.5 Exemple

```ts
it('creates an entry with encrypted note and reads it back decrypted', async () => {
  const { token } = await createTestUser();
  const { emotion } = await seedEmotion();

  await entriesPOST(buildRequest('/api/entries', {
    method: 'POST', token,
    body: { emotionId: emotion.id, intensity: 7, note: 'Ma note privée' },
  }));

  const list = await entriesGET(buildRequest('/api/entries', { token }));
  const { body } = await readJson<Entry[]>(list);
  expect(body[0].note).toBe('Ma note privée'); // déchiffré côté serveur
});
```

---

## 5. Web — Playwright (E2E)

### 5.1 Configuration

**`playwright.config.ts`**
- `baseURL` = `http://localhost:3000` (override via `E2E_BASE_URL`)
- 3 projets : Chromium, Firefox, WebKit
- `webServer` : démarre `bun run build && bun run start` automatiquement (sauf si `E2E_BASE_URL` est défini → suppose serveur déjà lancé)
- `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`
- En CI : `retries: 2`, `workers: 1`, reporter HTML + GitHub annotations

### 5.2 Spécifications

| Fichier | Parcours testé |
|---------|----------------|
| `e2e/landing.spec.ts` | Hero visible pour les invités · `/dashboard` redirige vers `/login` · `/admin` redirige vers `/login` |
| `e2e/auth.spec.ts` | Register → land sur `/dashboard` · login error pour mauvais credentials · logout → `/` |
| `e2e/journal.spec.ts` | User authentifié peut accéder à `/dashboard/journal` et `/dashboard/statistiques` |
| `e2e/conseils.spec.ts` | Page liste publique accessible · 404-like pour slug inconnu |

### 5.3 Lancer

```bash
bun run test:e2e:install    # première fois — télécharge les navigateurs
bun run test:e2e             # exécute toute la suite
bun run test:e2e:ui          # interface interactive Playwright UI
bunx playwright test --debug e2e/auth.spec.ts  # debug pas-à-pas
```

### 5.4 Stratégie de données

Les specs créent des utilisateurs **frais** à chaque test via `register` avec un email unique (`uniqueEmail()` dans chaque spec). Pas de fixture partagée — chaque test est indépendant.

### 5.5 Artefacts CI

Le job `web-e2e` upload `playwright-report/` comme artefact GitHub Actions (rétention 7 jours). En cas d'échec, on récupère :
- Captures d'écran des étapes ratées
- Vidéos des runs en échec
- Trace Playwright (rejouable via `bunx playwright show-trace`)

---

## 6. Mobile — Jest (unit)

### 6.1 Configuration

**`mobile/jest.config.js`**
```js
{
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  transformIgnorePatterns: [
    /* whitelist de packages RN à transformer */
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  coverageThreshold: { global: { lines: 40, ... } },
}
```

**`mobile/jest.setup.ts`** — mocks globaux :
- `expo-secure-store` : Map en mémoire (`getItemAsync`/`setItemAsync`/`deleteItemAsync`)
- `expo-router` : `useRouter`, `useLocalSearchParams`, `useNavigation`, `Link`, `Redirect`, `Stack`, `Tabs` retournent des stubs Jest
- `@react-native-community/slider` : composant string stub
- `global.fetch` : `jest.fn()` mocké

### 6.2 Fichiers de tests

| Fichier | Couvre | Cas |
|---------|--------|-----|
| `mobile/__tests__/lib/auth.test.ts` | `mobile/lib/auth.ts` (SecureStore wrapper) | persist, clear, rejet token vide |
| `mobile/__tests__/lib/api.test.ts` | `mobile/lib/api.ts` (fetch wrapper) | login sans Bearer, me avec Bearer, throw sur erreur HTTP, message générique sur body absent, articles.list sans auth |
| `mobile/__tests__/context/AuthContext.test.tsx` | `mobile/context/AuthContext.tsx` | initAuth restore user, login store+set, login throw si pas de token, logout clear+null |
| `mobile/__tests__/components/EntryCard.test.tsx` | `mobile/components/EntryCard.tsx` | rendu emotion+intensity+note+tags, hidden si null, onPress |
| `mobile/__tests__/components/IntensityPicker.test.tsx` | `mobile/components/IntensityPicker.tsx` | label « Modérée » pour 3, « Nulle » pour 0, « Très élevée » pour 5 |

### 6.3 Lancer

```bash
cd mobile
npm test                 # tous les tests
npm run test:watch       # watch mode
npm run test:coverage    # avec couverture (CI compat)
```

### 6.4 Exemple — testing avec React Query / Context

```tsx
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

it('login stores token and sets user', async () => {
  mockFetch
    .mockResolvedValueOnce(jsonResponse({ success: true, token: 'new-jwt' }))
    .mockResolvedValueOnce(jsonResponse({ userId: 'u1', email: 'a@b.co', role: 'user' }));

  const { result } = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(result.current.isLoading).toBe(false));

  await act(async () => {
    await result.current.login('a@b.co', 'Password123');
  });

  expect(await getStoredToken()).toBe('new-jwt');
  expect(result.current.user?.email).toBe('a@b.co');
});
```

---

## 7. Mobile — Maestro (E2E)

### 7.1 Pourquoi Maestro

- **Déclaratif** : flows en YAML, pas de code à maintenir.
- **Rapide** : démarrage sub-seconde, pas de WebDriver.
- **Cross-platform** : un seul flow tourne sur iOS et Android.
- **Cloud gratuit** (limité) : `maestro cloud` pour exécuter sur des appareils réels.

### 7.2 Flows

| Fichier | Scénario |
|---------|----------|
| `mobile/.maestro/flows/01-register.yaml` | Lance l'app fresh → s'inscrit avec email unique → land sur home (greeting visible) |
| `mobile/.maestro/flows/02-login.yaml` | Login avec un compte demo (`demo@cesizen.fr / Demo1234`) → home |
| `mobile/.maestro/flows/03-add-entry.yaml` | `runFlow: 02-login` → tap « Ajouter une entrée » → choisir émotion → enregistrer → vérifier home stats |
| `mobile/.maestro/flows/04-conseils.yaml` | login → onglet Conseils → liste articles |
| `mobile/.maestro/flows/05-statistiques.yaml` | login → onglet Stats → bascule 7j / 90j |
| `mobile/.maestro/flows/06-logout.yaml` | login → Profil → Se déconnecter (alert confirm) → écran Connexion |

`config.yaml` contient l'`appId` (`com.cesizen.app`) partagé.

### 7.3 Pré-requis

```bash
# macOS / Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows : via WSL ou Scoop
scoop install maestro
```

Un simulateur iOS ou émulateur Android **doit tourner** :
```bash
xcrun simctl boot "iPhone 15"
# ou
emulator -avd Pixel_API_34
```

### 7.4 Compte demo requis

Le flow `02-login.yaml` (et tous ceux qui dépendent de lui via `runFlow`) suppose qu'un compte `demo@cesizen.fr / Demo1234` existe. À créer manuellement la première fois ou via un seed API.

### 7.5 Lancer

```bash
# Installer l'app de dev sur le simulateur
cd mobile
bunx expo run:ios       # ou run:android

# Lancer un flow
maestro test mobile/.maestro/flows/01-register.yaml

# Toute la suite
cd mobile && npm run maestro:test

# Uniquement le lint (utilisé en CI)
cd mobile && npm run maestro:lint
```

### 7.6 CI

Le job `mobile-maestro-lint` exécute uniquement `maestro test --lint mobile/.maestro/flows/`. Les flows complets exigent un device qui n'est pas disponible sur les runners GitHub gratuits — ils sont à exécuter localement ou via Maestro Cloud.

---

## 8. GitHub Actions CI/CD

### 8.1 Déclencheurs

```yaml
on:
  push:
    branches: ['**']            # toutes les branches
  pull_request:
    branches: [master, main]    # PR vers les branches principales
```

### 8.2 Jobs

| Job | But | Bloquant ? | Durée typique |
|-----|-----|------------|---------------|
| `web-quality` | `bun run lint` + `bun run type-check` | ✅ | ~1 min |
| `web-build` | `bun run build` (Next.js prod) | ✅ | ~2 min |
| `web-unit` | `bun run test:unit` (Vitest) | ✅ | ~30 s |
| `web-integration` | Postgres service + migrate + `bun run test:integration` | ✅ | ~2 min |
| `web-e2e` | Postgres service + migrate + seed + Playwright | ✅ | ~5 min |
| `mobile-quality` | `npm run lint` + `npm run type-check` | ⚠ lint en `continue-on-error` | ~1 min |
| `mobile-unit` | `npm test --ci --coverage` | ⚠ `continue-on-error` | ~1 min |
| `mobile-maestro-lint` | `maestro test --lint flows/` | ✅ | ~30 s |
| `mobile-build-android` | `eas build -p android` | ⚠ optionnel (push master + EXPO_TOKEN) | ~10 min EAS |
| `mobile-build-ios` | `eas build -p ios` | ⚠ optionnel (push master + EXPO_TOKEN) | ~15 min EAS |

### 8.3 Graphe de dépendances

```
web-quality ──┬──► web-build ──► web-e2e
              ├──► web-unit
              └──► web-integration

mobile-quality ──┬──► mobile-unit
                 ├──► mobile-build-android  (master + EXPO_TOKEN)
                 └──► mobile-build-ios      (master + EXPO_TOKEN)

mobile-maestro-lint  (autonome)
```

### 8.4 Service Postgres

Les jobs `web-integration` et `web-e2e` instancient un container Postgres 16 :

```yaml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cesizen_test
    ports: ['5432:5432']
    options: >-
      --health-cmd pg_isready
      --health-interval 5s --health-timeout 5s --health-retries 10
```

Les migrations Drizzle sont appliquées via `bunx drizzle-kit migrate` avant chaque suite.

### 8.5 Builds EAS (mobile)

Les jobs `mobile-build-android` et `mobile-build-ios` :
1. **Ne tournent QUE sur push vers `master`** (`if: github.event_name == 'push' && github.ref == 'refs/heads/master'`)
2. **Skippent si `EXPO_TOKEN` est absent** (warning dans les logs, pas d'échec) — utile pour les forks/PR externes
3. Utilisent `--non-interactive --no-wait` : déclenchent le build sur les serveurs EAS, ne bloquent pas le runner

Le pattern « skip si secret absent » :

```yaml
- name: Skip if EXPO_TOKEN missing
  id: token-check
  run: |
    if [ -z "$EXPO_TOKEN" ]; then
      echo "skip=true" >> "$GITHUB_OUTPUT"
      echo "::warning::EXPO_TOKEN secret missing — skipping."
    else
      echo "skip=false" >> "$GITHUB_OUTPUT"
    fi

- name: Trigger build
  if: steps.token-check.outputs.skip == 'false'
  run: eas build ...
```

### 8.6 Variables d'environnement CI

Définies au niveau du workflow pour tous les jobs :

```yaml
env:
  JWT_SECRET: ci-test-secret-key-for-testing-only-32chars-long
  ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cesizen_test
```

Ce sont des valeurs **factices non-secrètes** — elles permettent au build/tests de tourner. La prod utilise des secrets dédiés via Vercel/Railway/etc.

### 8.7 Secrets requis (GitHub Settings → Secrets)

| Secret | Utilité | Comment l'obtenir |
|--------|---------|-------------------|
| `EXPO_TOKEN` | EAS builds iOS/Android | `eas login` puis https://expo.dev → Account Settings → Access Tokens |

Aucun secret n'est requis pour les jobs web — les valeurs factices suffisent.

### 8.8 Artefacts

| Artefact | Job | Rétention |
|----------|-----|-----------|
| `playwright-report/` | `web-e2e` | 7 jours |

À récupérer depuis l'onglet **Actions** → run → **Artifacts** en bas.

---

## 9. Variables d'environnement

### 9.1 Local (`.env.test`)

Chargé automatiquement par `tests/setup.ts` :

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cesizen_test
JWT_SECRET=test-secret-key-for-testing-only-32chars-long
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
NODE_ENV=test
```

> ⚠ `.env.test` est dans `.gitignore` (`.env*`) — c'est volontaire. Les valeurs sont régénérables et CI a son propre block `env:`.

### 9.2 Contraintes

| Variable | Format | Pourquoi |
|----------|--------|----------|
| `JWT_SECRET` | string ≥ 32 chars | Clé HMAC-SHA256 pour signer les JWT |
| `ENCRYPTION_KEY` | **64 chars hex** (= 32 octets) | AES-256-GCM exige une clé de 32 octets exacts |
| `DATABASE_URL` | `postgresql://user:pass@host:port/db` | Connection string `pg` |

### 9.3 Mobile

`mobile/lib/api.ts` lit `EXPO_PUBLIC_API_URL` (défaut : `http://localhost:3000`). En prod mobile, à définir via `eas.json` profile env.

---

## 10. Lancer les tests en local

### 10.1 Setup initial

```bash
# 1. Cloner + installer
git clone <repo>
cd cesi_zen
bun install
cd mobile && npm install && cd ..

# 2. Lancer Postgres de test
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test \
  postgres:16

# 3. Appliquer le schéma
bunx drizzle-kit migrate

# 4. Première fois Playwright
bun run test:e2e:install
```

### 10.2 Runs courants

```bash
# Tous les tests web (unit + intégration), rapide
bun run test

# Unit seulement (pas besoin de Postgres)
bun run test:unit

# Intégration uniquement
bun run test:integration

# E2E web (build + start auto)
bun run test:e2e

# E2E web ciblé
bunx playwright test e2e/auth.spec.ts --project=chromium --debug

# Mobile unit
cd mobile && npm test

# Mobile E2E (simulateur requis)
maestro test mobile/.maestro/flows/01-register.yaml

# Couverture web
bun run test:coverage
open coverage/index.html
```

### 10.3 Avant un push

```bash
bun run lint && bun run type-check && bun run test:unit
```

C'est l'équivalent rapide de `web-quality` + `web-unit` en CI. Pour reproduire **exactement** la CI :

```bash
bun run lint && \
bun run type-check && \
bun run build && \
bun run test:unit && \
bun run test:integration && \
bun run test:e2e
```

---

## 11. Ajouter un nouveau test

### 11.1 Test unit web

```bash
# Créer le fichier
touch tests/unit/mon-helper.test.ts
```

Squelette :
```ts
import { describe, it, expect } from 'vitest';
import { monHelper } from '@/lib/mon-helper';

describe('monHelper', () => {
  it('fait X dans le cas Y', () => {
    expect(monHelper(input)).toBe(expected);
  });
});
```

→ Pris automatiquement par `bun run test:unit` (glob `tests/**/*.test.ts`).

### 11.2 Test d'intégration API

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/mon-endpoint/route';
import { buildRequest, readJson } from '../helpers/request';
import { resetDb } from '../helpers/db';
import { createTestUser } from '../helpers/auth';

describe('POST /api/mon-endpoint', () => {
  beforeEach(async () => { await resetDb(); });

  it('rejette sans auth', async () => {
    const res = await POST(buildRequest('/api/mon-endpoint', { method: 'POST', body: {} }));
    expect(res.status).toBe(401);
  });

  it('accepte avec Bearer valide', async () => {
    const { token } = await createTestUser();
    const res = await POST(buildRequest('/api/mon-endpoint', {
      method: 'POST', token, body: { foo: 'bar' },
    }));
    expect(res.status).toBe(200);
  });
});
```

### 11.3 Test E2E Playwright

```ts
// e2e/ma-feature.spec.ts
import { test, expect } from '@playwright/test';

test('user peut faire X', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /commencer/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

→ Pris automatiquement par `bun run test:e2e`.

### 11.4 Test unit mobile

```tsx
// mobile/__tests__/components/MonComposant.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { MonComposant } from '@/components/MonComposant';

describe('MonComposant', () => {
  it('appelle onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MonComposant onPress={onPress} />);
    fireEvent.press(getByText('Tap'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 11.5 Flow Maestro

```yaml
# mobile/.maestro/flows/07-ma-feature.yaml
appId: com.cesizen.app
name: Ma feature
---
- runFlow: 02-login.yaml
- tapOn: "Mon bouton"
- assertVisible: "Résultat attendu"
```

---

## 12. Dépannage

### 12.1 « Cannot find module '@/lib/...' » dans Vitest

`vitest.config.ts` doit avoir l'alias :
```ts
resolve: { alias: { '@': path.resolve(__dirname, '.') } }
```

### 12.2 Tests d'intégration : « ECONNREFUSED 127.0.0.1:5432 »

Postgres de test pas démarré. Lancer :
```bash
docker start cesizen-pg-test
# ou recréer
docker run -d --name cesizen-pg-test -p 5432:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cesizen_test postgres:16
```

### 12.3 « ENCRYPTION_KEY environment variable is not set »

Vérifier `.env.test` ou exporter manuellement :
```bash
export ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 12.4 Playwright : `webServer` timeout

Le build Next.js peut être lent. Augmenter dans `playwright.config.ts` :
```ts
webServer: { ..., timeout: 240_000 }
```

Ou démarrer le serveur manuellement et utiliser `E2E_BASE_URL` :
```bash
bun run build && bun run start &
E2E_BASE_URL=http://localhost:3000 bunx playwright test
```

### 12.5 Jest mobile : « SyntaxError: Unexpected token 'export' »

Une lib RN n'est pas dans `transformIgnorePatterns`. L'ajouter à `mobile/jest.config.js` :
```js
transformIgnorePatterns: [
  'node_modules/(?!(...|ma-nouvelle-lib)/)',
],
```

### 12.6 Maestro « App not installed »

Installer l'app de dev avant de lancer un flow :
```bash
cd mobile && bunx expo run:ios
```

### 12.7 CI : `web-e2e` échoue mais passe en local

- Comparer le block `env:` du workflow avec ton `.env.test`
- Vérifier l'artefact `playwright-report` (vidéos + screenshots)
- Réduire `--workers=1` (déjà le cas en CI) ou augmenter `retries`

### 12.8 EAS build skipped malgré secret défini

- Vérifier que la branche est `master` (pas `main` ou autre)
- Vérifier les permissions du token (full access)
- Logs du job → étape « Skip if EXPO_TOKEN missing » montre `skip=true`

### 12.9 ESLint crash « contextOrFilename.getFilename »

ESLint 10 ↔ `eslint-plugin-react` incompat. Downgrade à ESLint 9 :
```json
"eslint": "^9.17.0"
```
(Déjà appliqué dans ce projet.)

---

## Annexe A — Checklist nouveau contributeur

- [ ] `bun install` à la racine
- [ ] `cd mobile && npm install`
- [ ] Docker tourne, container `cesizen-pg-test` démarré
- [ ] `bunx drizzle-kit migrate`
- [ ] `bun run test:unit` → 30 tests verts
- [ ] `bun run test:e2e:install` (Playwright browsers)
- [ ] (Optionnel mobile) Maestro installé + simulateur prêt

## Annexe B — Référence rapide commandes

| Commande | Effet |
|----------|-------|
| `bun run lint` | ESLint root (exclut mobile/) |
| `bun run type-check` | `tsc --noEmit` |
| `bun run build` | Build Next.js |
| `bun run test` | Vitest (unit + intégration) |
| `bun run test:unit` | Vitest unit seulement |
| `bun run test:integration` | Vitest intégration seulement |
| `bun run test:coverage` | Couverture HTML |
| `bun run test:e2e` | Playwright (web E2E) |
| `bun run test:e2e:ui` | Playwright UI mode |
| `cd mobile && npm run lint` | ESLint mobile |
| `cd mobile && npm run type-check` | tsc mobile |
| `cd mobile && npm test` | Jest mobile |
| `cd mobile && npm run maestro:lint` | Lint flows Maestro |
| `cd mobile && npm run maestro:test` | Exec flows Maestro |

---

*Dernière mise à jour : 2026-05-04 — synchronisée avec la branche `feat/testing-infrastructure`.*
