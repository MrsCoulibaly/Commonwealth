<template>
  <section id="partenariat" class="w-full bg-[#EFF2F7] py-16 sm:py-20">
    <div class="mx-auto max-w-[1200px] px-6">
      <RevealSection variant="blur">
        <MarketingSectionTitle :title="t('home.partners.title')" />
      </RevealSection>

      <RevealSection extra-class="mt-12 w-full" variant="rise" stagger>
        <div class="grid grid-cols-3 items-center justify-items-center gap-x-3 gap-y-8 sm:grid-cols-6 sm:gap-x-4 sm:gap-y-0">
          <div
            v-for="partner in partners"
            :key="partner.name"
            class="flex h-[88px] w-full max-w-[140px] items-center justify-center sm:h-[110px] sm:max-w-[150px]"
          >
            <img
              class="motion-logo h-full w-full object-contain"
              :src="partner.logo"
              :alt="partner.name"
            />
          </div>
        </div>
      </RevealSection>
    </div>
  </section>
</template>

<script setup lang="ts">
import bmw from '~/assets/images/bmw.png';
import sevenWolves from '~/assets/images/7wolves.png';
import domino from '~/assets/images/domino.png';
import gopro from '~/assets/images/gopro.png';
import north from '~/assets/images/north.png';
import pg from '~/assets/images/pg.png';

const { t } = useI18n();
const { imageList } = useLandingImages();

const defaultPartners = [
  { name: 'BMW', logo: bmw },
  { name: '7 Wolves', logo: sevenWolves },
  { name: "Domino's", logo: domino },
  { name: 'GoPro', logo: gopro },
  { name: 'The North Face', logo: north },
  { name: 'P&G', logo: pg },
];

const partners = computed(() => {
  const logos = imageList(
    'partners',
    defaultPartners.map((p) => p.logo),
  );
  return defaultPartners.map((p, i) => ({
    name: p.name,
    logo: logos[i] ?? p.logo,
  }));
});
</script>
