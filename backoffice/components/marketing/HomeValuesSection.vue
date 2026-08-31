<template>
  <section id="values" class="w-full bg-[#EFF2F7] pb-10 pt-2">
    <div class="mx-auto max-w-[1200px] px-6">
      <RevealSection variant="blur">
        <MarketingSectionTitle :title="t('home.values.title')" />
        <p class="mt-4 max-w-[720px] text-sm leading-7 text-slate-600">{{ t('home.values.intro') }}</p>
      </RevealSection>

      <div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <RevealSection
          v-for="(card, i) in cards"
          :key="card.id"
          variant="pop"
          :delay="60 + i * 110"
        >
          <article
            class="motion-card motion-card--tilt flex h-full flex-col rounded-2xl p-6 shadow-sm"
            :class="card.highlight ? 'bg-brandBlue text-white' : 'border border-slate-200 bg-white'"
          >
            <div
              class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
              :class="card.highlight ? 'bg-white/15' : 'bg-brandBlue/10 text-brandBlue'"
            >
              <component :is="card.icon" class="h-6 w-6" :class="card.highlight ? 'text-white' : ''" />
            </div>
            <h3 class="text-base font-bold">{{ card.title }}</h3>
            <p class="mt-2 flex-1 text-sm leading-6" :class="card.highlight ? 'text-white/85' : 'text-slate-500'">
              {{ card.body }}
            </p>
          </article>
        </RevealSection>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FunctionalComponent } from 'vue';

const { t } = useI18n();

const IconShare: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '18', cy: '5', r: '3' }),
    h('circle', { cx: '6', cy: '12', r: '3' }),
    h('circle', { cx: '18', cy: '19', r: '3' }),
    h('path', { d: 'm8.6 13.5 6.8 3.9M8.6 10.5l6.8-3.9' }),
  ]);

const IconCuriosity: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '11', cy: '11', r: '7' }),
    h('path', { d: 'm21 21-4.3-4.3', 'stroke-linecap': 'round' }),
  ]);

const IconCollab: FunctionalComponent = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M16 11c1.7 0 3-1.3 3-3S17.7 5 16 5s-3 1.3-3 3 1.3 3 3 3Z' }),
    h('path', { d: 'M8 13c1.7 0 3-1.3 3-3S9.7 7 8 7 5 8.3 5 10s1.3 3 3 3Z' }),
    h('path', { d: 'M3 20c0-2.8 2.2-5 5-5M16 15c2.8 0 5 2.2 5 5', 'stroke-linecap': 'round' }),
  ]);

const cards = computed(() => [
  {
    id: 'share',
    title: t('home.values.shareTitle'),
    body: t('home.values.shareBody'),
    highlight: false,
    icon: IconShare,
  },
  {
    id: 'curiosity',
    title: t('home.values.curiosityTitle'),
    body: t('home.values.curiosityBody'),
    highlight: true,
    icon: IconCuriosity,
  },
  {
    id: 'collab',
    title: t('home.values.collabTitle'),
    body: t('home.values.collabBody'),
    highlight: false,
    icon: IconCollab,
  },
]);
</script>
