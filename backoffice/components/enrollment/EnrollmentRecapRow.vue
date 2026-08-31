<template>
  <div class="recap-card__row" :class="{ 'recap-card__row--stack': stack }">
    <dt>{{ label }}</dt>
    <dd><slot>{{ value }}</slot></dd>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value?: string;
    stack?: boolean;
  }>(),
  {
    value: '',
    stack: false,
  },
);
</script>

<style scoped>
.recap-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border-bottom: 1px solid rgb(241 245 249);
  padding: 0.8125rem 1rem;
}

.recap-card__row:last-child {
  border-bottom: none;
}

.recap-card__row dt {
  flex-shrink: 0;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgb(100 116 139);
}

.recap-card__row dd {
  margin: 0;
  min-width: 0;
  text-align: right;
  font-size: 0.8125rem;
  font-weight: 600;
  color: rgb(15 23 42);
  line-height: 1.45;
}

.recap-card__row--stack {
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.recap-card__row--stack dd {
  text-align: right;
}

.recap-card__row dd :deep(.recap-tags) {
  font-weight: 400;
}
</style>
