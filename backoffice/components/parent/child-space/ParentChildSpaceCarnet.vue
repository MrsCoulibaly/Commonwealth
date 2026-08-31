<template>
  <section class="carnet">
    <header class="carnet__head">
      <svg class="carnet__head-clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        <path d="M8 7h8M8 11h8M8 15h5" stroke-linecap="round" />
      </svg>
      <div>
        <h2 class="carnet__title">Carnet de suivi virtuel</h2>
        <p class="carnet__subtitle">
          Le journal quotidien tenu par l'équipe pédagogique. Suivez chaque moment de la journée de votre enfant.
        </p>
      </div>
    </header>

    <div v-if="!notes.length" class="carnet__empty">
      Aucune note publiée pour le moment.
    </div>

    <div v-else class="carnet__layout">
      <aside class="carnet__sidebar">
        <div class="carnet-sidebar-panel">
          <p class="carnet-sidebar-panel__label">Journées</p>
          <ul class="carnet__day-list">
            <li v-for="day in days" :key="day.key">
              <button
                type="button"
                class="carnet-day"
                :class="{ 'carnet-day--active': selectedDay === day.key }"
                @click="selectedDay = day.key"
              >
                <span class="carnet-day__left">
                  <span v-if="selectedDay === day.key" class="carnet-day__dot" aria-hidden="true" />
                  {{ day.label }}
                </span>
                <span
                  class="carnet-day__badge"
                  :class="{ 'carnet-day__badge--active': selectedDay === day.key }"
                >
                  {{ day.count }}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="carnet-sidebar-panel">
          <p class="carnet-sidebar-panel__label">Catégories</p>
          <ul class="carnet__cat-list">
            <li v-for="cat in categoryFilters" :key="cat.id">
              <button
                type="button"
                class="carnet-cat"
                :class="{ 'carnet-cat--active': activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >
                <span class="carnet-cat__left">
                  <span
                    class="carnet-cat__icon"
                    :class="[
                      cat.id === 'ALL' ? 'carnet-cat__icon--all' : `carnet-cat__icon--${cat.id.toLowerCase()}`,
                      { 'carnet-cat__icon--on-dark': activeCategory === cat.id },
                    ]"
                    aria-hidden="true"
                  >
                    <component :is="categoryIcon(cat.id)" />
                  </span>
                  {{ cat.label }}
                </span>
                <span
                  class="carnet-cat__badge"
                  :class="{ 'carnet-cat__badge--active': activeCategory === cat.id }"
                >
                  {{ categoryCount(cat.id) }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div class="carnet__main">
        <div v-if="selectedDayMeta" class="carnet-day-card">
          <div class="carnet__day-head">
            <div>
              <h3 class="carnet__day-title">{{ selectedDayMeta.heading }}</h3>
              <p class="carnet__day-sub">
                {{ dayNoteCount }} note{{ dayNoteCount > 1 ? 's' : '' }}
                <span v-if="childFirstName"> · {{ childFirstName }}</span>
              </p>
            </div>
            <div class="carnet__nav">
            <button
              type="button"
              class="carnet__nav-btn"
              aria-label="Journée précédente"
              :disabled="!canGoPrev"
              @click="goPrevDay"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              class="carnet__nav-btn"
              aria-label="Journée suivante"
              :disabled="!canGoNext"
              @click="goNextDay"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          </div>
        </div>

        <div v-if="daySummary.length" class="carnet__summary">
          <div
            v-for="item in daySummary"
            :key="item.category"
            class="carnet-summary-card"
          >
            <span
              class="carnet-summary-card__icon"
              :class="`carnet-summary-card__icon--${item.category.toLowerCase()}`"
              aria-hidden="true"
            >
              <component :is="categoryIcon(item.category)" />
            </span>
            <p class="carnet-summary-card__text">
              <strong>{{ item.count }}</strong>
              {{ categoryLabel(item.category) }}
            </p>
          </div>
        </div>

        <div v-if="sortedNotes.length" class="carnet__timeline">
          <article v-for="note in sortedNotes" :key="note.id" class="carnet-entry">
            <div
              class="carnet-entry__node"
              :class="`carnet-entry__node--${note.category.toLowerCase()}`"
              aria-hidden="true"
            >
              <component :is="categoryIcon(note.category)" />
            </div>
            <div class="carnet-entry__card">
              <div class="carnet-entry__top">
                <div class="carnet-entry__title-row">
                  <span class="carnet-entry__title">{{ categoryLabel(note.category) }}</span>
                  <span
                    class="carnet-entry__tag"
                    :class="`carnet-entry__tag--${note.category.toLowerCase()}`"
                  >
                    {{ categoryLabel(note.category) }}
                  </span>
                </div>
                <time class="carnet-entry__time">{{ note.timeLabel }}</time>
              </div>

              <div
                v-if="noteRating(note) > 0"
                class="carnet-entry__rating"
                :aria-label="`${noteRating(note)} sur 5`"
              >
                <div class="carnet-entry__stars">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="carnet-entry__star"
                    :class="{ 'carnet-entry__star--on': star <= noteRating(note) }"
                    aria-hidden="true"
                  >★</span>
                </div>
                <span class="carnet-entry__score">{{ noteRating(note) }}/5</span>
              </div>

              <p v-if="note.content" class="carnet-entry__content">{{ note.content }}</p>
              <footer class="carnet-entry__foot">
                <button
                  type="button"
                  class="carnet-entry__like"
                  :class="{ 'carnet-entry__like--on': likedIds.has(note.id) }"
                  @click="toggleLike(note.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  J'aime
                </button>
                <span class="carnet-entry__read">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  Lu
                </span>
              </footer>
            </div>
          </article>
        </div>
        <p v-else class="carnet__empty carnet__empty--inline">
          Aucune note pour cette sélection.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { FollowUpNoteItem } from './types';

const props = defineProps<{
  notes: FollowUpNoteItem[];
  childFirstName?: string;
}>();

type CategoryFilter = 'ALL' | FollowUpNoteItem['category'];

const selectedDay = ref<string>('');
const activeCategory = ref<CategoryFilter>('ALL');
const likedIds = ref(new Set<string>());

const categoryFilters: { id: CategoryFilter; label: string }[] = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'ACTIVITY', label: 'Activité' },
  { id: 'MEAL', label: 'Repas' },
  { id: 'NAP', label: 'Sieste' },
  { id: 'MOOD', label: 'Humeur' },
  { id: 'CARE', label: 'Soin' },
];

