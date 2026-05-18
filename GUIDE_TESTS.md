# Guide Complet des Tests — CESIZen

> Ce guide couvre **100 % des tests** disponibles dans le projet : unitaires, intégration, E2E web et E2E mobile.
> Temps de lecture estimé : 15 min. Temps de setup initial : 10–20 min.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis — Installation](#2-prérequis--installation)
3. [Configuration initiale (une seule fois)](#3-configuration-initiale-une-seule-fois)
4. [Tests unitaires — Web](#4-tests-unitaires--web-vitest)
5. [Tests unitaires — Mobile](#5-tests-unitaires--mobile-jest)
6. [Tests d'intégration — API](#6-tests-dintégration--api-vitest--supertest)
7. [Tests E2E — Web (Playwright)](#7-tests-e2e--web-playwright)
8. [Tests E2E — Mobile (Maestro)](#8-tests-e2e--mobile-maestro)
9. [Couverture de code](#9-couverture-de-code)
10. [Pipeline CI/CD (GitHub Actions)](#10-pipeline-cicd-github-actions)
11. [Dépannage](#11-dépannage)
12. [Référence rapide](#12-référence-rapide)

---

## 1. Vue d'ensemble

### Architecture du projet

```
cesi_zen/                    ← Web + API (Next.js 16, TypeScript)
└── mobile/                  ← Application mobile (Expo 55, React Native)
```

### Matrice des tests

| Type | Surface | Framework | Fichiers | DB requise | Commande |
|------|---------|-----------|----------|-----------|---------|
| Unitaires | Web/API | Vitest | `tests/unit/` (4) | Non | `bun run test:unit` |
| Unitaires | Mobile | Jest | `mobile/__tests__/` (5) | Non | `npm test` |
| Intégration | API | Vitest + Supertest | `tests/integration/` (4) | **Oui** | `bun run test:integration` |
| E2E | Web | Playwright | `e2e/` (4) | **Oui** | `bun run test:e2e` |
| E2E | Mobile | Maestro | `mobile/.maestro/flows/` (6) | Non | `npm run maestro:test` |

### Pyramide des tests

```
          /▲\
         / E2E \       ← Playwright (Web) + Maestro (Mobile)
        /───────\      ← Plus lent, plus fragile, couvre les flux utilisateur complets
       /Intégrat.\
      /───────────\    ← Tests d'API avec vraie DB, vérifie l'enchaînement des couches
     /  Unitaires  \
    /───────────────\  ← Rapides, isolés, couvrent la logique métier pure
```

---

## 2. Prérequis — Installation

### 2.1 Docker Desktop (pour la base de données de test)

Docker lance PostgreSQL 16 dans un conteneur isolé. Cela garantit une base identique sur toutes les machines, sans polluer votre installation locale.

**Windows :**
```
https://www.docker.com/products/docker-desktop/
```
Télécharger et installer Docker Desktop. Redémarrer si demandé.

**Vérification :**
```powershell
docker --version        # Docker version 27.x.x
docker compose version  # Docker Compose version v2.x.x
```

---

### 2.2 Bun (gestionnaire de paquets Web)

**Windows (PowerShell) :**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**macOS / Linux :**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Vérification :**
```bash
bun --version  # 1.x.x
```

---

### 2.3 Node.js 20+ (pour le mobile)

**Téléchargement :** https://nodejs.org/en/download (LTS)

Ou avec `nvm` :
```bash
nvm install 20
nvm use 20
```

**Vérification :**
```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

### 2.4 Playwright (navigateurs pour les E2E Web)

Playwright est installé comme dépendance du projet. Il faut installer les navigateurs séparément une seule fois :

```bash
bun run test:e2e:install
```

Cela installe Chromium, Firefox et WebKit (~300 Mo).

---

### 2.5 Maestro CLI (pour les E2E Mobile — optionnel)

Maestro est nécessaire uniquement pour les tests E2E mobile en local. Les tests unitaires mobile ne le requièrent pas.

**macOS / Linux :**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```

**Windows :** Maestro ne supporte pas Windows nativement.
Utiliser WSL2 (Windows Subsystem for Linux) :
```bash
# Dans WSL2
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Vérification :**
```bash
maestro --version  # Maestro v1.x.x
```

> Maestro nécessite également Java 11+ : `java --version`

---

### 2.6 Simulateur / Émulateur (pour Maestro)

**iOS (macOS uniquement) :**
- Installer Xcode depuis l'App Store
- `xcode-select --install`
- Démarrer un simulateur : `open -a Simulator`

**Android :**
- Installer Android Studio
- Créer un AVD (Android Virtual Device) via AVD Manager
- Démarrer l'émulateur : `emulator -avd Pixel_API_34`

---

## 3. Configuration initiale (une seule fois)

À faire lors du premier clonage du projet ou sur une nouvelle machine.

### Étape 1 — Installer les dépendances

```bash
# Web (depuis la racine du projet)
bun install

# Mobile
cd mobile && npm install --no-audit --no-fund && cd ..
```

---

### Étape 2 — Créer le fichier d'environnement de test

```bash
# Copier le template
cp .env.test.example .env.test
```

Le fichier `.env.test` contient des valeurs préconfigurées qui fonctionnent immédiatement avec Docker. Vous n'avez rien à modifier sauf si votre PostgreSQL tourne sur un port différent.

Contenu du fichier :
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cesizen_test
JWT_SECRET=test-secret-key-for-testing-only-32chars
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

> **Note :** `.env.test` est ignoré par git (données non-secrètes mais convention locale).
> `.env.test.example` est lui versionné et sert de référence.

---

### Étape 3 — Démarrer la base de données de test

```bash
docker compose up -d
```

Attendre que le healthcheck passe au vert (~10 secondes) :
```bash
docker compose ps
# cesizen_db_test   Up (healthy)   0.0.0.0:5432->5432/tcp
```

> **Pourquoi Docker ?**
> Docker isole la base de test de votre base de développement. Vous pouvez tout supprimer (`docker compose down -v`) sans risquer vos données. Le conteneur est identique à l'environnement CI (GitHub Actions utilise aussi postgres:16).

---

### Étape 4 — Initialiser la base de données

```bash
# Applique les migrations Drizzle + insère les données de référence
bun run db:test-setup
```

Ce script exécute dans l'ordre :
1. `drizzle-kit migrate` — crée toutes les tables selon le schéma
2. `tsx lib/db/seed.ts` — insère les émotions, catégories et l'utilisateur admin

**Données seedées :**
- 6 catégories d'émotions (Joie, Colère, Peur, Tristesse, Surprise, Dégoût)
- 36 émotions (6 par catégorie)
- 6 catégories d'articles
- 1 compte admin : `admin@cesizen.fr` / `Admin123!`

---

### Étape 5 — Installer les navigateurs Playwright (une seule fois)

```bash
bun run test:e2e:install
```

---

### Vérification du setup

Lancez ces deux commandes pour confirmer que tout fonctionne :

```bash
bun run test:unit           # doit passer (pas de DB requise)
bun run test:integration    # doit passer (requiert la DB Docker)
```

---

## 4. Tests unitaires — Web (Vitest)

### Ce qui est testé

| Fichier | Fonctions couvertes |
|---------|-------------------|
| `tests/unit/encryption.test.ts` | `encrypt()`, `decrypt()` (AES-256-GCM) |
| `tests/unit/password.test.ts` | `hashPassword()`, `verifyPassword()` (bcrypt) |
| `tests/unit/session.test.ts` | `createSession()`, `verifySession()`, `deleteSession()` (JWT) |
| `tests/unit/validation.test.ts` | Schémas Zod : email, mot de passe, formulaires |

Ces tests sont **purement fonctionnels** : aucune DB, aucun serveur, aucun mock réseau.

### Commandes

```bash
# Lancer tous les tests unitaires
bun run test:unit

# En mode watch (relance automatiquement à chaque sauvegarde)
bun run test:watch -- tests/unit

# Lancer un fichier spécifique
bun run test:unit -- tests/unit/encryption.test.ts

# Lancer un test par nom (grep)
bun run test:unit -- -t "chiffre et déchiffre"

# Avec rapport de couverture
bun run test:unit -- --coverage
```

### Exemple de sortie attendue

```
✓ tests/unit/encryption.test.ts (12 tests) 45ms
✓ tests/unit/password.test.ts (8 tests) 892ms
✓ tests/unit/session.test.ts (15 tests) 23ms
✓ tests/unit/validation.test.ts (28 tests) 12ms

Test Files  4 passed (4)
Tests      63 passed (63)
Duration   1.2s
```

---

## 5. Tests unitaires — Mobile (Jest)

### Ce qui est testé

| Fichier | Fonctions couvertes |
|---------|-------------------|
| `__tests__/lib/api.test.ts` | Appels HTTP vers l'API (fetch mocké) |
| `__tests__/lib/auth.test.ts` | Login, logout, stockage token (SecureStore mocké) |
| `__tests__/context/AuthContext.test.tsx` | Contexte d'authentification React |
| `__tests__/components/EntryCard.test.tsx` | Rendu du composant carte d'entrée |
| `__tests__/components/IntensityPicker.test.tsx` | Composant sélecteur d'intensité |

### Commandes

```bash
# Se placer dans le dossier mobile
cd mobile

# Lancer tous les tests unitaires
npm test

# En mode watch interactif
npm run test:watch

# Avec couverture de code
npm run test:coverage

# Lancer un fichier spécifique
npx jest __tests__/lib/api.test.ts

# Lancer un test par nom
npx jest -t "retourne null si le token est absent"

# Revenir à la racine
cd ..
```

### Mocks actifs (jest.setup.ts)

Les tests mobile utilisent ces mocks automatiquement :
- **`expo-secure-store`** → Map en mémoire (simulé sans appareil)
- **`expo-router`** → Fonctions navigation mockées (`push`, `replace`, `back`)
- **`@react-native-community/slider`** → Composant factice `'Slider'`
- **`global.fetch`** → `jest.fn()` (à configurer dans chaque test)

### Exemple de sortie attendue

```
PASS __tests__/lib/auth.test.ts
PASS __tests__/lib/api.test.ts
PASS __tests__/context/AuthContext.test.tsx
PASS __tests__/components/EntryCard.test.tsx
PASS __tests__/components/IntensityPicker.test.tsx

Test Suites: 5 passed, 5 total
Tests:       47 passed, 47 total
Snapshots:   0 total
Time:        3.2s
```

---

## 6. Tests d'intégration — API (Vitest + Supertest)

### Prérequis

- Docker en cours d'exécution (`docker compose up -d`)
- `.env.test` avec `DATABASE_URL` valide
- Base de données migrée (`bun run db:test-setup`)

### Ce qui est testé

| Fichier | Routes testées |
|---------|---------------|
| `tests/integration/auth.test.ts` | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| `tests/integration/entries.test.ts` | `GET /api/entries`, `POST /api/entries`, `PUT /api/entries/[id]`, `DELETE /api/entries/[id]` |
| `tests/integration/articles.test.ts` | `GET /api/articles`, `POST /api/articles`, `PUT /api/articles/[id]`, `DELETE /api/articles/[id]` |
| `tests/integration/admin.test.ts` | Routes admin : gestion utilisateurs, bannissement, statistiques |

### Architecture des tests d'intégration

Ces tests appellent directement les **Route Handlers Next.js** (sans serveur HTTP) :

```
Test → buildRequest() → Route Handler → DB PostgreSQL réelle
```

Avant chaque test (`beforeEach`) :
1. `resetDb()` — tronque toutes les tables (TRUNCATE ... CASCADE)
2. Données de test créées dynamiquement via `createTestUser()`, `seedEmotion()`, etc.

Cela garantit l'**isolation complète** : chaque test part d'une base vide.

### Commandes

```bash
# Lancer tous les tests d'intégration
bun run test:integration

# En mode watch (pratique pour le développement)
bun run test:watch -- tests/integration

# Un fichier spécifique
bun run test:integration -- tests/integration/auth.test.ts

# Un test spécifique par nom
bun run test:integration -- -t "refuse l'inscription avec un email existant"

# Avec logs détaillés (--reporter=verbose)
bun run test:integration -- --reporter=verbose
```

### Réinitialiser la base de données manuellement

Si les tests laissent des données résiduelles ou si vous voulez repartir à zéro :

```bash
# Réinitialise le schéma complet (DROP + recreate)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cesizen_test \
  psql -f reset-db.sql
bun run db:test-setup

# Ou en PowerShell (Windows)
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cesizen_test"
psql $env:DATABASE_URL -f reset-db.sql
bun run db:test-setup
```

### Exemple de sortie attendue

```
✓ tests/integration/auth.test.ts (18 tests) 1.2s
✓ tests/integration/entries.test.ts (14 tests) 0.9s
✓ tests/integration/articles.test.ts (12 tests) 0.8s
✓ tests/integration/admin.test.ts (11 tests) 1.1s

Test Files  4 passed (4)
Tests      55 passed (55)
Duration   4.8s
```

---

## 7. Tests E2E — Web (Playwright)

### Prérequis

- Docker en cours d'exécution (`docker compose up -d`)
- Base de données migrée ET seedée (`bun run db:test-setup`)
- Navigateurs Playwright installés (`bun run test:e2e:install`)
- **Le serveur Next.js est lancé automatiquement par Playwright** (build + start)

> Playwright effectue d'abord un `bun run build` puis `bun run start` avant les tests.
> Cela prend ~2 minutes au premier lancement. Patience.

### Ce qui est testé

| Fichier | Scénarios |
|---------|-----------|
| `e2e/landing.spec.ts` | Page d'accueil, navigation principale, liens |
| `e2e/auth.spec.ts` | Inscription, connexion, déconnexion, redirection |
| `e2e/journal.spec.ts` | Créer/lire/modifier/supprimer une entrée journal |
| `e2e/conseils.spec.ts` | Navigation articles, lecture, filtres par catégorie |

### Commandes

```bash
# Lancer tous les tests E2E (Chromium + Firefox + WebKit)
bun run test:e2e

# Un navigateur uniquement (plus rapide)
bun run test:e2e -- --project=chromium
bun run test:e2e -- --project=firefox
bun run test:e2e -- --project=webkit

# Mode UI interactif (interface graphique, très pratique pour déboguer)
bun run test:e2e:ui

# Un fichier spécifique
bun run test:e2e -- e2e/auth.spec.ts

# Un test spécifique par titre
bun run test:e2e -- -g "connexion avec email valide"

# Mode debug (ouvre le navigateur visible, step-by-step)
bun run test:e2e -- --debug e2e/auth.spec.ts

# Afficher le rapport HTML après les tests
npx playwright show-report

# Lancer en headed (navigateur visible, utile pour voir ce qui se passe)
bun run test:e2e -- --headed
```

### Utiliser un serveur existant (évite le re-build)

Si Next.js tourne déjà (`bun run dev` ou `bun run start`) :

```bash
E2E_BASE_URL=http://localhost:3000 bun run test:e2e

# PowerShell
$env:E2E_BASE_URL="http://localhost:3000"; bun run test:e2e
```

### Artefacts en cas d'échec

Playwright génère automatiquement en cas d'échec :
- **Screenshots** → `test-results/*/test-failed-*.png`
- **Vidéos** → `test-results/*/video.webm`
- **Traces** → `test-results/*/trace.zip` (ouvrir avec `npx playwright show-trace`)

```bash
# Ouvrir une trace
npx playwright show-trace test-results/auth-chromium/trace.zip
```

### Exemple de sortie attendue

```
Running 24 tests using 3 workers

  ✓  [chromium] › landing.spec.ts:12:5 › affiche la page d'accueil (1.2s)
  ✓  [chromium] › auth.spec.ts:15:5 › inscription réussie (2.8s)
  ✓  [firefox] › journal.spec.ts:20:5 › créer une entrée (3.1s)
  ...

  24 passed (45s)
```

---

## 8. Tests E2E — Mobile (Maestro)

### Prérequis

- Maestro CLI installé (`maestro --version`)
- Java 11+ (`java --version`)
- Simulateur iOS OU émulateur Android démarré et visible
- Application Expo buildée et installée sur le simulateur

> **Windows :** Maestro ne supporte pas Windows natif. Utiliser WSL2 ou macOS.

### Préparer le simulateur

**iOS (macOS) :**
```bash
# Lister les simulateurs disponibles
xcrun simctl list devices

# Démarrer un simulateur
xcrun simctl boot "iPhone 15"
open -a Simulator

# Builder et installer l'app Expo
cd mobile
npx expo run:ios --simulator "iPhone 15"
```

**Android :**
```bash
# Lister les émulateurs disponibles
emulator -list-avds

# Démarrer l'émulateur
emulator -avd Pixel_API_34 &

# Builder et installer l'app Expo
cd mobile
npx expo run:android
```

### Flows disponibles

| Fichier | Scénario |
|---------|---------|
| `01-register.yaml` | Inscription d'un nouvel utilisateur |
| `02-login.yaml` | Connexion avec un compte existant |
| `03-add-entry.yaml` | Ajout d'une entrée dans le journal émotionnel |
| `04-conseils.yaml` | Navigation dans la section conseils/articles |
| `05-statistiques.yaml` | Consultation des statistiques émotionnelles |
| `06-logout.yaml` | Déconnexion |

### Commandes

```bash
cd mobile

# Valider la syntaxe des flows (sans simulateur, fonctionne en CI)
npm run maestro:lint

# Lancer tous les flows (nécessite simulateur)
npm run maestro:test

# Lancer un flow spécifique
maestro test .maestro/flows/01-register.yaml

# Lancer avec logs détaillés
maestro test --debug .maestro/flows/02-login.yaml

# Voir les flows disponibles
ls .maestro/flows/
```

> **Compte de démo :** Les flows de login utilisent `demo@cesizen.fr` / `Demo1234`.
> Ce compte doit exister dans la base de données ou dans le seed.

---

## 9. Couverture de code

### Web (Vitest)

```bash
# Générer le rapport de couverture (tous les tests)
bun run test:coverage

# Couverture unitaires uniquement
bun run test:unit -- --coverage

# Couverture intégration uniquement
bun run test:integration -- --coverage
```

Le rapport HTML s'ouvre dans : `coverage/index.html`

**Seuils configurés** (doivent être atteints pour que la CI passe) :

| Métrique | Seuil minimal |
|----------|--------------|
| Lignes | 60% |
| Fonctions | 60% |
| Branches | 60% |
| Instructions | 60% |

**Dossiers exclus du calcul :**
- `node_modules/`, `.next/`, `mobile/`, `e2e/`, `tests/`
- `drizzle/`, `scripts/`, fichiers de config
- `app/**/layout.tsx`, `app/**/page.tsx`, `components/ui/**`

### Mobile (Jest)

```bash
cd mobile
npm run test:coverage
```

Le rapport s'ouvre dans : `mobile/coverage/index.html`

**Seuils configurés :**

| Métrique | Seuil minimal |
|----------|--------------|
| Lignes | 40% |
| Fonctions | 40% |
| Branches | 40% |
| Instructions | 40% |

**Fichiers couverts :** `lib/**`, `context/**`, `components/**` (hors `.d.ts`)

---

## 10. Pipeline CI/CD (GitHub Actions)

Le pipeline se déclenche automatiquement à chaque `push` ou `pull_request`.

### Jobs exécutés en parallèle

```
push/PR
  │
  ├── web-quality          (lint + type-check)
  │     ├── web-build      (next build)
  │     │     └── web-e2e  (Playwright — chromium uniquement)
  │     ├── web-unit       (Vitest unitaires)
  │     └── web-integration (Vitest intégration + PostgreSQL)
  │
  ├── mobile-quality       (lint + type-check)
  │     └── mobile-unit    (Jest + coverage)
  │
  └── mobile-maestro-lint  (validation syntaxe Maestro)
```

### Variables injectées en CI

GitHub Actions injecte ces variables directement (pas besoin de `.env.test` en CI) :

| Variable | Valeur CI |
|---------|----------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/cesizen_test` |
| `JWT_SECRET` | `ci-test-secret-key-for-testing-only-32chars-long` |
| `ENCRYPTION_KEY` | `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` |

### Voir les résultats CI

```
GitHub → Onglet "Actions" → Cliquer sur le workflow → Cliquer sur un job
```

**Artefacts disponibles après les tests E2E :**
```
GitHub → Actions → Workflow run → Artifacts → playwright-report (conservé 7 jours)
```

### Déclencher le CI manuellement

```bash
# Via GitHub CLI
gh workflow run CI
gh workflow run CI --ref ma-branche

# Voir l'état des runs
gh run list --workflow=CI
gh run watch
```

---

## 11. Dépannage

### Problème : `connect ECONNREFUSED 127.0.0.1:5432`

La base de données n'est pas démarrée.

```bash
docker compose up -d
docker compose ps  # vérifier que le status est "healthy"
```

Si le conteneur ne démarre pas :
```bash
docker compose logs postgres
# Chercher des erreurs dans les logs
```

---

### Problème : `relation "users" does not exist`

Les migrations n'ont pas été appliquées.

```bash
bun run db:test-setup
```

---

### Problème : `port 5432 already in use`

Un autre PostgreSQL tourne sur ce port (installation locale).

**Option 1 — Arrêter PostgreSQL local :**
```powershell
# Windows
Stop-Service postgresql-x64-16

# macOS
brew services stop postgresql@16
```

**Option 2 — Changer le port Docker :**
Dans `docker-compose.yml`, modifier `"5432:5432"` en `"5433:5432"`, puis dans `.env.test` :
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cesizen_test
```

---

### Problème : `ENCRYPTION_KEY must be 64 hex characters`

La clé de chiffrement n'est pas au bon format. Générer une nouvelle clé :

```bash
# macOS/Linux
openssl rand -hex 32

# Node.js (Windows, macOS, Linux)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier le résultat dans `.env.test` sous `ENCRYPTION_KEY=`.

---

### Problème : Les tests Playwright échouent avec `net::ERR_CONNECTION_REFUSED`

Le serveur Next.js n'a pas démarré correctement.

```bash
# Vérifier que le build Next.js passe
bun run build

# Tenter de démarrer manuellement
bun run start
# Puis dans un autre terminal :
E2E_BASE_URL=http://localhost:3000 bun run test:e2e
```

---

### Problème : Tests d'intégration — données résiduelles entre les runs

Si `resetDb()` n'a pas été appelé ou a planté :

```bash
# Connexion directe à la DB de test
docker exec -it cesizen_db_test psql -U postgres -d cesizen_test

# Dans psql :
TRUNCATE users, entries, articles, emotions, emotion_categories, article_categories RESTART IDENTITY CASCADE;
\q
```

---

### Problème : Jest mobile — `Cannot find module 'expo-router'`

```bash
cd mobile
npm install
```

Si le problème persiste, vider le cache Jest :
```bash
npx jest --clearCache
npm test
```

---

### Problème : Maestro — `No connected devices found`

```bash
# Vérifier les appareils connectés
adb devices          # Android
xcrun simctl list    # iOS

# Démarrer le simulateur
xcrun simctl boot "iPhone 15"
open -a Simulator
```

---

### Réinitialisation complète (nuclear option)

Si tout est cassé, repartir à zéro :

```bash
# 1. Supprimer le conteneur ET les données
docker compose down -v

# 2. Supprimer les dépendances
rm -rf node_modules mobile/node_modules

# 3. Réinstaller
bun install
cd mobile && npm install --no-audit --no-fund && cd ..

# 4. Relancer la DB et la configurer
docker compose up -d
bun run db:test-setup

# 5. Vérifier
bun run test:unit
bun run test:integration
```

---

## 12. Référence rapide

### Setup (une seule fois)

```bash
bun install && cd mobile && npm install --no-audit --no-fund && cd ..
cp .env.test.example .env.test
docker compose up -d
bun run db:test-setup
bun run test:e2e:install
```

### Commandes quotidiennes

```bash
# Démarrer la DB (si pas déjà démarrée)
docker compose up -d

# ─── Web / API ───────────────────────────────────────────────
bun run test:unit               # Unitaires (rapide, ~1s)
bun run test:integration        # Intégration API (requiert DB, ~5s)
bun run test:e2e                # E2E tous navigateurs (~3min)
bun run test:e2e -- --project=chromium  # E2E Chromium uniquement (~1min)
bun run test:e2e:ui             # Mode UI interactif
bun run test:coverage           # Tous les tests + rapport couverture
bun run test                    # Unitaires + intégration (sans E2E)

# ─── Mobile ──────────────────────────────────────────────────
cd mobile
npm test                        # Unitaires Jest
npm run test:coverage           # Unitaires + couverture
npm run maestro:lint            # Valider les flows Maestro (sans simulateur)
npm run maestro:test            # E2E Maestro (nécessite simulateur)
cd ..

# ─── Base de données ─────────────────────────────────────────
docker compose up -d            # Démarrer la DB
docker compose down             # Arrêter (données conservées)
docker compose down -v          # Arrêter + supprimer les données
bun run db:test-setup           # Migrer + seeder
```

### Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin (seedé) | `admin@cesizen.fr` | `Admin123!` |
| Demo (Maestro) | `demo@cesizen.fr` | `Demo1234` |
| Test (créé dynamiquement) | `user-{timestamp}@test.com` | `Password123` |

### Variables d'environnement de référence

| Variable | Rôle | Contrainte |
|---------|------|-----------|
| `DATABASE_URL` | URL PostgreSQL | Format `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Signature des tokens JWT | **Minimum 32 caractères** |
| `ENCRYPTION_KEY` | Chiffrement des notes (AES-256) | **Exactement 64 caractères hex** |
| `NODE_ENV` | Mode d'exécution | `test` pour tous les tests |
| `E2E_BASE_URL` | Serveur cible pour Playwright | Optionnel, défaut : `http://localhost:3000` |
| `CI` | Détecte l'environnement CI | Automatiquement défini par GitHub Actions |
