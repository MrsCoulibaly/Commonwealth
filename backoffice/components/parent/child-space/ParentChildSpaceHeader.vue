<template>
  <section class="child-header">
    <div class="child-header__banner">
      <h1 class="child-header__name">{{ child.fullName }}</h1>
    </div>

    <div class="child-header__body">
      <div class="child-header__avatar" aria-hidden="true">
        <img
          v-if="child.photoUrl"
          :src="child.photoUrl"
          :alt="child.fullName"
          class="child-header__avatar-img"
        >
        <template v-else>{{ initials }}</template>
      </div>

      <div class="child-header__row">
        <div class="child-header__details">
          <p class="child-header__meta">{{ subtitleLine }}</p>

          <div class="child-header__badges">
            <span v-if="presenceLabel" class="child-badge child-badge--presence">
              <span class="child-badge__dot" aria-hidden="true" />
              {{ presenceLabel }}
            </span>
            <span v-if="enrollment?.levelName" class="child-badge child-badge--level">
              <svg class="child-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
              </svg>
              {{ enrollment.levelName }}
            </span>
            <span v-if="enrollment?.schoolYear" class="child-badge child-badge--year">
              <svg class="child-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
              </svg>
              {{ enrollment.schoolYear }}
            </span>
            <span v-if="enrollment?.headTeacher" class="child-badge child-badge--teacher">
              <svg class="child-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {{ enrollment.headTeacher }}
            </span>
          </div>
        </div>

        <NuxtLink
          v-if="activeTab !== 'sante'"
          :to="`/parent/enfants/${child.id}/modifier`"
          class="child-header__edit"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Modifier la fiche
        </NuxtLink>
        <button
          v-else
          type="button"
          class="child-header__edit"
          @click="emit('edit-fiche')"
        >
          <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Modifier la fiche
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChildSpaceChild, ChildSpaceEnrollment, ChildSpaceTabId } from './types';

const props = defineProps<{
  child: ChildSpaceChild;
  enrollment: ChildSpaceEnrollment | null;
  presenceLabel: string | null;
  activeTab: ChildSpaceTabId;
}>();

const emit = defineEmits<{
  'edit-fiche': [];
}>();

const initials = computed(() => {
  const a = props.child.firstName?.trim()?.[0] ?? '';
  const b = props.child.lastName?.trim()?.[0] ?? '';
  return `${a}${b}`.toUpperCase() || '?';
});

const subtitleLine = computed(() => {
  const level = props.enrollment?.levelName?.trim() || '';
  const classroom = props.enrollment?.className?.trim() || '';
  const classPart = classroom && classroom !== level ? classroom : '';
  const parts = [
    level || classPart || null,
    classPart && level ? classPart : null,
    props.child.ageLabel,
    props.child.genderLabel,
    props.child.matricule,
  ].filter((p) => p && p !== '—');
  return parts.length ? parts.join(' · ') : '—';
});
</script>

<style scoped>
.child-header {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
}

.child-header__banner {
  display: flex;
  align-items: flex-end;
  height: 4.75rem;
  background: #216ec2;
  padding: 0 1.5rem 0.875rem calc(1.5rem + 6.5rem);
}

.child-header__name {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
}

.child-header__body {
  position: relative;
  padding: 0.625rem 1.5rem 1.25rem;
}

.child-header__avatar {
  position: absolute;
  top: -2.75rem;
  left: 1.5rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 5.5rem;
  height: 5.5rem;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 4px solid #fff;
  background: #216ec2;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(33, 110, 194, 0.28);
}

.child-header__avatar-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.child-header__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  padding-left: 6.5rem;
}

.child-header__meta {
  font-size: 0.875rem;
  color: #64748b;
}

.child-header__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.child-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
}

.child-badge--presence {
  background: #ecfdf5;
  color: #047857;
}

.child-badge__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #10b981;
}

.child-badge--level {
  background: #eff6ff;
  color: #216ec2;
}

.child-badge--year {
  background: #eff6ff;
  color: #1d4ed8;
}

.child-badge--teacher {
  background: #f1f5f9;
  color: #475569;
}

.child-badge__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.child-header__edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
}

.child-header__edit:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 640px) {
  .child-header__banner {
    height: auto;
    min-height: 4.25rem;
    padding: 1rem 1.25rem 0.75rem calc(1.25rem + 5.25rem);
  }

  .child-header__body {
    padding: 0.75rem 1.25rem 1.25rem;
  }

  .child-header__avatar {
    top: -2.5rem;
    width: 4.75rem;
    height: 4.75rem;
    font-size: 1.25rem;
  }

  .child-header__row {
    padding-left: 0;
    padding-top: 2.75rem;
  }

  .child-header__edit {
    width: 100%;
  }
}
</style>
