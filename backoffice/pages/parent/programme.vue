<template>
  <div>
    <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-brandBlue">Programme</h1>
        <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <svg class="h-4 w-4 text-brandBlue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          Calendrier de l’année scolaire {{ schoolYearLabel }} — niveaux de vos enfants
        </p>
      </div>
      <button
        v-if="overview?.items.length"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl border-2 border-brandBlue bg-white px-4 py-2.5 text-sm font-bold text-brandBlue transition hover:bg-brandBlue/5 disabled:opacity-50"
        :disabled="pending || pdfExporting || !filteredGroups.length"
        @click="exportProgrammePdf"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke-linecap="round" />
        </svg>
        {{ pdfExporting ? 'Export en cours…' : 'Exporter en PDF' }}
      </button>
    </div>

    <p v-if="loadError" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <section class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border-2 border-brandBlue/30 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-700">{{ card.title }}</h2>
        </div>
        <p class="text-3xl font-bold tracking-tight text-slate-900">
          <span v-if="pending" class="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
      </article>
    </section>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="chip in filterChips"
        :key="chip.value"
        type="button"
        class="rounded-full px-4 py-2 text-sm font-semibold transition"
        :class="
          activeCategory === chip.value
            ? 'bg-brandBlue text-white shadow-sm'
            : 'border border-slate-200 bg-white text-slate-600 hover:border-brandBlue/40 hover:text-brandBlue'
        "
        @click="activeCategory = chip.value"
      >
        {{ chip.label }}
      </button>
    </div>

    <div v-if="pending" class="space-y-6">
      <div v-for="n in 2" :key="n" class="space-y-3">
        <div class="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div v-for="s in 2" :key="s" class="h-36 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>

    <div
      v-else-if="!filteredGroups.length"
      class="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center"
    >
      <p class="text-lg font-semibold text-slate-700">Aucun programme pour vos enfants</p>
      <p class="mt-1 text-sm text-slate-500">
        Seuls les événements liés aux niveaux de vos enfants (et ceux de toute l’école) apparaissent ici.
      </p>
    </div>

    <div v-else class="space-y-8">
      <section v-for="group in filteredGroups" :key="group.monthLabel" class="space-y-4">
        <h2 class="text-lg font-bold text-slate-800">{{ group.monthLabel }}</h2>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article
            v-for="event in group.events"
            :key="event.id"
            class="flex w-full overflow-hidden rounded-2xl border bg-white shadow-sm"
            :style="{
              borderColor: `${eventTheme(event).iconColor}40`,
              boxShadow: `0 1px 3px ${eventTheme(event).iconColor}14`,
            }"
          >
            <div
              class="flex w-16 shrink-0 flex-col items-center justify-center border-r py-4 text-center"
              :style="{
                backgroundColor: eventTheme(event).iconBg,
                color: eventTheme(event).iconColor,
                borderColor: `${eventTheme(event).iconColor}30`,
              }"
            >
              <span class="text-2xl font-bold leading-none">{{ event.dayNum }}</span>
              <span class="mt-1 text-xs font-bold tracking-wide opacity-80">{{ event.dayAbbr }}</span>
            </div>

            <div class="min-w-0 flex-1 p-4 sm:p-5">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-3 py-0.5 text-xs font-bold"
                  :style="{
                    backgroundColor: eventTheme(event).iconBg,
                    color: eventTheme(event).iconColor,
                  }"
                >
                  {{ event.categoryLabel }}
                </span>
                <span
                  class="rounded-full px-3 py-0.5 text-xs font-bold"
                  :style="{
                    backgroundColor: statusTheme(event.status).bg,
                    color: statusTheme(event.status).color,
                  }"
                >
                  {{ event.statusLabel }}
                </span>
              </div>

              <h3 class="mt-2 text-lg font-bold text-slate-900">{{ event.title }}</h3>
              <p v-if="event.description" class="mt-1 text-sm leading-relaxed text-slate-600">{{ event.description }}</p>

              <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                <span class="inline-flex items-center gap-1.5">
                  <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {{ event.dateLabel }}
                </span>
                <span v-if="event.location" class="inline-flex items-center gap-1.5">
                  <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {{ event.location }}
                </span>
                <span v-if="event.assignedStaff" class="inline-flex items-center gap-1.5">
                  <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {{ event.assignedStaff }}
                </span>
              </div>

              <div v-if="event.levelLabels.length" class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="label in event.levelLabels"
                  :key="label"
                  class="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
                >
                  {{ label }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

type ProgramStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

type ProgrammeCategory = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  active: boolean;
};

