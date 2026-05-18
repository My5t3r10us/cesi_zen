# GitHub Actions — CESIZen

## Workflow `ci.yml`

Déclenché à chaque `push` (toutes branches) et chaque `pull_request` vers `master`/`main`.

### Jobs

| Job | Quand | Bloquant ? |
|-----|-------|-----------|
| `web-quality` | Toujours | ✅ |
| `web-build` | Toujours (après `web-quality`) | ✅ |
| `web-unit` | Toujours | ✅ |
| `web-integration` | Toujours | ✅ |
| `web-e2e` | Toujours (après `web-build`) | ✅ |
| `mobile-quality` | Toujours | ✅ |
| `mobile-unit` | Toujours | ⚠ continue-on-error |
| `mobile-maestro-lint` | Toujours | ✅ |
| `mobile-build-android` | Push sur `master` uniquement, si `EXPO_TOKEN` présent | ⚠ optionnel |
| `mobile-build-ios` | Push sur `master` uniquement, si `EXPO_TOKEN` présent | ⚠ optionnel |

### Secrets requis

À configurer dans **Settings → Secrets and variables → Actions** :

| Nom | Usage |
|-----|-------|
| `EXPO_TOKEN` | Builds EAS iOS/Android. Génère-le via `eas login && eas whoami --json` ou sur expo.dev → Account Settings → Access Tokens. |

### Variables d'environnement

Pour les jobs qui ont besoin d'une valeur factice mais pas-secrète :

```yaml
JWT_SECRET: ci-test-secret-key-for-testing-only-32chars-long
ENCRYPTION_KEY: 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cesizen_test
```

> Ces valeurs sont **uniquement** valides pour la CI. La prod utilise des secrets dédiés.

### Service Postgres

Les jobs `web-integration` et `web-e2e` instancient un container Postgres 16 via la directive `services:`, accessible sur `localhost:5432`. Les migrations Drizzle sont appliquées avant chaque suite.

### Reports

- Playwright : artefact `playwright-report/` uploadé pendant 7 jours sur chaque run.
- Coverage Vitest : disponible localement via `bun run test:coverage` (rapport HTML).

## Maintenance

- Augmenter le seuil de coverage : `vitest.config.ts` (web), `mobile/jest.config.js` (mobile).
- Ajouter un browser Playwright : éditer `playwright.config.ts` et le `--project=` du job `web-e2e`.
- Ajouter un flow Maestro : déposer un YAML dans `mobile/.maestro/flows/` (lint automatique en CI).
