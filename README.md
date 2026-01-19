# 🌿 CESIZen - Application de Bien-être Mental

Application Web & PWA de santé mentale développée pour le Ministère.

## Fonctionnalités

### Citoyens
- **Journal émotionnel** : Enregistrez vos émotions avec intensité et notes privées
- **Météo du jour** : Visualisez rapidement votre état émotionnel  
- **Calendrier interactif** : Consultez l'historique de vos entrées
- **Graphiques d'évolution** : Analysez vos tendances (Recharts)
- **Notes chiffrées** : AES-256-GCM côté serveur

### Administrateurs
- **CMS Articles** : Créez et gérez des articles de conseils
- **Gestion utilisateurs** : Bannissement (sans accès aux notes)

## Stack Technique

- Next.js 16+ (App Router), TypeScript
- PostgreSQL, Drizzle ORM
- Tailwind CSS v4, Shadcn UI
- Sessions JWT (jose), Recharts, Zod

## Installation

```bash
# 1. Cloner et installer
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Setup base de données
npm run db:setup

# 4. Lancer le serveur
npm run dev
```

## Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cesizen"
JWT_SECRET="votre-cle-secrete-jwt"
ENCRYPTION_KEY="64-caracteres-hex-pour-aes-256"
```

## Scripts

- `npm run dev` : Serveur de développement
- `npm run db:generate` : Générer les migrations
- `npm run db:migrate` : Appliquer les migrations
- `npm run db:seed` : Seed des émotions et admin
- `npm run db:setup` : Setup complet BDD

## Comptes par défaut

Après le seed :
- **Admin** : admin@cesizen.fr / Admin123!

## Licence

© 2025 CESIZen - Ministère de la Santé
