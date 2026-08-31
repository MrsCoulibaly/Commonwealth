<template>
  <i18n-t :keypath="titleKey" tag="h1" class="slide__title" scope="global">
    <template #highlight>
      <strong>{{ t(highlightKey) }}</strong>
    </template>
  </i18n-t>
</template>

<script setup lang="ts">
defineProps<{
  titleKey: string;
  highlightKey: string;
}>();

const { t } = useI18n();
</script>

<style scoped>
.slide__title {
  font-size: clamp(1.75rem, 4vw, 2.65rem);
  font-weight: 800;
  line-height: 1.15;
}

.slide__title :deep(strong) {
  color: #f99b4b;
  font-weight: 800;
}
</style>
