# Gestion scolaire (Front-end Nuxt)

Ce dépôt contient **uniquement le front-end** du projet "Gestion scolaire", développé avec **Nuxt 3**.

## Architecture

- **Site vitrine**: routes sous `pages/` (ex: `/`, `/about`)
- **Backoffice**: routes sous `pages/backoffice/` (ex: `/backoffice`, `/backoffice/login`)
- **Layouts**
  - `layouts/default.vue`: vitrine
  - `layouts/backoffice.vue`: backoffice (sidebar + contenu)
- **Auth (mock)**
  - `composables/useAuth.ts`: état auth front-only
  - `middleware/backoffice.ts`: protège `/backoffice/*` (sauf `/backoffice/login`)

## Démarrer

```bash
npm install
npm run dev
```

Le serveur de dev est configuré pour **http://localhost:3000/** (port fixe). Si le démarrage échoue avec « port already in use », libérez le port :

```bash
lsof -ti :3000 | xargs kill -9
```

Si la page « clignote » ou le terminal affiche **Restarting Nuxt** en boucle avec **`EMFILE: too many open files, watch`**, c’est la limite de fichiers ouverts du système. Avant `npm run dev`, dans **le même terminal** :

```bash
ulimit -n 10240
npm run dev
```

Sur macOS vous pouvez aussi augmenter la limite de façon durable (recherche : `launchctl limit maxfiles`). Fermez les autres instances de `nuxt dev` pour libérer des descripteurs.

## Production (important)

Après `npm run build`, le serveur Node à lancer est **celui généré par Nitro**, pas le fichier dans `.nuxt/dist/` :

```bash
npm run build
npm start
# équivalent : node .output/server/index.mjs
```

Ne pas exécuter `node .nuxt/dist/server/server.mjs` : cela provoque l’erreur `#internal/nuxt/paths` (imports internes non résolus hors pipeline Nuxt).

## Notes

- Le backoffice est volontairement "front-only" pour l’instant. Plus tard, on branchera une API (auth réelle, CRUD élèves/classes, etc.).

