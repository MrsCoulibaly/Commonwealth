<template>
  <div class="mb-4 flex items-center gap-3">
    <h3 class="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">{{ title }}</h3>
    <span class="h-px flex-1 bg-slate-200" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
