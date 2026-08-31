<template>
  <section id="approche" class="w-full bg-[#EFF2F7] pb-10 pt-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <RevealSection extra-class="space-y-4" variant="left">
          <MarketingSectionTitle :title="t('home.approach.title')" />
          <p class="text-sm leading-7 text-slate-600">{{ t('home.approach.p1') }}</p>
          <p class="text-sm leading-7 text-slate-600">{{ t('home.approach.p2') }}</p>
          <p class="text-sm leading-7 text-slate-600">{{ t('home.approach.p3') }}</p>
          <p class="text-sm leading-7 text-slate-600">{{ t('home.approach.p4') }}</p>
        </RevealSection>

        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-lg" variant="right" :delay="120">
          <img class="h-full min-h-[260px] w-full object-cover" :src="approachImg" :alt="t('home.approach.imageAlt')" />
        </RevealSection>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import approachFallback from '~/assets/images/notreapproche.png';
const { t } = useI18n();
const { imageSrc } = useLandingImages();
const approachImg = computed(() => imageSrc('approach', approachFallback));
</script>
