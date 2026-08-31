<template>
  <section id="apropos" class="relative w-full bg-white py-20">
    <MarketingDotPattern position="bottom-right" />

    <div class="relative mx-auto max-w-[1200px] px-6">
      <RevealSection extra-class="mb-10" variant="blur">
        <MarketingSectionTitle :title="t('home.about.title')" />
      </RevealSection>

      <div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.1fr]">
        <RevealSection extra-class="space-y-5 text-sm leading-7 text-slate-600" variant="left" :delay="80" stagger>
          <p>{{ t('home.about.p1') }}</p>
          <p>{{ t('home.about.p2') }}</p>
          <p>{{ t('home.about.p3') }}</p>
          <p>{{ t('home.about.p4') }}</p>
          <p>{{ t('home.about.p5') }}</p>
        </RevealSection>

        <RevealSection extra-class="motion-img-wrap relative overflow-hidden rounded-2xl shadow-lg" variant="right" :delay="200">
          <img class="h-full min-h-[280px] w-full object-cover" :src="aproposImg" :alt="t('home.about.imageAlt')" />
        </RevealSection>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import aproposFallback from '~/assets/images/apropos.png';
const { t } = useI18n();
const { imageSrc } = useLandingImages();
const aproposImg = computed(() => imageSrc('about', aproposFallback));
</script>
