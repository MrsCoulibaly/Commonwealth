<template>
  <label class="block">
    <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
      {{ label }}
      <span v-if="required" class="text-[#216EC2]">*</span>
    </span>
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  required?: boolean;
}>();
</script>
