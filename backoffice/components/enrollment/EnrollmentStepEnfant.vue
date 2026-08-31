<template>
  <div class="space-y-7">
    <div class="grid gap-4 sm:grid-cols-2">
      <EnrollmentField label="Prénom usuel" required>
        <input
          id="enrollment-child-first-name"
          v-model.trim="child.firstName"
          type="text"
          class="enrollment-input"
          placeholder="Prénom"
          autocomplete="given-name"
        />
      </EnrollmentField>
      <EnrollmentField label="Nom de famille" required>
        <input
          v-model.trim="child.lastName"
          type="text"
          class="enrollment-input"
          placeholder="Nom"
          autocomplete="family-name"
        />
      </EnrollmentField>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <EnrollmentField label="Date de naissance" required>
        <input
          id="enrollment-birth-date"
          v-model="child.birthDate"
          type="date"
          class="enrollment-input [color-scheme:light]"
          :max="todayIso"
        />
      </EnrollmentField>
      <EnrollmentField label="Lieu de naissance">
        <input
          v-model.trim="child.birthPlace"
          type="text"
          class="enrollment-input"
          placeholder="Ville, Pays"
        />
      </EnrollmentField>
      <EnrollmentField label="Nationalité">
        <input
          v-model.trim="child.nationality"
          type="text"
          class="enrollment-input"
          placeholder="—"
        />
      </EnrollmentField>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <EnrollmentField label="Sexe" required>
        <select v-model="child.gender" class="enrollment-input bg-white">
          <option value="Fille">Fille</option>
          <option value="Garçon">Garçon</option>
        </select>
      </EnrollmentField>
      <EnrollmentField label="Langue(s) à la maison">
        <input
          v-model.trim="child.homeLanguages"
          type="text"
          class="enrollment-input"
          placeholder="Français, Anglais"
        />
      </EnrollmentField>
    </div>

    <div id="enrollment-level">
      <EnrollmentSectionTitle title="Classe demandée" />

      <div
        v-if="loadingLevels"
        class="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500"
      >
        Chargement des niveaux…
      </div>

      <div
        v-else-if="levelsError"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700"
      >
        {{ levelsError }}
      </div>

      <div
        v-else-if="!levels.length"
        class="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500"
      >
        Aucun niveau n'est disponible pour le moment.
      </div>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="(level, index) in levels"
          :key="level.id"
          type="button"
          class="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition"
          :class="levelButtonClass(level)"
          :disabled="!level.enrollmentOpen"
          :title="!level.enrollmentOpen ? level.closedMessage ?? undefined : undefined"
          @click="selectLevel(level, index)"
        >
          <span
            class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition"
            :class="
              child.levelId === level.id && level.enrollmentOpen
                ? 'border-[#216EC2] bg-[#216EC2]'
                : 'border-slate-300 bg-white'
            "
          >
            <svg
              v-if="child.levelId === level.id && level.enrollmentOpen"
              class="h-2.5 w-2.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
            >
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span v-if="levelEmoji(index)" class="text-[22px] leading-none" :class="{ 'opacity-40': !level.enrollmentOpen }">
            {{ levelEmoji(index) }}
          </span>
          <span class="min-w-0 flex-1">
            <span
              class="block text-[13px] font-bold leading-snug"
              :class="level.enrollmentOpen ? 'text-slate-900' : 'text-slate-400'"
            >
              {{ level.name }}
            </span>
            <span
              v-if="!level.enrollmentOpen"
              class="mt-0.5 block text-[11px] font-medium text-slate-400"
            >
              {{ level.closedMessage }}
            </span>
            <span v-else-if="level.subtitle" class="mt-0.5 block text-[11px] text-slate-500">
              {{ level.subtitle }}
            </span>
          </span>
        </button>
      </div>

      <p
        v-if="levels.length && !levels.some((l) => l.enrollmentOpen)"
        class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        Tous les niveaux sont complets pour l'année scolaire en cours. Les inscriptions ne sont plus acceptées.
      </p>
    </div>

    <EnrollmentField label="Adresse du domicile de l'enfant">
      <input
        v-model.trim="child.childAddress"
        type="text"
        class="enrollment-input"
        placeholder="Rue, ville, pays…"
      />
    </EnrollmentField>
  </div>
