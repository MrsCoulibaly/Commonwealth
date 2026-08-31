<template>
  <div class="profil-tab">
    <section class="profil-card">
      <header class="profil-card__head">
        <span class="profil-card__head-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 16v-4M12 8h.01" stroke-linecap="round" />
          </svg>
        </span>
        <h2 class="profil-card__title">Informations de l'enfant</h2>
      </header>

      <div class="info-grid">
        <div
          v-for="field in infoRowTop"
          :key="field.label"
          class="info-tile"
        >
          <span class="info-tile__icon" aria-hidden="true">
            <component :is="field.icon" />
          </span>
          <div class="info-tile__text">
            <p class="info-tile__label">{{ field.label }}</p>
            <p class="info-tile__value">{{ field.value }}</p>
          </div>
        </div>

        <div class="info-tile info-tile--enrollment">
          <span class="info-tile__icon" aria-hidden="true">
            <component :is="iconCheck" />
          </span>
          <div class="info-tile__text">
            <p class="info-tile__label">Date d'inscription</p>
            <p class="info-tile__value">{{ enrollment?.enrollmentDateDisplay || '—' }}</p>
          </div>
        </div>

        <div class="info-tile">
          <span class="info-tile__icon" aria-hidden="true">
            <component :is="iconTablet" />
          </span>
          <div class="info-tile__text">
            <p class="info-tile__label">Année scolaire</p>
            <p class="info-tile__value">{{ enrollment?.schoolYear || '—' }}</p>
          </div>
        </div>

        <div class="info-tile info-tile--address">
          <span class="info-tile__icon" aria-hidden="true">
            <component :is="iconPin" />
          </span>
          <div class="info-tile__text">
            <p class="info-tile__label">Adresse</p>
            <p class="info-tile__value">{{ child.address || '—' }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="profil-bottom">
      <section class="profil-card">
        <header class="profil-card__head">
          <span class="profil-card__head-icon profil-card__head-icon--heart" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <h2 class="profil-card__title">Allergies &amp; santé</h2>
        </header>

        <div v-if="child.allergies.length" class="allergy-tags">
          <span v-for="tag in child.allergies" :key="tag" class="allergy-tag">
            <svg class="allergy-tag__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" stroke-linecap="round" />
            </svg>
            {{ tag }}
          </span>
        </div>
        <p v-else class="profil-empty">Aucune allergie signalée.</p>

        <p v-if="healthNote" class="health-note">{{ healthNote }}</p>
      </section>

      <section class="profil-card">
        <header class="profil-card__head">
          <span class="profil-card__head-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <h2 class="profil-card__title">Parent / Tuteur</h2>
        </header>

        <div v-if="parent" class="parent-list">
          <div v-for="row in parentRows" :key="row.label" class="parent-row">
            <span class="parent-row__icon" aria-hidden="true">
              <component :is="row.icon" />
            </span>
            <div class="parent-row__text">
              <p class="parent-row__label">{{ row.label }}</p>
              <p class="parent-row__value">{{ row.value }}</p>
            </div>
          </div>
        </div>
        <p v-else class="profil-empty">Informations parent indisponibles.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { ChildSpaceChild, ChildSpaceEnrollment, ChildSpaceParent } from './types';

const props = defineProps<{
  child: ChildSpaceChild;
  enrollment: ChildSpaceEnrollment | null;
  parent: ChildSpaceParent | null;
  healthInstructions?: string | null;
}>();

const iconCalendar = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
    h('path', { d: 'M16 2v4M8 2v4M3 10h18' }),
  ]);
const iconUser = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ]);
const iconGrad = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M22 10v6M2 10l10-5 10 5-10 5z' }),
    h('path', { d: 'M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5' }),
  ]);
const iconClass = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
    h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
  ]);
const iconTablet = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2' }),
    h('path', { d: 'M12 18h.01' }),
  ]);
const iconCheck = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '9' }),
    h('path', { d: 'm9 12 2 2 4-4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ]);
const iconPin = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
    h('circle', { cx: '12', cy: '10', r: '3' }),
  ]);
const iconMail = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }),
    h('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }),
  ]);
const iconPhone = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    }),
  ]);

const infoRowTop = computed(() => [
  { label: 'Date de naissance', value: props.child.birthDisplay, icon: iconCalendar },
  { label: 'Genre', value: props.child.genderLabel, icon: iconUser },
  { label: 'Niveau', value: props.enrollment?.levelName || '—', icon: iconGrad },
  { label: 'Classe', value: props.enrollment?.className || '—', icon: iconClass },
]);

const parentRows = computed(() => {
  const p = props.parent;
  if (!p) return [];
  const rows: { label: string; value: string; icon: () => ReturnType<typeof h> }[] = [];
  if (p.relationLabel || p.fullName) {
    rows.push({
      label: p.relationLabel || 'Parent',
      value: p.fullName || '—',
      icon: iconUser,
    });
  }
  rows.push({ label: 'E-mail', value: p.email, icon: iconMail });
  if (p.phone) rows.push({ label: 'Téléphone', value: p.phone, icon: iconPhone });
  return rows;
});

const healthNote = computed(() => {
  const custom = props.healthInstructions?.trim();
  if (custom) return custom;
  if (props.child.allergies.length) {
    return 'Prévenir immédiatement les parents si fièvre > 38,5 °C.';
  }
  return null;
});
</script>

<style scoped>
.profil-tab {
  display: grid;
  gap: 1.25rem;
}

.profil-card {
  border-radius: 1.25rem;
  border: 1px solid #e8edf2;
  background: #fff;
  padding: 1.25rem 1.25rem 1.5rem;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.05);
}

.profil-card__head {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.profil-card__head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  background: #eff6ff;
  color: #216ec2;
}

.profil-card__head-icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.profil-card__head-icon--heart {
  background: #fef2f2;
  color: #ef4444;
}

.profil-card__title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: #0f172a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.info-tile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 4.5rem;
  border-radius: 0.875rem;
  background: #f6f8fb;
  padding: 0.875rem 1rem;
}

.info-tile--enrollment {
  grid-column: span 1;
}

.info-tile--address {
  grid-column: span 2;
}

.info-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  border: 1px solid #e8edf2;
  background: #fff;
  color: #216ec2;
}

.info-tile__icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
}

.info-tile__label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.3;
}

.info-tile__value {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}

@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info-tile--address {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-tile--enrollment,
  .info-tile--address {
    grid-column: span 1;
  }
}

.profil-bottom {
  display: grid;
  gap: 1.25rem;
}

@media (min-width: 1024px) {
  .profil-bottom {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.allergy-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.allergy-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  background: #fef2f2;
  padding: 0.4rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #dc2626;
}

.allergy-tag__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.health-note {
  margin-top: 1rem;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: #64748b;
}

.profil-empty {
  font-size: 0.875rem;
  color: #94a3b8;
}

.parent-list {
  display: grid;
  gap: 0.625rem;
}

.parent-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 1rem;
  background: #f6f8fb;
  padding: 0.875rem 1rem;
}

.parent-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  background: #e8f2fc;
  color: #216ec2;
}

.parent-row__icon :deep(svg) {
  width: 1.125rem;
  height: 1.125rem;
}

.parent-row__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
}

.parent-row__value {
  margin-top: 0.125rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}
</style>
