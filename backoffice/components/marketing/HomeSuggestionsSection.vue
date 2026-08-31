<template>
  <section id="suggestions" class="w-full bg-white">
    <div class="mx-auto grid max-w-[1200px] grid-cols-1 items-center lg:grid-cols-2">
      <RevealSection extra-class="motion-img-wrap h-[220px] overflow-hidden lg:h-[280px]" variant="left">
        <img
          class="h-full w-full object-cover"
          :src="suggestionImg"
          :alt="t('home.suggestions.imageAlt')"
        />
      </RevealSection>

      <RevealSection
        extra-class="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10"
        variant="rise"
        :delay="120"
      >
        <MarketingSectionTitle :title="t('home.suggestions.title')" />
        <p class="mt-2 max-w-[420px] text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
          {{ t('home.suggestions.body') }}
        </p>

        <form class="mt-3 flex w-full max-w-[480px] flex-col gap-2 sm:flex-row sm:items-center" @submit.prevent="onSubmit">
          <input
            v-model="message"
            type="text"
            required
            class="h-9 flex-1 rounded-lg border border-brandBlue/40 bg-white px-3 text-sm text-slate-700 outline-none ring-brandBlue/20 placeholder:text-slate-400 focus:border-brandBlue focus:ring-2"
            :placeholder="t('home.suggestions.placeholder')"
          />
          <button
            type="submit"
            class="motion-btn motion-btn--orange inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-brandOrange px-5 text-sm font-semibold text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
              <path
                d="M3.5 11.5 20 4l-5.5 16-2.8-6.2L3.5 11.5Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
            {{ t('home.suggestions.cta') }}
          </button>
        </form>
        <p v-if="sent" class="mt-2 text-xs font-medium text-brandGreen">{{ t('home.suggestions.success') }}</p>
      </RevealSection>
    </div>
  </section>
</template>

<script setup lang="ts">
import suggestionFallback from '~/assets/images/suggestion.png';

const { t } = useI18n();
const { imageSrc } = useLandingImages();
const suggestionImg = computed(() => imageSrc('suggestions', suggestionFallback));
const message = ref('');
const sent = ref(false);

function onSubmit() {
  sent.value = true;
  message.value = '';
}
</script>