</template>

<script setup lang="ts">
import type { EnrollmentChildDraft } from '~/composables/useEnrollmentWizard';

type ApiClassRoom = { id: string; name: string };
type ApiLevel = {
  id: string;
  name: string;
  order: number | null;
  classes?: ApiClassRoom[];
  enrollmentOpen?: boolean;
  availableSpots?: number;
  closedMessage?: string | null;
};

type LevelCard = {
  id: string;
  name: string;
  subtitle: string;
  enrollmentOpen: boolean;
  closedMessage: string;
};

const LEVEL_EMOJIS = ['🦁', '🐝', '🦒', '🐘', '🌱', '📚'];
const CLOSED_MESSAGE = 'Les inscriptions sont fermées pour ce niveau.';

const child = defineModel<EnrollmentChildDraft>('child', { required: true });

const config = useRuntimeConfig();
const loadingLevels = ref(true);
const levelsError = ref('');
const levels = ref<LevelCard[]>([]);

const todayIso = computed(() => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
});

function levelEmoji(index: number): string {
  return LEVEL_EMOJIS[index % LEVEL_EMOJIS.length] ?? '';
}

function mapLevel(level: ApiLevel): LevelCard {
  const classNames = (level.classes ?? [])
    .map((c) => c.name.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'fr'));

  const enrollmentOpen = level.enrollmentOpen !== false;

  return {
    id: level.id,
    name: level.name,
    subtitle: classNames.length ? `Classes : ${classNames.join(' · ')}` : '',
    enrollmentOpen,
    closedMessage: level.closedMessage?.trim() || CLOSED_MESSAGE,
  };
}

function levelButtonClass(level: LevelCard): string {
  if (!level.enrollmentOpen) {
    return 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-70';
  }
  if (child.value.levelId === level.id) {
    return 'border-[#216EC2] bg-[#216EC2]/[0.05] ring-1 ring-[#216EC2]/20';
  }
  return 'border-slate-200 bg-white hover:border-slate-300';
}

function selectLevel(level: LevelCard, index?: number) {
  if (!level.enrollmentOpen) return;
  child.value.levelId = level.id;
  child.value.levelName = level.name;
  child.value.levelSubtitle = level.subtitle.replace(/^Classes\s*:\s*/i, '').trim();
  const levelIndex = index ?? levels.value.findIndex((item) => item.id === level.id);
  child.value.levelEmoji = levelIndex >= 0 ? levelEmoji(levelIndex) : '';
}

function pickDefaultLevel() {
  const openLevels = levels.value.filter((l) => l.enrollmentOpen);
  if (!child.value.levelId && openLevels[0]) {
    const idx = levels.value.findIndex((l) => l.id === openLevels[0].id);
    selectLevel(openLevels[0], idx >= 0 ? idx : 0);
    return;
  }
  if (child.value.levelId) {
    const found = levels.value.find((l) => l.id === child.value.levelId);
    if (found?.enrollmentOpen) {
      const idx = levels.value.findIndex((l) => l.id === found.id);
      selectLevel(found, idx >= 0 ? idx : undefined);
    } else if (openLevels[0]) {
      const idx = levels.value.findIndex((l) => l.id === openLevels[0].id);
      selectLevel(openLevels[0], idx >= 0 ? idx : 0);
    } else {
      child.value.levelId = '';
      child.value.levelName = '';
      child.value.levelEmoji = '';
      child.value.levelSubtitle = '';
    }
  }
}

onMounted(async () => {
  loadingLevels.value = true;
  levelsError.value = '';
  try {
    const data = await $fetch<ApiLevel[]>(`${config.public.apiBase}/public/catalog/levels`);
    levels.value = (data ?? []).map(mapLevel);
    pickDefaultLevel();
  } catch {
    levels.value = [];
    levelsError.value = 'Impossible de charger les niveaux. Vérifiez que l’API est démarrée.';
  } finally {
    loadingLevels.value = false;
  }
});
</script>
