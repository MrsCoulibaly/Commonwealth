<template>
  <section id="rentree" class="relative w-full bg-white py-20">
    <MarketingDotPattern position="top-right" />

    <div class="relative mx-auto w-full max-w-[1200px] px-6">
      <RevealSection variant="blur">
        <MarketingSectionTitle>
          {{ t('home.rentree.title', { year: schoolYearDisplay }) }}
        </MarketingSectionTitle>
      </RevealSection>

      <RevealSection extra-class="mt-5 max-w-[720px] text-sm leading-6 text-slate-600" variant="blur" :delay="70">
        <p>{{ t('home.rentree.intro') }}</p>
      </RevealSection>

      <div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        <RevealSection v-for="(level, i) in levels" :key="level.id" variant="pop" :delay="80 + i * 100">
          <article class="motion-card motion-card--tilt flex overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(2,6,23,0.1)]" :class="level.bgClass">
            <div class="motion-img-wrap w-[38%] shrink-0 sm:w-[34%]">
              <img class="h-full min-h-[200px] w-full object-cover" :src="level.image" :alt="level.imageAlt" />
            </div>
            <div class="flex flex-1 flex-col p-4 text-white sm:p-5">
              <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20" aria-hidden="true">
                <component :is="level.icon" class="h-5 w-5 text-white" />
              </div>
              <h3 class="text-xs font-bold uppercase tracking-wide sm:text-sm">{{ level.title }}</h3>
              <p class="mt-2 flex-1 text-xs leading-5 text-white/90 sm:text-[13px]">{{ level.description }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold">{{ level.status }}</span>
              </div>
              <NuxtLink
                class="motion-btn mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-white/80 px-3 text-xs font-semibold text-white hover:bg-white/10 sm:text-sm"
                to="/inscription"
              >
                {{ t('home.rentree.cardCta') }}
              </NuxtLink>
            </div>
          </article>
        </RevealSection>
      </div>

      <RevealSection extra-class="mt-6" variant="blur" :delay="450">
        <div class="motion-card grid grid-cols-1 gap-4 rounded-2xl bg-[#F4F8FC] px-5 py-5 sm:grid-cols-3 sm:gap-6 sm:px-8">
          <div v-for="(feature, i) in features" :key="feature.id" class="flex items-center gap-3" :class="i > 0 ? 'sm:border-l sm:border-slate-200 sm:pl-6' : ''">
            <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" :class="feature.iconBg" aria-hidden="true">
              <component :is="feature.icon" class="h-5 w-5" :class="feature.iconColor" />
            </div>
            <div>
              <div class="text-sm font-semibold" :class="feature.titleColor">{{ feature.title }}</div>
              <div class="text-xs text-slate-500">{{ feature.subtitle }}</div>
            </div>
          </div>
        </div>
      </RevealSection>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from 'vue';
import cardImg from '~/assets/images/photo1.png';
import { currentSchoolYear, formatSchoolYearLabel } from '~/composables/useEnrollmentWizard';

const { t } = useI18n();
const { rentreeImage } = useLandingImages();
const config = useRuntimeConfig();

const { data: activeYear } = await useAsyncData('public-active-school-year', () =>
  $fetch<{ active: { label: string } | null }>(`${config.public.apiBase}/public/catalog/school-year/active`).catch(
    () => ({ active: null }),
  ),
);

const schoolYearDisplay = computed(() => {
  const label = activeYear.value?.active?.label?.trim() || currentSchoolYear();
  return formatSchoolYearLabel(label).replace('–', ' ');
});

const IconBaby: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '8', r: '4' }),
    h('path', { d: 'M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6' }),
  ]);

const IconChild: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 3c-2 3-6 4-6 9a6 6 0 0 0 12 0c0-5-4-6-6-9Z' }),
  ]);

const IconShield: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 21s7-4.6 7-11V6l-7-3-7 3v4c0 6.4 7 11 7 11Z' }),
  ]);

const IconMeal: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 11h16v10H4V11Z' }),
    h('path', { d: 'M8 11V5M12 11V3M16 11V7' }),
  ]);

const IconStar: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3Z' }),
  ]);

const levels = computed(() => [
  { id: 'enfants', key: 'enfants' as const, bgClass: 'bg-brandBlue', icon: IconBaby },
  { id: 'petits', key: 'petits' as const, bgClass: 'bg-brandGreen', icon: IconChild },
  { id: 'moyens', key: 'moyens' as const, bgClass: 'bg-brandOrange', icon: IconChild },
  { id: 'grands', key: 'grands' as const, bgClass: 'bg-brandPurple', icon: IconChild },
].map((l) => ({
  ...l,
  image: rentreeImage(l.key, cardImg),
  title: t(`home.rentree.levels.${l.key}.title`),
  description: t(`home.rentree.levels.${l.key}.body`),
  status: t(`home.rentree.levels.${l.key}.status`),
  imageAlt: t(`home.rentree.levels.${l.key}.imageAlt`),
})));

const features = computed(() => [
  { id: 'safe', title: t('home.rentree.features.safe.title'), subtitle: t('home.rentree.features.safe.subtitle'), iconBg: 'bg-brandBlue/10', iconColor: 'text-brandBlue', titleColor: 'text-brandBlue', icon: IconShield },
  { id: 'meal', title: t('home.rentree.features.meal.title'), subtitle: t('home.rentree.features.meal.subtitle'), iconBg: 'bg-brandGreen/10', iconColor: 'text-brandGreen', titleColor: 'text-brandGreen', icon: IconMeal },
  { id: 'quality', title: t('home.rentree.features.quality.title'), subtitle: t('home.rentree.features.quality.subtitle'), iconBg: 'bg-brandOrange/10', iconColor: 'text-brandOrange', titleColor: 'text-brandOrange', icon: IconStar },
]);
</script>
