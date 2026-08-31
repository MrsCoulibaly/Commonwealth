<template>
  <section id="ateliers" class="w-full bg-[#EFF2F7] pb-10 pt-2">
    <div class="mx-auto max-w-[1200px] px-6">
      <RevealSection variant="blur">
        <MarketingSectionTitle :title="t('home.workshops.title')" />
        <div class="mt-5 max-w-[720px] space-y-3 text-sm leading-7 text-slate-700">
          <p>{{ t('home.workshops.p1') }}</p>
          <p>{{ t('home.workshops.p2') }}</p>
        </div>
      </RevealSection>

      <div v-if="pending" class="mt-10 text-center text-sm text-slate-500">
        {{ t('home.workshops.loading') }}
      </div>

      <div
        v-else-if="!workshops.length"
        class="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center text-sm font-medium text-slate-500"
      >
        {{ t('home.workshops.empty') }}
      </div>

      <div v-else class="relative mt-10">
        <button
          type="button"
          class="absolute -left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center text-brandBlue sm:flex"
          aria-label="Précédent"
          @click="scroll(-1)"
        >
          <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="2.5">
            <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div ref="track" class="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scrollbar-hide sm:px-8">
          <RevealSection
            v-for="(w, i) in workshops"
            :key="w.id"
            extra-class="w-[min(100%,300px)] shrink-0 snap-start sm:w-[300px]"
            variant="pop"
            :delay="60 + i * 100"
          >
            <article class="motion-card motion-card--tilt flex h-full flex-col rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
              <h3 class="text-[15px] font-bold leading-snug text-slate-900">{{ w.title }}</h3>

              <div class="motion-img-wrap mt-3 overflow-hidden rounded-xl">
                <img class="h-[150px] w-full object-cover" :src="mediaUrl(w.image)" :alt="w.title" />
              </div>

              <p class="mt-3 text-xs leading-5 text-slate-500">{{ w.description }}</p>

              <div class="mt-3 flex flex-wrap gap-2">
                <span class="motion-chip inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#FFF1E8] px-2 py-1 text-[10px] font-medium leading-tight text-[#E87A3A]">
                  <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round" />
                  </svg>
                  {{ w.date }}
                </span>
                <span class="motion-chip inline-flex items-center gap-1.5 rounded-md bg-[#E8F1FB] px-2 py-1 text-[10px] font-medium text-brandBlue">
                  <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  {{ w.time }}
                </span>
                <span class="motion-chip inline-flex items-center gap-1.5 rounded-md bg-[#EAF8EF] px-2 py-1 text-[10px] font-medium text-brandGreen">
                  <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" stroke-linecap="round" />
                  </svg>
                  {{ w.age }}
                </span>
                <span class="motion-chip inline-flex items-center gap-1.5 rounded-md bg-[#F3EBFA] px-2 py-1 text-[10px] font-medium text-brandPurple">
                  <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 3l2.2 2.2L20 4l-1.2 5.8L21 12l-2.2 2.2L20 20l-5.8-1.2L12 21l-2.2-2.2L4 20l1.2-5.8L3 12l2.2-2.2L4 4l5.8 1.2L12 3Z" stroke-linejoin="round" />
                  </svg>
                  {{ w.price }}
                </span>
              </div>

              <NuxtLink
                v-if="(w.placesRemaining ?? 0) > 0"
                class="motion-btn mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brandBlue text-sm font-semibold text-white"
                :to="`/ateliers/${w.id}`"
              >
                {{ t('home.workshops.cta') }}
              </NuxtLink>
              <span
                v-else
                class="mt-4 block"
                title="Plus de places disponibles"
              >
                <button
                  type="button"
                  disabled
                  class="inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-300 text-sm font-semibold text-slate-500"
                >
                  Complet
                </button>
              </span>
            </article>
          </RevealSection>
        </div>

        <button
          type="button"
          class="absolute -right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center text-brandBlue sm:flex"
          aria-label="Suivant"
          @click="scroll(1)"
        >
          <svg viewBox="0 0 24 24" fill="none" class="h-6 w-6" stroke="currentColor" stroke-width="2.5">
            <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type PublicWorkshop = {
  id: string
  title: string
  description: string
  image: string
  date: string
  time: string
  age: string
  price: string
  placesRemaining?: number
}

const { t } = useI18n()
const config = useRuntimeConfig()
const track = ref<HTMLElement | null>(null)

const { data, pending } = await useAsyncData('public-ateliers', () =>
  $fetch<{ items: PublicWorkshop[] }>(`${config.public.apiBase}/public/ateliers`),
)

const workshops = computed(() => data.value?.items ?? [])

function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function scroll(dir: number) {
  track.value?.scrollBy({ left: dir * 320, behavior: 'smooth' })
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