type ProgramEvent = {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  endDate: string | null;
  dateLabel: string;
  dayNum: number;
  dayAbbr: string;
  monthKey: string;
  location: string;
  assignedStaff: string;
  categoryId: string;
  categoryLabel: string;
  categoryColor: string;
  categoryBgColor: string;
  status: ProgramStatus;
  statusLabel: string;
  levelLabels: string[];
};

type OverviewDto = {
  schoolYear: string;
  categories: ProgrammeCategory[];
  stats: { total: number; upcoming: number; inProgress: number; completed: number };
  groups: Array<{ monthLabel: string; events: ProgramEvent[] }>;
  items: ProgramEvent[];
};

const STATUS_THEMES: Record<ProgramStatus, { bg: string; color: string }> = {
  PLANNED: { bg: '#F1F5F9', color: '#64748B' },
  IN_PROGRESS: { bg: '#FFF3E0', color: '#F9994B' },
  COMPLETED: { bg: '#E8F5E9', color: '#2E7D32' },
};

function eventTheme(event: ProgramEvent) {
  return {
    iconBg: event.categoryBgColor || '#E8F1FB',
    iconColor: event.categoryColor || '#216EC2',
  };
}

function statusTheme(status: ProgramStatus) {
  return STATUS_THEMES[status];
}

const { authFetch, authFetchBlob } = useParentAuth();

const overview = ref<OverviewDto | null>(null);
const loadError = ref<string | null>(null);
const pending = ref(true);
const pdfExporting = ref(false);
const activeCategory = ref<'ALL' | string>('ALL');

const schoolYearLabel = computed(() => overview.value?.schoolYear || '—');

const filterChips = computed(() => {
  const cats = (overview.value?.categories ?? []).map((c) => ({ value: c.id, label: c.name }));
  return [{ value: 'ALL' as const, label: 'Tous' }, ...cats];
});

const filteredGroups = computed(() => {
  const groups = overview.value?.groups ?? [];
  if (activeCategory.value === 'ALL') return groups;
  return groups
    .map((g) => ({
      monthLabel: g.monthLabel,
      events: g.events.filter((e) => e.categoryId === activeCategory.value),
    }))
    .filter((g) => g.events.length);
});

const statCards = computed(() => {
  const s = overview.value?.stats;
  return [
    { key: 'total', title: 'Programmes', value: s?.total ?? 0 },
    { key: 'upcoming', title: 'À venir', value: s?.upcoming ?? 0 },
    { key: 'inProgress', title: 'En cours', value: s?.inProgress ?? 0 },
    { key: 'completed', title: 'Terminés', value: s?.completed ?? 0 },
  ];
});

function triggerPdfDownload(filename: string, blob: Blob) {
  const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function exportProgrammePdf() {
  if (pdfExporting.value) return;
  pdfExporting.value = true;
  loadError.value = null;
  try {
    const qs =
      activeCategory.value && activeCategory.value !== 'ALL'
        ? `?category=${encodeURIComponent(activeCategory.value)}`
        : '';
    const yearSlug = (overview.value?.schoolYear || 'annee').replace(/\s+/g, '-');
    const { blob, filename } = await authFetchBlob(`/parent/programme/pdf${qs}`);
    triggerPdfDownload(filename ?? `Programme-${yearSlug}.pdf`, blob);
  } catch (e) {
    loadError.value =
      e instanceof Error && e.message
        ? e.message
        : 'Impossible d’exporter le programme en PDF.';
  } finally {
    pdfExporting.value = false;
  }
}

async function load() {
  pending.value = true;
  loadError.value = null;
  try {
    overview.value = await authFetch<OverviewDto>('/parent/programme');
  } catch {
    overview.value = null;
    loadError.value = 'Impossible de charger le programme de l’école.';
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>
