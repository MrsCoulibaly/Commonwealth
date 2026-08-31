<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div class="flex min-w-0 items-center gap-3 sm:gap-4">
        <NuxtLink
          v-if="backTo"
          :to="backTo"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#216EC2]/20 bg-[#216EC2]/5 px-2.5 py-2 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/10 sm:px-3 sm:text-sm"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ backLabel }}
        </NuxtLink>
        <NuxtLink
          :to="backTo || '/'"
          class="flex min-w-0 items-center gap-3 transition hover:opacity-90"
          :aria-label="backTo ? backLabel : 'Retour à l\'accueil'"
        >
          <img :src="logoUrl" alt="Commonwealth" class="h-12 w-12 shrink-0 object-contain" />
          <div class="min-w-0 leading-tight">
            <div class="text-[15px] font-extrabold tracking-[0.02em] text-slate-900">COMMONWEALTH</div>
            <div class="text-xs text-slate-500">Preschool of Abidjan</div>
          </div>
        </NuxtLink>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <div
          class="inline-flex items-center gap-2 rounded-lg border border-[#216EC2]/15 bg-[#216EC2]/[0.06] px-3 py-2 text-xs font-semibold text-[#216EC2]"
        >
          <svg class="h-4 w-4 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Année {{ schoolYearLabel }}
        </div>
        <div
          v-if="matricule"
          class="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M7 9h4M7 13h10" />
          </svg>
          ID {{ matricule }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png';

withDefaults(
  defineProps<{
    schoolYearLabel: string;
    matricule?: string;
    backTo?: string;
    backLabel?: string;
  }>(),
  {
    backLabel: 'Retour',
  },
);
</script>
