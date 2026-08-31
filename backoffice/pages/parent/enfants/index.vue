<template>
  <div>
    <header class="mb-8 sm:mb-10">
      <h1 class="text-3xl font-bold text-brandBlue sm:text-[2rem]">Mes enfants</h1>
      <p class="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
        Suivez le quotidien et les progrès de chacun de vos enfants.
      </p>
    </header>

    <div v-if="pending" class="rounded-2xl bg-white/80 px-6 py-10 text-center text-slate-500 shadow-sm">
      Chargement…
    </div>
    <div
      v-else-if="loadError"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ loadError }}
    </div>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      <ParentChildOverviewCard
        v-for="(child, idx) in children"
        :key="child.id"
        :child="child"
        :color-index="idx"
        :school-year="schoolYearForChild(child)"
        :presence-label="presenceLabel(child)"
        :attendance-label="attendanceLabel(child)"
        :notes-label="notesLabel(child)"
        :needs-reenrollment="needsReenrollment(child)"
        :reenroll-href="reenrollHref(child)"
        @open="openChildSpace"
      />

      <NuxtLink
        to="/inscription?from=parent"
        class="group flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center shadow-sm transition hover:border-brandBlue/40 hover:bg-white"
      >
        <span
          class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brandBlue/10 text-3xl font-light text-brandBlue transition group-hover:bg-brandBlue/15"
        >
          +
        </span>
        <span class="text-base font-bold text-slate-800">Inscrire un enfant</span>
        <span class="mt-1 text-sm text-slate-500">Envoyer une demande d'inscription</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
type Gender = 'FEMALE' | 'MALE' | 'UNSPECIFIED';
type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type OverviewChild = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: Gender;
  photoUrl?: string | null;
  enrollments: Array<{
    schoolYear: string;
    status: EnrollmentStatus;
    level: { name: string };
    class: { name: string } | null;
  }>;
};

definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

const router = useRouter();
const { authFetch } = useParentAuth();
const config = useRuntimeConfig();

const children = ref<OverviewChild[]>([]);
const pending = ref(true);
const loadError = ref<string | null>(null);
const defaultSchoolYear = ref<string | null>(null);

function needsReenrollment(child: OverviewChild): boolean {
  const list = child.enrollments ?? [];
  const year = defaultSchoolYear.value?.trim();
  if (!list.length) return true;
  const relevant = year ? list.filter((e) => e.schoolYear === year) : list;
  if (!relevant.length) return true;
  return !relevant.some((e) => e.status === 'PENDING' || e.status === 'APPROVED');
}

function reenrollHref(child: OverviewChild): string | null {
  if (!needsReenrollment(child)) return null;
  return `/inscription?from=parent&child=${encodeURIComponent(child.id)}`;
}

function schoolYearForChild(child: OverviewChild): string | null {
  if (needsReenrollment(child)) return defaultSchoolYear.value;
  const year = child.enrollments?.[0]?.schoolYear?.trim();
  return year || defaultSchoolYear.value;
}

function presenceLabel(child: OverviewChild): string | null {
  if (needsReenrollment(child)) return '• Non inscrit(e)';
  const status = child.enrollments?.[0]?.status;
  if (status === 'APPROVED') return '• Présent(e)';
  if (status === 'PENDING') return '• Dossier en cours';
  if (status === 'REJECTED') return '• Dossier refusé';
  return null;
}

function attendanceLabel(_child: OverviewChild): string | null {
  return null;
}

function notesLabel(_child: OverviewChild): string | null {
  return null;
}

function openChildSpace(childId: string) {
  if (!childId) return;
  void router.push(`/parent/enfants/${childId}`);
}

onMounted(async () => {
  pending.value = true;
  loadError.value = null;
  try {
    const sy = await $fetch<{ active: { label: string } | null }>(
      `${config.public.apiBase}/public/catalog/school-year/active`,
    ).catch(() => null);
    defaultSchoolYear.value = sy?.active?.label ?? null;

    children.value = await authFetch<OverviewChild[]>('/parent/overview');
  } catch {
    loadError.value = 'Impossible de charger la liste.';
  } finally {
    pending.value = false;
  }
});
</script>
