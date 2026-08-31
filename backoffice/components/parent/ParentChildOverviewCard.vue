<template>
  <article class="child-card overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
    <div class="child-card__header" :class="headerClass">
      <span class="child-card__avatar">
        <img
          v-if="child.photoUrl"
          :src="child.photoUrl"
          :alt="`${child.firstName} ${child.lastName}`"
          class="child-card__avatar-img"
        >
        <template v-else>{{ initials }}</template>
      </span>
      <span
        v-if="presenceLabel"
        class="child-card__presence"
        :class="{ 'child-card__presence--alert': needsReenrollment }"
      >
        <span class="child-card__presence-dot" aria-hidden="true" />
        {{ presenceLabel }}
      </span>
    </div>

    <div class="px-5 pb-4 pt-4 sm:px-6">
      <h2 class="text-lg font-bold text-slate-900">
        {{ child.firstName }} {{ child.lastName }}
      </h2>
      <p class="mt-1 text-sm text-slate-500">{{ subtitleLine }}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <span v-if="schoolYear" class="child-badge child-badge--blue">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {{ schoolYear }}
        </span>
        <span v-if="attendanceLabel" class="child-badge child-badge--green">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ attendanceLabel }}
        </span>
        <span v-if="notesLabel" class="child-badge child-badge--orange">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
          {{ notesLabel }}
        </span>
      </div>
    </div>

    <div class="child-card__footer">
      <NuxtLink
        v-if="needsReenrollment && reenrollHref"
        :to="reenrollHref"
        class="child-card__cta child-card__cta--reenroll"
      >
        Réinscrire
      </NuxtLink>
      <button
        type="button"
        class="child-card__cta"
        @click="$emit('open', child.id)"
      >
        <span aria-hidden="true">→</span>
        Ouvrir l'espace
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
type Gender = 'FEMALE' | 'MALE' | 'UNSPECIFIED';
type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ParentChildCardData = {
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

const props = defineProps<{
  child: ParentChildCardData;
  colorIndex?: number;
  schoolYear?: string | null;
  attendanceLabel?: string | null;
  notesLabel?: string | null;
  presenceLabel?: string | null;
  needsReenrollment?: boolean;
  reenrollHref?: string | null;
}>();

defineEmits<{
  open: [childId: string];
}>();

const headerClass = computed(() =>
  (props.colorIndex ?? 0) % 2 === 0 ? 'child-card__header--blue' : 'child-card__header--orange',
);

const initials = computed(() => {
  const a = props.child.firstName?.trim()?.[0] ?? '';
  const b = props.child.lastName?.trim()?.[0] ?? '';
  return `${a}${b}`.toUpperCase() || '?';
});

function ageLabel(iso: string | null): string {
  if (!iso) return '—';
  const birth = new Date(iso);
  if (Number.isNaN(birth.getTime())) return '—';
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) years--;
  if (years < 0) return '—';
  if (years === 0) {
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    if (months <= 0) return 'Né(e) récemment';
    return months === 1 ? '1 mois' : `${months} mois`;
  }
  return years === 1 ? '1 an' : `${years} ans`;
}

function genderLabel(g: Gender): string {
  if (g === 'FEMALE') return 'Fille';
  if (g === 'MALE') return 'Garçon';
  return '—';
}

const subtitleLine = computed(() => {
  const enr = props.child.enrollments?.[0];
  const level = enr?.class?.name || enr?.level?.name;
  const parts = [
    level || (props.needsReenrollment ? 'Non inscrit(e)' : '—'),
    ageLabel(props.child.birthDate),
    genderLabel(props.child.gender),
  ].filter((p) => p && p !== '—');
  return parts.length ? parts.join(' · ') : '—';
});
</script>

<style scoped>
.child-card__header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem 2.75rem;
}

.child-card__header--blue {
  background: #216ec2;
}

.child-card__header--orange {
  background: #f99b4b;
}

.child-card__avatar {
  display: inline-flex;
  height: 3rem;
  width: 3rem;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.625rem;
  background: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  color: #216ec2;
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.12);
}

.child-card__avatar-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.child-card__header--orange .child-card__avatar {
  color: #e8872f;
}

.child-card__presence {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.95);
  padding: 0.3rem 0.65rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #0f172a;
  white-space: nowrap;
}

.child-card__presence-dot {
  height: 0.4rem;
  width: 0.4rem;
  border-radius: 9999px;
  background: #22c55e;
}

.child-card__presence--alert .child-card__presence-dot {
  background: #f99b4b;
}

.child-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0.3rem 0.65rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.child-badge--blue {
  background: rgb(33 110 194 / 0.1);
  color: #216ec2;
}

.child-badge--green {
  background: rgb(34 197 94 / 0.12);
  color: #15803d;
}

.child-badge--orange {
  background: rgb(249 155 75 / 0.15);
  color: #c2410c;
}

.child-card__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  border-top: 1px solid #e8edf2;
  padding: 0.75rem 1.25rem 1rem;
}

.child-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  background: rgb(33 110 194 / 0.1);
  padding: 0.45rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #216ec2;
  transition: background-color 0.15s ease;
}

.child-card__cta:hover {
  background: rgb(33 110 194 / 0.16);
}

.child-card__cta--reenroll {
  background: #f99b4b;
  color: #fff;
}

.child-card__cta--reenroll:hover {
  background: #e8872f;
}
</style>
