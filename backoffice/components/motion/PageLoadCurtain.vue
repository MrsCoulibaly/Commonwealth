<template>
  <Transition name="curtain-fade">
    <div
      v-if="curtainVisible"
      class="page-curtain"
      :class="{ 'page-curtain--exit': exiting }"
      aria-hidden="true"
      role="presentation"
    >
      <img class="page-curtain__logo" :src="logoUrl" alt="" />
      <span class="page-curtain__label">{{ schoolName }}</span>
      <div class="page-curtain__bar">
        <div class="page-curtain__bar-fill" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png';

const { curtainVisible, ready } = usePageLoadMotion();
const config = useRuntimeConfig();

const schoolName = computed(() => config.public.schoolDisplayName as string);
const exiting = ref(false);

watch(ready, (isReady) => {
  if (!isReady) return;
  exiting.value = true;
  window.setTimeout(() => {
    curtainVisible.value = false;
  }, 680);
});
</script>

<style scoped>
.curtain-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.curtain-fade-leave-to {
  opacity: 0;
}
</style>
