<template>
  <footer class="w-full bg-brandBlue text-white">
    <div class="mx-auto w-full max-w-[1200px] px-6 py-10 sm:py-12">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex shrink-0 items-center">
          <img class="h-[72px] w-[72px] rounded-2xl bg-white object-contain p-2" :src="logoImg" alt="Commonwealth" />
        </div>

        <div class="flex flex-1 flex-col gap-6 lg:max-w-[720px] lg:items-end">
          <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-10 sm:gap-y-3">
            <div class="flex items-start gap-3 text-sm text-white">
              <svg viewBox="0 0 24 24" fill="none" class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                <path
                  d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ school.address }}</span>
            </div>

            <a :href="phoneTel" class="flex items-center gap-3 text-sm text-white hover:underline">
              <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5 shrink-0" aria-hidden="true">
                <path
                  d="M6.5 3h3l1.2 5-2 1.6c1.2 2.4 3.1 4.3 5.5 5.5l1.6-2 5 1.2v3c0 1.1-.9 2-2 2C10.6 20.5 3.5 13.4 3.5 4.8c0-1 .9-1.8 2-1.8Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ school.phone }}</span>
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-4 sm:justify-end">
            <span class="text-sm font-medium text-white/90">{{ t('footer.social') }}</span>
            <div class="flex items-center gap-3">
              <a
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                href="https://www.facebook.com/Commonwealth.preschool/about?locale=fr_FR"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.6l.4-3H14V9Z" />
                </svg>
              </a>
              <a
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                href="#"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6.5 9.5H9v9H6.5v-9ZM7.8 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11 9.5h2.4v1.2h.03c.33-.63 1.15-1.3 2.37-1.3 2.53 0 3 1.67 3 3.83v5.25H16.3v-4.66c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.74H11v-9Z" />
                </svg>
              </a>
              <a
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                href="https://www.instagram.com/commonwealth_preschool?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
                href="#"
                aria-label="Google"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
                  <path d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.5c-.9.6-2.04.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.1v2.58A9.99 9.99 0 0 0 12 22Z" />
                  <path d="M6.44 13.93A6 6 0 0 1 6.12 12c0-.67.12-1.32.32-1.93V7.49H3.1A9.99 9.99 0 0 0 2 12c0 1.61.39 3.14 1.1 4.51l3.34-2.58Z" />
                  <path d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.97 14.7 2 12 2A9.99 9.99 0 0 0 3.1 7.49l3.34 2.58C7.22 7.73 9.41 5.98 12 5.98Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-4 border-t border-white/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <nav class="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-semibold tracking-wide text-white">
          <NuxtLink class="hover:opacity-80" to="/">{{ t('footer.navHome').toUpperCase() }}</NuxtLink>
          <NuxtLink class="hover:opacity-80" to="/#apropos">{{ t('footer.navAbout').toUpperCase() }}</NuxtLink>
          <NuxtLink class="hover:opacity-80" to="/#partenariat">{{ t('footer.navPartnerships').toUpperCase() }}</NuxtLink>
          <NuxtLink class="hover:opacity-80" to="/contact">{{ t('footer.navContact').toUpperCase() }}</NuxtLink>
        </nav>

        <div class="text-xs text-white/80">
          Copyright © {{ year }} •
          <a
            href="https://www.mega-sn.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="font-semibold text-white hover:underline"
          >
            MEGA
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import logoImg from '~/assets/images/logo.png';
import { useSchoolContact } from '~/composables/useSchoolContact';
import { phoneToTelHref } from '~/utils/school-contact';

const year = new Date().getFullYear();
const { t } = useI18n();
const school = useSchoolContact();

const phoneTel = computed(() => phoneToTelHref(school.value.phone));
</script>
