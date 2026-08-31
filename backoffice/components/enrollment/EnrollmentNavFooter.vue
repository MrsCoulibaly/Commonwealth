<template>
  <div>
    <p
      v-if="error"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ error }}
    </p>
    <div class="flex items-center justify-between gap-4 pt-1">
      <button
        type="button"
        class="inline-flex h-10 min-w-[120px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
        :disabled="currentStep === 1 || submitting"
        @click="$emit('prev')"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Précédent
      </button>

      <p class="shrink-0 text-sm font-medium text-slate-400">Étape {{ currentStep }} sur 5</p>

      <button
        v-if="currentStep < 5"
        type="button"
        class="inline-flex h-10 min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-[#216EC2] px-5 text-sm font-semibold text-white transition hover:bg-[#1a5da3] disabled:opacity-60"
        :disabled="submitting"
        @click="$emit('next')"
      >
        {{ submitting ? 'Enregistrement…' : 'Suivant' }}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button
        v-else
        type="button"
        class="inline-flex h-10 min-w-[168px] items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
        @click="$emit('submit')"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ submitting ? 'Envoi…' : 'Valider l’inscription' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrollmentStepId } from '~/composables/useEnrollmentWizard';

defineProps<{
  currentStep: EnrollmentStepId;
  submitting?: boolean;
  error?: string;
}>();

defineEmits<{
  prev: [];
  next: [];
  submit: [];
}>();
</script>
