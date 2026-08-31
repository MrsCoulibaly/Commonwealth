<template>
  <header class="w-full border-b border-slate-200 bg-white">
    <div
      class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:px-8 xl:gap-10 xl:px-10"
    >
      <NuxtLink class="flex shrink-0 items-center gap-2.5" to="/" aria-label="Commonwealth">
        <img class="h-11 w-auto object-contain sm:h-14 xl:h-16" :src="logoUrl" alt="Commonwealth" width="89" height="75" />
        <span class="text-[15px] font-extrabold tracking-tight text-brandBlue sm:text-base">Commonwealth</span>
      </NuxtLink>

      <nav class="hidden min-w-0 flex-nowrap items-center justify-center gap-4 lg:flex xl:gap-7" :aria-label="t('header.navAria')">
        <NuxtLink class="whitespace-nowrap px-2 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 xl:px-3 xl:py-2.5 xl:text-[13px]" to="/">{{ t('header.home') }}</NuxtLink>
        <NuxtLink class="whitespace-nowrap px-2 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 xl:px-3 xl:py-2.5 xl:text-[13px]" to="/#apropos">{{ t('header.about') }}</NuxtLink>
        <NuxtLink class="whitespace-nowrap px-2 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 xl:px-3 xl:py-2.5 xl:text-[13px]" to="/#values">{{ t('header.values') }}</NuxtLink>
        <NuxtLink class="whitespace-nowrap px-2 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 xl:px-3 xl:py-2.5 xl:text-[13px]" to="/#ateliers">{{ t('header.workshops') }}</NuxtLink>
        <NuxtLink class="whitespace-nowrap px-2 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 xl:px-3 xl:py-2.5 xl:text-[13px]" to="/#partenariat">{{ t('header.partnership') }}</NuxtLink>
      </nav>

      <div class="hidden shrink-0 flex-nowrap items-center justify-end gap-2 lg:flex xl:gap-3">
        <NuxtLink
          class="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-brandOrange bg-brandOrange px-3 text-xs font-semibold text-white xl:px-4 xl:text-sm"
          to="/inscription"
          >{{ t('header.register') }}</NuxtLink
        >
        <NuxtLink
          class="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-brandBlue bg-brandBlue px-3 text-xs font-semibold text-white xl:px-4 xl:text-sm"
          to="/contact"
          >{{ t('header.contact') }}</NuxtLink
        >
        <NuxtLink
          class="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-brandBlue bg-white px-3 text-xs font-semibold text-brandBlue xl:px-4 xl:text-sm"
          to="/parent"
          >{{ t('header.parentSpace') }}</NuxtLink
        >
        <button
          class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brandBlue bg-brandBlue text-white transition hover:brightness-110"
          type="button"
          :aria-label="langButtonLabel"
          @click="toggleLocale"
        >
          <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
            <path
              d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
              stroke="currentColor"
              stroke-width="2"
            />
            <path d="M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path
              d="M12 2c2.8 2.7 4.4 6.3 4.4 10S14.8 19.3 12 22c-2.8-2.7-4.4-6.3-4.4-10S9.2 4.7 12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="button"
        class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 lg:hidden"
        :aria-expanded="menuOpen"
        :aria-controls="mobileMenuId"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" class="h-6 w-6" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" class="h-6 w-6" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Menu mobile -->
    <div
      v-show="menuOpen"
      :id="mobileMenuId"
      class="border-t border-slate-200 bg-white lg:hidden"
    >
      <nav class="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-5" :aria-label="t('header.navAria')">
        <NuxtLink
          class="rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50"
          to="/"
          @click="closeMenu"
          >{{ t('header.home') }}</NuxtLink
        >
        <NuxtLink
          class="rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50"
          to="/#apropos"
          @click="closeMenu"
          >{{ t('header.about') }}</NuxtLink
        >
        <NuxtLink class="rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50" to="/#values" @click="closeMenu">{{ t('header.values') }}</NuxtLink>
        <NuxtLink class="rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50" to="/#ateliers" @click="closeMenu">{{ t('header.workshops') }}</NuxtLink>
        <NuxtLink
          class="rounded-lg px-4 py-3.5 text-base font-medium text-slate-700 hover:bg-slate-50"
          to="/#partenariat"
          @click="closeMenu"
          >{{ t('header.partnership') }}</NuxtLink
        >
      </nav>
      <div class="mx-auto flex max-w-[1200px] flex-col gap-3 border-t border-slate-100 px-5 pb-7 pt-5">
        <NuxtLink
          class="inline-flex h-11 items-center justify-center rounded-lg border border-brandOrange bg-brandOrange text-sm font-semibold text-white"
          to="/inscription"
          @click="closeMenu"
          >{{ t('header.register') }}</NuxtLink
        >
        <NuxtLink
          class="inline-flex h-11 items-center justify-center rounded-lg border border-brandBlue bg-brandBlue text-sm font-semibold text-white"
          to="/contact"
          @click="closeMenu"
          >{{ t('header.contact') }}</NuxtLink
        >
        <NuxtLink
          class="inline-flex h-11 items-center justify-center rounded-lg border border-brandBlue bg-white text-sm font-semibold text-brandBlue"
          to="/parent"
          @click="closeMenu"
          >{{ t('header.parentSpace') }}</NuxtLink
        >
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-brandBlue bg-brandBlue text-sm font-semibold text-white"
          :aria-label="langButtonLabel"
          @click="onMobileLang"
        >
          <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0" aria-hidden="true">
            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="2" />
            <path d="M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path
              d="M12 2c2.8 2.7 4.4 6.3 4.4 10S14.8 19.3 12 22c-2.8-2.7-4.4-6.3-4.4-10S9.2 4.7 12 2Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
          </svg>
          {{ locale === 'fr' ? 'English' : 'Français' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png';

const { locale, setLocale, t } = useI18n();
const route = useRoute();

const menuOpen = ref(false);
const mobileMenuId = 'site-header-mobile-menu';

const langButtonLabel = computed(() => (locale.value === 'fr' ? t('header.langToEn') : t('header.langToFr')));

function closeMenu() {
  menuOpen.value = false;
}

function toggleLocale() {
  setLocale(locale.value === 'fr' ? 'en' : 'fr');
}

function onMobileLang() {
  toggleLocale();
  closeMenu();
}

watch(
  () => route.fullPath,
  () => {
    closeMenu();
  },
);
</script>
