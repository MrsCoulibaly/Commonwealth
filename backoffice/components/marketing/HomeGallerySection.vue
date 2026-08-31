<template>
  <section id="gallery" class="w-full bg-[#EFF2F7] pb-10 pt-2">
    <div class="mx-auto max-w-[1200px] px-6">
      <RevealSection variant="blur">
        <MarketingSectionTitle :title="t('home.gallery.title')" />
      </RevealSection>

      <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-sm sm:row-span-1" variant="pop" :delay="40">
          <img class="h-[220px] w-full object-cover sm:h-[260px]" :src="photo1Src" alt="" />
        </RevealSection>
        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-sm" variant="pop" :delay="110">
          <img class="h-[220px] w-full object-cover sm:h-[260px]" :src="photo2Src" alt="" />
        </RevealSection>
        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-sm" variant="pop" :delay="180">
          <img class="h-[220px] w-full object-cover sm:h-[260px]" :src="photo3Src" alt="" />
        </RevealSection>
        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-sm sm:col-span-2" variant="blur" :delay="250">
          <img class="h-[220px] w-full object-cover sm:h-[280px]" :src="photo4Src" alt="" />
        </RevealSection>
        <RevealSection extra-class="motion-img-wrap overflow-hidden rounded-2xl shadow-sm" variant="pop" :delay="320">
          <img class="h-[220px] w-full object-cover sm:h-[280px]" :src="aproposImg" alt="" />
        </RevealSection>
      </div>

      <RevealSection extra-class="mt-10 flex justify-center" variant="up" :delay="360">
        <button type="button" class="motion-btn motion-btn--orange inline-flex h-11 items-center justify-center rounded-lg bg-brandOrange px-8 text-sm font-semibold text-white">
          {{ t('home.gallery.cta') }}
        </button>
      </RevealSection>
    </div>
  </section>
</template>

<script setup lang="ts">
import photo1 from '~/assets/images/photo1.png';
import photo2 from '~/assets/images/photo2.png';
import photo3 from '~/assets/images/photo3.png';
import photo4 from '~/assets/images/photo4.png';
import aproposFallback from '~/assets/images/apropos.png';

const { t } = useI18n();
const { imageList, imageSrc } = useLandingImages();

const galleryFallback = [photo1, photo2, photo3, photo4, aproposFallback];
const gallery = computed(() => imageList('gallery', galleryFallback));
const photo1Src = computed(() => gallery.value[0] ?? photo1);
const photo2Src = computed(() => gallery.value[1] ?? photo2);
const photo3Src = computed(() => gallery.value[2] ?? photo3);
const photo4Src = computed(() => gallery.value[3] ?? photo4);
const aproposImg = computed(() => gallery.value[4] ?? imageSrc('about', aproposFallback));
</script>
