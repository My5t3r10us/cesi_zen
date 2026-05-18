# Tests E2E Maestro — Mobile CESIZen

## Pré-requis

```bash
# macOS / Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows (via WSL ou via Scoop)
scoop install maestro
```

## Lancer un simulateur

```bash
# iOS
xcrun simctl boot "iPhone 15"
# Android
emulator -avd Pixel_API_34
```

## Installer l'app de dev

```bash
cd mobile
bunx expo run:ios       # ou run:android
```

## Lancer un flow

```bash
maestro test mobile/.maestro/flows/01-register.yaml
```

## Lancer toute la suite

```bash
maestro test mobile/.maestro/flows/
```

## Lint en CI

```bash
maestro test --lint mobile/.maestro/flows/
```

## Variables / Données

- Le flow `02-login.yaml` utilise un compte `demo@cesizen.fr / Demo1234`. Crée-le manuellement la première fois ou seed-le depuis l'API.
- `01-register.yaml` génère un email unique via `${output.timestamp}` à chaque exécution.
