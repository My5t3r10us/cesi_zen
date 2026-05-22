# Guide d'installation CESIZen

Ce guide explique comment installer et lancer CESIZen en local. Le projet contient une application web Next.js et une application mobile Expo.

## Prerequis

- Node.js compatible avec Next.js 16
- npm
- Docker Desktop, pour lancer PostgreSQL localement
- Git
- Optionnel : Expo Go, Android Studio ou Xcode pour tester l'application mobile

## Installation de l'application web

### 1. Recuperer le projet

```bash
git clone <url-du-depot>
cd cesi_zen
```

Si le projet est deja present sur votre machine, placez-vous simplement dans le dossier :

```bash
cd C:\Code\cesi_zen
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Demarrer la base de donnees

Le projet fournit un `docker-compose.yml` avec PostgreSQL.

```bash
docker compose up -d
```

La base locale exposee par Docker est :

```text
postgresql://postgres:postgres@localhost:5432/cesizen_test
```

### 4. Configurer les variables d'environnement

Creer un fichier `.env` a la racine du projet :

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cesizen_test
JWT_SECRET=votre-cle-secrete-jwt-de-32-caracteres-minimum
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

Notes importantes :

- `JWT_SECRET` doit contenir au moins 32 caracteres.
- `ENCRYPTION_KEY` doit contenir exactement 64 caracteres hexadecimaux.
- Le fichier `.env.test.example` peut servir d'exemple pour les valeurs de test.
- Ne pas versionner de vraies valeurs secretes.

### 5. Initialiser la base de donnees

```bash
npm run db:setup
```

Cette commande genere les migrations, les applique, puis insere les donnees de base :

- categories d'emotions
- emotions
- categories d'articles
- compte administrateur par defaut

Compte administrateur cree par le seed :

```text
Email : admin@cesizen.fr
Mot de passe : Admin123!
```

### 6. Lancer le serveur de developpement

```bash
npm run dev
```

L'application web est disponible sur :

```text
http://localhost:3000
```

## Installation de l'application mobile

L'application mobile se trouve dans le dossier `mobile`.

### 1. Installer les dependances mobiles

```bash
cd mobile
npm install
```

### 2. Configurer l'URL de l'API

Creer un fichier `.env` dans `mobile` a partir de `mobile/.env.example` :

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Adapter l'URL selon l'environnement :

- iOS Simulator : `http://localhost:3000`
- Android Emulator : `http://10.0.2.2:3000`
- Appareil physique : `http://<IP_DE_VOTRE_MACHINE>:3000`

### 3. Lancer Expo

```bash
npm run start
```

Commandes utiles :

```bash
npm run android
npm run ios
npm run web
```

## Verification de l'installation

Depuis la racine du projet, lancer :

```bash
npm run check
npm run test
```

Pour les tests end-to-end Playwright :

```bash
npm run test:e2e:install
npm run test:e2e
```

## Commandes utiles

```bash
npm run dev              # demarre le serveur Next.js
npm run build            # genere le build de production
npm run start            # lance le build de production
npm run lint             # lance ESLint
npm run type-check       # verifie TypeScript
npm run check            # lint + type-check
npm run db:generate      # genere les migrations Drizzle
npm run db:migrate       # applique les migrations
npm run db:seed          # insere les donnees de base
npm run db:setup         # setup complet de la base
npm run db:reset-admin   # reinitialise le compte admin
npm run db:check-admin   # verifie le compte admin
```

## Arret et nettoyage

Arreter PostgreSQL sans supprimer les donnees :

```bash
docker compose down
```

Arreter PostgreSQL et supprimer les donnees locales :

```bash
docker compose down -v
```
