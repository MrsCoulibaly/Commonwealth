<template>
  <div class="motion-section-title relative inline-block text-xl font-semibold text-brandBlue sm:text-2xl">
    <slot>{{ title }}</slot>
    <img
      class="motion-section-trait pointer-events-none absolute left-0 top-full mt-2 w-[130px] sm:w-[160px]"
      :src="traitImg"
      alt=""
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import traitImg from '~/assets/images/trait.png';

defineProps<{
  title?: string;
}>();
</script>
