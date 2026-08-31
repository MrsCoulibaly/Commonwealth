<template>
  <div class="mx-auto max-w-6xl">
    <NuxtLink
      to="/parent/enfants"
      class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brandBlue"
    >
      <span aria-hidden="true">←</span>
      Mes enfants
    </NuxtLink>

    <div v-if="pending" class="rounded-2xl bg-white/80 px-6 py-16 text-center text-slate-500 shadow-sm">
      Chargement…
    </div>
    <div
      v-else-if="loadError"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ loadError }}
    </div>

    <template v-else-if="space">
      <ParentChildSpaceHeader
        :child="space.child"
        :enrollment="space.enrollment"
        :presence-label="presenceLabel"
        :active-tab="activeTab"
        @edit-fiche="onEditFiche"
      />

      <ParentChildSpaceTabs
        :active-tab="activeTab"
        :carnet-count="carnetCount"
        @change="setTab"
      />

      <div class="mt-5">
        <ParentChildSpaceProfil
          v-if="activeTab === 'profil'"
          :child="space.child"
          :enrollment="space.enrollment"
          :parent="space.parent"
          :health-instructions="space.healthRecord?.instructions"
        />
        <ParentChildSpaceCarnet
          v-else-if="activeTab === 'carnet'"
          :notes="space.followUpNotes.items"
          :child-first-name="space.child.firstName"
        />
        <ParentChildSpaceSante
          v-else
          ref="santeRef"
          :child-id="childId"
          :record="space.healthRecord"
          @signed="onHealthUpdated"
          @updated="onHealthUpdated"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChildSpaceTabId, ParentChildSpacePayload } from '~/components/parent/child-space/types';

definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

const route = useRoute();
const router = useRouter();
const { authFetch } = useParentAuth();

const childId = computed(() => String(route.params.id ?? ''));
const pending = ref(true);
const loadError = ref<string | null>(null);
const space = ref<ParentChildSpacePayload | null>(null);
const santeRef = ref<{ openEditModal: () => void } | null>(null);

const carnetCount = computed(() => space.value?.followUpNotes.items.length ?? 0);

type TabId = ChildSpaceTabId;

const activeTab = computed<TabId>(() => {
  const q = String(route.query.tab ?? 'profil');
  if (q === 'carnet' || q === 'sante') return q;
  return 'profil';
});

const presenceLabel = computed(() => {
  const status = space.value?.enrollment?.status;
  if (status === 'APPROVED') return 'Présente';
  if (status === 'PENDING') return 'Dossier en cours';
  if (status === 'REJECTED') return 'Dossier refusé';
  return null;
});

function setTab(id: TabId) {
  void router.replace({
    path: `/parent/enfants/${childId.value}`,
    query: id === 'profil' ? {} : { tab: id },
  });
}

function onHealthUpdated(record: NonNullable<ParentChildSpacePayload['healthRecord']>) {
  if (space.value) space.value.healthRecord = record;
}

function onEditFiche() {
  if (activeTab.value !== 'sante') return;
  santeRef.value?.openEditModal();
}

async function load() {
  if (!childId.value) return;
  pending.value = true;
  loadError.value = null;
  try {
    space.value = await authFetch<ParentChildSpacePayload>(`/parent/children/${childId.value}/space`);
  } catch {
    loadError.value = 'Impossible de charger l’espace de cet enfant.';
    space.value = null;
  } finally {
    pending.value = false;
  }
}

watch(childId, () => load(), { immediate: true });
</script>
