<template>
  <nav class="space-tabs" aria-label="Sections de l'espace enfant">
    <button
      v-for="tab in tabItems"
      :key="tab.id"
      type="button"
      class="space-tabs__btn"
      :class="{ 'space-tabs__btn--active': activeTab === tab.id }"
      @click="$emit('change', tab.id)"
    >
      <span class="space-tabs__icon" aria-hidden="true">
        <component :is="tab.icon" />
      </span>
      <span>{{ tab.label }}</span>
      <span v-if="tab.badge != null && tab.badge > 0" class="space-tabs__badge">{{ tab.badge }}</span>
      <span
        v-if="activeTab === tab.id"
        class="space-tabs__underline"
        aria-hidden="true"
      />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { h } from 'vue';

import type { ChildSpaceTabId } from './types';

const props = defineProps<{
  activeTab: ChildSpaceTabId;
  carnetCount?: number;
}>();

defineEmits<{
  change: [id: ChildSpaceTabId];
}>();

const iconProfil = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ]);

const iconCarnet = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
    h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' }),
    h('path', { d: 'M8 7h8M8 11h8M8 15h5', 'stroke-linecap': 'round' }),
  ]);

const iconSante = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
    }),
  ]);

const tabItems = computed(() => [
  { id: 'profil' as const, label: 'Profil', icon: iconProfil, badge: null as number | null },
  {
    id: 'carnet' as const,
    label: 'Carnet de suivi',
    icon: iconCarnet,
    badge: props.carnetCount ?? 0,
  },
  { id: 'sante' as const, label: 'Fiche santé', icon: iconSante, badge: null as number | null },
]);
</script>

<style scoped>
.space-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  margin-top: 1.5rem;
}

.space-tabs__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.space-tabs__btn:hover {
  color: #64748b;
}

.space-tabs__btn--active {
  color: #f97316;
}

.space-tabs__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.space-tabs__icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
}

.space-tabs__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #216ec2;
  padding: 0 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.space-tabs__underline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 3px;
  border-radius: 9999px 9999px 0 0;
  background: #f97316;
}
</style>
