<template>
  <div class="w-full bg-white" :class="{ 'page-motion-enter': pageReady, 'page-motion-ready': pageReady }">
    <MotionPageLoadCurtain />

    <MarketingHomeHeroSection />
    <div class="h-4 w-full bg-[#EFF2F7] sm:h-5" aria-hidden="true" />
    <MarketingHomeRentreeSection />
    <div class="h-4 w-full bg-[#EFF2F7] sm:h-5" aria-hidden="true" />
    <MarketingHomeAboutSection />
    <MarketingHomeApproachSection />
    <MarketingHomeValuesSection />
    <MarketingHomeWorkshopsSection />
    <MarketingHomeGallerySection />
    <MarketingHomePartnersSection />
    <MarketingHomeSuggestionsSection />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'marketing' });

const { t } = useI18n();
const { ready: pageReady } = usePageLoadMotion();
const config = useRuntimeConfig();
const siteUrl = String(config.public.siteUrl || 'https://www.commonwealth-school.com').replace(/\/$/, '');

await loadLandingContent();

const pageTitle = computed(() => t('meta.homeTitle'));
const pageDescription = computed(() => t('meta.homeDescription'));

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: `${siteUrl}/`,
  ogImage: `${siteUrl}/logo.png`,
  ogImageAlt: 'Commonwealth',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: `${siteUrl}/logo.png`,
});

useHead({
  title: pageTitle,
  link: [{ rel: 'canonical', href: `${siteUrl}/` }],
});
</script>
