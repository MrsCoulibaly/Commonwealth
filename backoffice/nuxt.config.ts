import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const nuxtPathsShim = join(__dirname, 'shims/nuxt-internal-paths.mjs');
const nitroInternalShim = join(__dirname, 'shims/nuxt-internal-nitro.mjs');

export default defineNuxtConfig({
  compatibilityDate: '2026-04-07',
  devtools: { enabled: true },
  /**
   * Port du serveur de dev Nuxt (les types Vite `vite.server` n’y exposent plus `port` / `strictPort` :
   * ils sont pilotés ici via `devServer`).
   */
  devServer: {
    port: 3000,
    host: 'localhost',
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    lazy: true,
    /** Relatif au dossier `i18n/` (convention du module v9). */
    langDir: 'locales',
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    bundle: {
      optimizeTranslationDirective: false,
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      cookieSecure: false,
      fallbackLocale: 'fr',
    },
  },
  css: ['~/assets/css/tailwind.css', '~/assets/css/motion.css', '~/assets/css/enrollment-form.css'],
  /** Désactivé explicitement : évite l’import virtuel `#app-manifest` côté runtime. */
  experimental: {
    appManifest: false,
  },
  runtimeConfig: {
    public: {
      // API Nest (voir backend `PORT`, défaut 3001 — Nuxt utilise souvent 3000)
      //apiBase: 'http://localhost:3001/api',
      /** Doit inclure `/api` (préfixe global Nest dans `backend-commonwealth/src/main.ts`). */
      apiBase: 'https://backend-commonwealth-mjoj.onrender.com/api',
      /** true = afficher le mot de passe temporaire après création (aligné sur SHOW_TEMP_PASSWORD_ON_USER_CREATE côté API). */
      showTempPasswordOnUserCreate:
        process.env.NUXT_PUBLIC_SHOW_TEMP_PASSWORD_ON_USER_CREATE === 'true' ||
        process.env.SHOW_TEMP_PASSWORD_ON_USER_CREATE === 'true',
      schoolDisplayName: process.env.NUXT_PUBLIC_SCHOOL_DISPLAY_NAME || 'Commonwealth Preschool of Abidjan',
      schoolAddress:
        process.env.NUXT_PUBLIC_SCHOOL_ADDRESS ||
        '19 Rue le Perce-Neige, Riviera 6, Cocody, Abidjan',
      schoolPhone: process.env.NUXT_PUBLIC_SCHOOL_PHONE || '+225 07 11 77 77 01',
      schoolPhoneTel: process.env.NUXT_PUBLIC_SCHOOL_PHONE_TEL || '+2250711777701',
      schoolDirectionEmail:
        process.env.NUXT_PUBLIC_SCHOOL_DIRECTION_EMAIL || 'direction@commonwealth-school.com',
      schoolContactEmail:
        process.env.NUXT_PUBLIC_SCHOOL_CONTACT_EMAIL || 'direction@commonwealth-school.com',
      schoolAdministrationEmail:
        process.env.NUXT_PUBLIC_SCHOOL_ADMINISTRATION_EMAIL || 'direction@commonwealth-school.com',
      schoolEmergencyPhone: process.env.NUXT_PUBLIC_SCHOOL_EMERGENCY_PHONE || '+225 07 11 77 77 01',
      schoolPaymentModes:
        process.env.NUXT_PUBLIC_SCHOOL_PAYMENT_MODES ||
        "Virement bancaire · Wave · Orange Money · Espèces (caisse de l'école)",
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.commonwealth-school.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Commonwealth',
    },
  },
  vite: {
    server: {
      /** Port : voir `devServer.port` ci-dessus. */
      /**
       * Moins de watchers = moins de risque EMFILE sur macOS (sinon Nuxt redémarre en boucle).
       * node_modules est déjà ignoré en pratique ; on explicite les gros dossiers du repo.
       */
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.output/**', '**/dist/**'],
      },
    },
    resolve: {
      alias: {
        // Vite analyse quand même `import("#app-manifest")` dans nuxt/dist ; le stub évite l’erreur en dev.
        '#app-manifest': join(__dirname, 'stubs/app-manifest.mjs'),
        '#internal/nuxt/paths': nuxtPathsShim,
        '#internal/nitro': nitroInternalShim,
      },
    },
  },
  hooks: {
    /**
     * Le build SSR de Nuxt laisse `#internal/nuxt/paths` en `external` Rollup : Node doit alors le résoudre
     * via `package.json#imports`, ce qui casse selon l’environnement. On retire l’external et on garde
     * l’alias Vite pour que le shim soit bundlé dans `.nuxt/dist/server/server.mjs`.
     */
    'vite:extendConfig'(config, { isServer }) {
      if (!isServer) return;

      /** Nuxt passe un `Readonly<ViteConfig>` : `resolve` est typé en lecture seule. */
      const c = config as unknown as UserConfig;
      c.resolve ??= {};
      const alias = c.resolve.alias;
      if (Array.isArray(alias)) {
        alias.push(
          { find: '#internal/nuxt/paths', replacement: nuxtPathsShim },
          { find: '#internal/nitro', replacement: nitroInternalShim },
        );
      } else if (alias && typeof alias === 'object') {
        c.resolve.alias = {
          ...alias,
          '#internal/nuxt/paths': nuxtPathsShim,
          '#internal/nitro': nitroInternalShim,
        };
      } else {
        c.resolve.alias = {
          '#internal/nuxt/paths': nuxtPathsShim,
          '#internal/nitro': nitroInternalShim,
        };
      }

      const external = c.build?.rollupOptions?.external;
      if (Array.isArray(external)) {
        const drop = new Set(['#internal/nuxt/paths', '#internal/nitro', '#internal/nitro/utils']);
        c.build!.rollupOptions!.external = external.filter((e) => {
          if (typeof e === 'string') return !drop.has(e);
          return true;
        });
      }
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Commonwealth',
      titleTemplate: '%s',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Commonwealth Preschool of Abidjan est une école maternelle bilingue (Anglais – Français) qui accueille les enfants de 6 mois à 6 ans.',
        },
        { name: 'theme-color', content: '#216EC2' },
        { name: 'application-name', content: 'Commonwealth' },
        { name: 'apple-mobile-web-app-title', content: 'Commonwealth' },
        { property: 'og:site_name', content: 'Commonwealth' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Commonwealth' },
        {
          property: 'og:description',
          content:
            'Commonwealth Preschool of Abidjan est une école maternelle bilingue (Anglais – Français) qui accueille les enfants de 6 mois à 6 ans.',
        },
        { property: 'og:url', content: 'https://www.commonwealth-school.com/' },
        { property: 'og:image', content: 'https://www.commonwealth-school.com/logo.png' },
        { property: 'og:image:alt', content: 'Commonwealth' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Commonwealth' },
        { name: 'twitter:image', content: 'https://www.commonwealth-school.com/logo.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'shortcut icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
})