function noteRating(note: FollowUpNoteItem): number {
  const n = Number(note.rating);
  if (!Number.isFinite(n) || n < 1) return 0;
  return Math.min(5, Math.round(n));
}

function categoryLabel(cat: FollowUpNoteItem['category']): string {
  const map: Record<FollowUpNoteItem['category'], string> = {
    MEAL: 'Repas',
    NAP: 'Sieste',
    MOOD: 'Humeur',
    CARE: 'Soin',
    ACTIVITY: 'Activité',
  };
  return map[cat] ?? cat;
}

function categoryIcon(cat: CategoryFilter | FollowUpNoteItem['category']) {
  if (cat === 'ALL') {
    return () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
        h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
      ]);
  }
  if (cat === 'MEAL') {
    return () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('path', { d: 'M18 8h1a4 4 0 0 1 0 8h-1' }),
        h('path', { d: 'M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z' }),
      ]);
  }
  if (cat === 'NAP') {
    return () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }),
      ]);
  }
  if (cat === 'MOOD') {
    return () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('circle', { cx: '12', cy: '12', r: '9' }),
        h('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2', 'stroke-linecap': 'round' }),
        h('line', { x1: '9', y1: '9', x2: '9.01', y2: '9', 'stroke-linecap': 'round' }),
        h('line', { x1: '15', y1: '9', x2: '15.01', y2: '9', 'stroke-linecap': 'round' }),
      ]);
  }
  if (cat === 'CARE') {
    return () =>
      h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('path', {
          d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
        }),
      ]);
  }
  return () =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
      h('circle', { cx: '12', cy: '12', r: '9' }),
    ]);
}

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function formatDayLabel(isoDate: string): string {
  const dt = parseDate(isoDate);
  const weekday = dt.toLocaleDateString('fr-FR', { weekday: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap} ${dt.getDate()}`;
}

function formatDayHeading(isoDate: string): string {
  const dt = parseDate(isoDate);
  const weekday = dt.toLocaleDateString('fr-FR', { weekday: 'long' });
  const month = dt.toLocaleDateString('fr-FR', { month: 'long' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
  const today = new Date();
  const isToday =
    today.getFullYear() === dt.getFullYear() &&
    today.getMonth() === dt.getMonth() &&
    today.getDate() === dt.getDate();
  return `${cap} ${dt.getDate()} ${monthCap}${isToday ? ' · Aujourd\u2019hui' : ''}`;
}

const days = computed(() => {
  const counts = new Map<string, number>();
  for (const n of props.notes) {
    counts.set(n.noteDate, (counts.get(n.noteDate) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, count]) => ({ key, label: formatDayLabel(key), count }));
});

const selectedDayIndex = computed(() => days.value.findIndex((d) => d.key === selectedDay.value));
const canGoPrev = computed(() => selectedDayIndex.value < days.value.length - 1);
const canGoNext = computed(() => selectedDayIndex.value > 0);

const dayNoteCount = computed(() => {
  if (!selectedDay.value) return 0;
  return props.notes.filter((n) => n.noteDate === selectedDay.value).length;
});

function goPrevDay() {
  const idx = selectedDayIndex.value;
  if (idx < days.value.length - 1) selectedDay.value = days.value[idx + 1].key;
}

function goNextDay() {
  const idx = selectedDayIndex.value;
  if (idx > 0) selectedDay.value = days.value[idx - 1].key;
}

watch(
  days,
  (list) => {
    if (!list.length) {
      selectedDay.value = '';
      return;
    }
    if (!list.some((d) => d.key === selectedDay.value)) {
      selectedDay.value = list[0].key;
    }
  },
  { immediate: true },
);

function categoryCount(cat: CategoryFilter): number {
  const dayNotes = props.notes.filter((n) => n.noteDate === selectedDay.value);
  if (cat === 'ALL') return dayNotes.length;
  return dayNotes.filter((n) => n.category === cat).length;
}

const filteredNotes = computed(() =>
  props.notes.filter((n) => {
    if (selectedDay.value && n.noteDate !== selectedDay.value) return false;
    if (activeCategory.value !== 'ALL' && n.category !== activeCategory.value) return false;
    return true;
  }),
);

const sortedNotes = computed(() =>
  [...filteredNotes.value].sort((a, b) => b.timeLabel.localeCompare(a.timeLabel)),
);

const selectedDayMeta = computed(() => {
  if (!selectedDay.value) return null;
  return { heading: formatDayHeading(selectedDay.value) };
});

const daySummary = computed(() => {
  if (!selectedDay.value || activeCategory.value !== 'ALL') return [];
  const dayNotes = props.notes.filter((n) => n.noteDate === selectedDay.value);
  const counts = new Map<FollowUpNoteItem['category'], number>();
  for (const n of dayNotes) {
    counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
  }
  const order: FollowUpNoteItem['category'][] = ['MEAL', 'NAP', 'MOOD', 'CARE', 'ACTIVITY'];
  return order
    .filter((cat) => (counts.get(cat) ?? 0) > 0)
    .map((category) => ({ category, count: counts.get(category)! }));
});

function toggleLike(id: string) {
  const next = new Set(likedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  likedIds.value = next;
}
</script>

<style scoped>
.carnet {
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid #e8edf2;
  background: #fff;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06);
}

.carnet__head {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1.375rem 1.5rem 1.25rem;
  border-bottom: 1px solid #eef2f6;
}

.carnet__head-clip {
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
  margin-top: 0.2rem;
  color: #216ec2;
}

.carnet__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.carnet__subtitle {
  margin-top: 0.35rem;
  max-width: 40rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #64748b;
}

.carnet__empty {
  padding: 4rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #94a3b8;
}

.carnet__empty--inline {
  padding: 2.5rem 0;
}

.carnet__layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
}

.carnet__sidebar {
  display: grid;
  gap: 0.75rem;
  padding: 1rem 0.875rem 1.25rem;
  border-right: 1px solid #eef2f6;
  background: #fff;
}

.carnet-sidebar-panel {
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.75rem 0.625rem 0.625rem;
}

.carnet-sidebar-panel__label {
  padding: 0 0.375rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.carnet__day-list,
.carnet__cat-list {
  display: grid;
  gap: 0.25rem;
}

/* —— Journées —— */
.carnet-day {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  padding: 0.45rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.carnet-day:hover:not(.carnet-day--active) {
  background: #f8fafc;
}

.carnet-day--active {
  background: #e8f2fc;
  color: #1d4ed8;
}

.carnet-day__left {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.carnet-day__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 9999px;
  background: #f97316;
  flex-shrink: 0;
}

.carnet-day__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #f1f5f9;
  padding: 0 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
}

.carnet-day__badge--active {
  background: #216ec2;
  color: #fff;
}

/* —— Catégories —— */
.carnet-cat {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-radius: 0.625rem;
  border: 1px solid transparent;
  background: transparent;
  padding: 0.45rem 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.carnet-cat:hover:not(.carnet-cat--active) {
  background: #fff;
}

.carnet-cat--active {
  background: #1e3a5f;
  color: #fff;
}

.carnet-cat__left {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.carnet-cat__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 0.375rem;
}

.carnet-cat__icon :deep(svg) {
  width: 0.8125rem;
  height: 0.8125rem;
}

.carnet-cat__icon--all {
  background: #dbeafe;
  color: #216ec2;
}

.carnet-cat__icon--meal {
  background: #dcfce7;
  color: #16a34a;
}

.carnet-cat__icon--nap {
  background: #ede9fe;
  color: #7c3aed;
}

.carnet-cat__icon--mood {
  background: #ffedd5;
  color: #ea580c;
}

.carnet-cat__icon--care {
  background: #fce7f3;
  color: #db2777;
}

.carnet-cat__icon--activity {
  background: #e0f2fe;
  color: #0284c7;
}

.carnet-cat__icon--on-dark.carnet-cat__icon--all {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.carnet-cat__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: #f1f5f9;
  padding: 0 0.35rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #94a3b8;
}

.carnet-cat__badge--active {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* —— Main —— */
.carnet__main {
  padding: 1rem 1.25rem 1.5rem;
  background: #fff;
}

.carnet-day-card {
  margin-bottom: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.875rem 1rem;
}

.carnet__day-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0;
}

.carnet__day-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.carnet__day-sub {
  margin-top: 0.15rem;
  font-size: 0.8125rem;
  color: #94a3b8;
}

.carnet__nav {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
  padding: 0.2rem;
  border-radius: 0.625rem;
  border: 1px solid #e8edf2;
  background: #fff;
}

.carnet__nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 9999px;
  color: #64748b;
  transition: background-color 0.15s ease;
}

.carnet__nav-btn svg {
  width: 0.9rem;
  height: 0.9rem;
}

.carnet__nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.carnet__nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* —— Summary cards —— */
.carnet__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.carnet-summary-card {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  border-radius: 0.75rem;
  border: 1px solid #e8edf2;
  background: #fff;
  padding: 0.75rem 0.875rem;
}

.carnet-summary-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
}

.carnet-summary-card__icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.carnet-summary-card__icon--meal {
  background: #dcfce7;
  color: #16a34a;
}

.carnet-summary-card__icon--nap {
  background: #ede9fe;
  color: #7c3aed;
}

.carnet-summary-card__icon--mood {
  background: #ffedd5;
  color: #ea580c;
}

.carnet-summary-card__icon--care {
  background: #fce7f3;
  color: #db2777;
}

.carnet-summary-card__icon--activity {
  background: #e0f2fe;
  color: #0284c7;
}

.carnet-summary-card__text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.2;
}

.carnet-summary-card__text strong {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-right: 0.25rem;
}

/* —— Timeline —— */
.carnet__timeline {
  display: grid;
  gap: 0;
}

.carnet-entry {
  display: grid;
  grid-template-columns: 2.25rem minmax(0, 1fr);
  gap: 0.875rem;
  position: relative;
  padding-bottom: 1.125rem;
}

.carnet-entry:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 1.0625rem;
  top: 2.5rem;
  bottom: 0;
  width: 2px;
  background: #e8edf2;
  transform: translateX(-50%);
}

.carnet-entry__node {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  margin-top: 0.75rem;
  border-radius: 9999px;
  color: #fff;
  z-index: 1;
  box-shadow: 0 0 0 3px #fff;
}

.carnet-entry__node :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.carnet-entry__node--meal {
  background: #22c55e;
}

.carnet-entry__node--nap {
  background: #8b5cf6;
}

.carnet-entry__node--mood {
  background: #f97316;
}

.carnet-entry__node--care {
  background: #ec4899;
}

.carnet-entry__node--activity {
  background: #0ea5e9;
}

.carnet-entry__card {
  border-radius: 0.875rem;
  border: 1px solid #e8edf2;
  background: #fff;
  padding: 0.875rem 1rem 0.75rem;
}

.carnet-entry__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.carnet-entry__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.carnet-entry__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
}

.carnet-entry__tag {
  border-radius: 9999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.carnet-entry__tag--meal {
  background: #dcfce7;
  color: #15803d;
}

.carnet-entry__tag--nap {
  background: #ede9fe;
  color: #6d28d9;
}

.carnet-entry__tag--mood {
  background: #ffedd5;
  color: #c2410c;
}

.carnet-entry__tag--care {
  background: #fce7f3;
  color: #be185d;
}

.carnet-entry__tag--activity {
  background: #e0f2fe;
  color: #0369a1;
}

.carnet-entry__time {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.carnet-entry__rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.15rem 0 0.55rem;
}

.carnet-entry__stars {
  display: inline-flex;
  gap: 0.1rem;
  line-height: 1;
}

.carnet-entry__star {
  font-size: 1.25rem;
  color: #dbe3ec;
  user-select: none;
}

.carnet-entry__star--on {
  color: #f59e0b;
}

.carnet-entry__score {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #b45309;
}

.carnet-entry__content {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #475569;
}

.carnet-entry__content--muted {
  font-style: italic;
  color: #94a3b8;
}

.carnet-entry__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f1f5f9;
}

.carnet-entry__like {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.carnet-entry__like svg {
  width: 0.875rem;
  height: 0.875rem;
}

.carnet-entry__like:hover,
.carnet-entry__like--on {
  color: #ef4444;
}

.carnet-entry__like--on svg {
  fill: #ef4444;
}

.carnet-entry__read {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #10b981;
}

.carnet-entry__read svg {
  width: 0.875rem;
  height: 0.875rem;
}

@media (max-width: 900px) {
  .carnet__layout {
    grid-template-columns: 1fr;
  }

  .carnet__sidebar {
    border-right: none;
    border-bottom: 1px solid #eef2f6;
  }

  .carnet__summary {
    grid-template-columns: 1fr;
  }
}
</style>
