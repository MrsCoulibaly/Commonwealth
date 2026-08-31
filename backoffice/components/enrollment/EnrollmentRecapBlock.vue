<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">{{ title }}</h3>
      <button
        type="button"
        class="text-xs font-semibold text-[#216EC2] hover:underline"
        @click="$emit('edit')"
      >
        Modifier
      </button>
    </div>
    <div class="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
      <dl class="grid gap-2.5 sm:grid-cols-2">
        <div v-for="row in rows" :key="row.label" :class="row.full ? 'sm:col-span-2' : ''">
          <dt class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{{ row.label }}</dt>
          <dd class="mt-0.5 text-sm font-medium text-slate-800">{{ row.value || '—' }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrollmentRecapRow } from '~/composables/useEnrollmentWizard';

export type { EnrollmentRecapRow as RecapRow };

defineProps<{
  title: string;
  rows: EnrollmentRecapRow[];
}>();

defineEmits<{
  edit: [];
}>();
</script>
