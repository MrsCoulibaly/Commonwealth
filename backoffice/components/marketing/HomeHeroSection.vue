<template>
  <section class="w-full overflow-hidden">
    <div class="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-24 lg:px-0 lg:py-36">
      <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
        <div class="order-1 flex items-center justify-center lg:order-2">
          <div class="animate-hero-bounce motion-float relative isolate w-full max-w-[340px]">
            <img
              class="motion-float-slow pointer-events-none absolute -right-8 -top-8 z-0 h-28 w-28 object-cover sm:-right-12 sm:-top-12 sm:h-36 sm:w-36 lg:-right-16 lg:-top-16 lg:h-40 lg:w-40"
              :src="image5"
              alt=""
              aria-hidden="true"
            />

            <div class="relative z-10 grid grid-cols-2 gap-3">
              <RevealSection
                v-for="(img, i) in heroImages"
                :key="i"
                extra-class="motion-img-wrap overflow-hidden rounded-2xl"
                variant="pop"
                immediate
                :delay="280 + i * 90"
              >
                <img class="h-full w-full object-cover" :src="img" alt="" />
              </RevealSection>
            </div>
          </div>
        </div>

        <div class="order-2 ml-4 sm:ml-8 lg:order-1 lg:ml-0 lg:-ml-20 lg:pl-0">
          <h1 class="leading-[1.05]">
            <span
              class="motion-hero-line motion-hero-line--1 relative inline-block text-[32px] font-extrabold tracking-tight text-brandBlue sm:text-[40px] lg:text-[46px] xl:text-[54px]"
            >
              {{ t('home.hero.title') }}
              <img
                class="motion-trait-draw pointer-events-none absolute left-16 top-full mt-2 w-[140px] sm:left-24 sm:w-[180px] lg:left-32 lg:w-[220px]"
                :src="traitImg"
                alt=""
                aria-hidden="true"
              />
            </span>
            <span
              class="motion-hero-line motion-hero-line--2 mt-6 block text-[28px] font-light tracking-tight text-brandBlue/90 sm:mt-8 sm:text-[36px] lg:text-[42px] xl:text-[50px]"
            >
              {{ t('home.hero.subtitle') }}
            </span>
          </h1>

          <p class="motion-hero-line motion-hero-line--3 mt-6 text-base font-normal text-slate-800 sm:text-lg">
            {{ t('home.hero.tagline') }}
          </p>

          <RevealSection class="mt-10" variant="blur" immediate :delay="520">
            <div class="flex flex-wrap items-center gap-3">
              <NuxtLink
                class="motion-btn motion-btn--orange inline-flex h-10 items-center justify-center rounded-md bg-brandOrange px-6 text-sm font-semibold text-white shadow-sm"
                to="/inscription"
              >
                {{ t('home.hero.cta') }}
              </NuxtLink>
              <NuxtLink
                class="motion-btn motion-btn--ghost inline-flex h-10 items-center justify-center rounded-md border border-brandBlue bg-white px-6 text-sm font-semibold text-brandBlue shadow-sm"
                to="/parent"
              >
                {{ t('home.hero.parentSpace') }}
              </NuxtLink>
            </div>
          </RevealSection>

          <div class="mt-12 flex items-center gap-3">
            <span class="motion-dot-pulse h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
            <span class="motion-dot-pulse h-2 w-2 rounded-full bg-brandBlue" aria-hidden="true" />
            <span class="motion-dot-pulse h-2 w-2 rounded-full bg-slate-200" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import image1 from '~/assets/images/image1.png';
import image2 from '~/assets/images/image2.png';
import image3 from '~/assets/images/image3.png';
import image4 from '~/assets/images/image4.png';
import image5 from '~/assets/images/image5.jpg';
import traitImg from '~/assets/images/trait.png';

const { t } = useI18n();
const heroImages = [image1, image2, image3, image4];
</script>

<style scoped>
@keyframes hero-bounce {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  38% {
    transform: translate3d(0, -18px, 0);
  }
  54% {
    transform: translate3d(0, -10px, 0);
  }
  68% {
    transform: translate3d(0, -4px, 0);
  }
  82% {
    transform: translate3d(0, -1px, 0);
  }
}

.animate-hero-bounce {
  animation: hero-bounce 2.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .animate-hero-bounce {
    animation: none;
  }
}
</style>
