<template>
  <div class="mb-4 flex items-center gap-2.5">
    <span class="h-4 w-1 shrink-0 rounded-full" :class="accentClass" />
    <h3 class="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700">{{ title }}</h3>
    <span v-if="optional" class="text-[10px] font-medium normal-case tracking-normal text-slate-400">(facultatif)</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  tone?: 'blue' | 'amber' | 'rose';
  optional?: boolean;
}>();

const accentClass = computed(() => {
  if (props.tone === 'amber') return 'bg-amber-400';
  if (props.tone === 'rose') return 'bg-rose-400';
  return 'bg-[#216EC2]';
});
</script>
