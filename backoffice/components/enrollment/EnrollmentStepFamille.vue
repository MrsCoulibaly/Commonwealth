<template>
  <div class="space-y-8">
    <div>
      <EnrollmentFamilySectionHeader title="Parent / Responsable 1" tone="blue" />

      <p
        v-if="parentAccountLocked"
        class="mb-4 rounded-lg border border-brandBlue/20 bg-brandBlue/5 px-3 py-2 text-xs leading-relaxed text-slate-600"
      >
        Vos informations de compte sont reprises automatiquement. L'e-mail ne peut pas être modifié.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <EnrollmentField label="Prénom et nom" required>
        <input
          id="enrollment-parent-name"
          v-model.trim="parent.fullName"
          type="text"
          class="enrollment-input"
          placeholder="Paul Howard"
          autocomplete="name"
        />
        </EnrollmentField>
        <EnrollmentField label="Lien avec l'enfant" required>
          <select id="enrollment-parent-relation" v-model="parent.relation" class="enrollment-input bg-white">
            <option value="" disabled>Sélectionner</option>
            <option value="FATHER">Père</option>
            <option value="MOTHER">Mère</option>
          </select>
        </EnrollmentField>
        <EnrollmentField label="Téléphone principal" required>
        <input
          id="enrollment-parent-phone"
          v-model.trim="parent.phone"
          type="tel"
          class="enrollment-input"
          placeholder="(307) 555-0133"
          autocomplete="tel"
        />
        </EnrollmentField>
        <EnrollmentField label="E-mail" required>
        <input
          id="enrollment-parent-email"
          v-model.trim="parent.email"
          type="email"
          class="enrollment-input"
          :class="{ 'bg-slate-50 text-slate-600': parentAccountLocked }"
          placeholder="email@exemple.com"
          autocomplete="email"
          :readonly="parentAccountLocked"
        />
        </EnrollmentField>
        <EnrollmentField label="Profession">
          <input
            v-model.trim="parent.profession"
            type="text"
            class="enrollment-input"
            placeholder="—"
          />
        </EnrollmentField>
        <EnrollmentField label="Adresse du domicile">
          <input
            v-model.trim="parent.address"
            type="text"
            class="enrollment-input"
            placeholder="Rue, ville, pays…"
            autocomplete="street-address"
          />
        </EnrollmentField>
      </div>
    </div>

    <div>
      <EnrollmentFamilySectionHeader title="Parent / Responsable 2" tone="amber" optional />

      <div class="grid gap-4 sm:grid-cols-2">
        <EnrollmentField label="Prénom et nom">
          <input
            v-model.trim="guardian2.fullName"
            type="text"
            class="enrollment-input"
            placeholder="—"
          />
        </EnrollmentField>
        <EnrollmentField label="Lien avec l'enfant">
          <select v-model="guardian2.relation" class="enrollment-input bg-white">
            <option value="">Sélectionner</option>
            <option value="Père">Père</option>
            <option value="Mère">Mère</option>
            <option value="Tuteur légal">Tuteur légal</option>
            <option value="Autre">Autre</option>
          </select>
        </EnrollmentField>
        <EnrollmentField label="Téléphone principal">
          <input
            v-model.trim="guardian2.phone"
            type="tel"
            class="enrollment-input"
            placeholder="+225"
          />
        </EnrollmentField>
        <EnrollmentField label="E-mail">
          <input
            v-model.trim="guardian2.email"
            type="email"
            class="enrollment-input"
            placeholder="—"
          />
        </EnrollmentField>
      </div>
    </div>

    <div>
      <EnrollmentFamilySectionHeader title="Contact d'urgence" tone="blue" />

      <div
        class="mb-4 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-800"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p>
          Personne contactée si les parents sont injoignables — seule personne autorisée à récupérer l'enfant en dehors
          des parents.
        </p>
      </div>

      <EnrollmentField id="enrollment-emergency" label="Reprendre un responsable déjà saisi" required>
        <div class="grid gap-3 sm:grid-cols-3">
          <button
            v-for="choice in emergencyChoices"
            :key="choice.id"
            type="button"
            class="enrollment-choice-card flex-col items-start !gap-2 !py-3.5"
            :class="[
              emergency.source === choice.id ? 'enrollment-choice-card--selected' : 'enrollment-choice-card--default',
              choice.disabled ? 'cursor-not-allowed opacity-45' : '',
            ]"
            :disabled="choice.disabled"
            @click="selectEmergencySource(choice.id)"
          >
            <div class="flex w-full items-center gap-2.5">
              <span
                class="enrollment-radio"
                :class="emergency.source === choice.id ? 'enrollment-radio--selected' : 'enrollment-radio--default'"
              >
                <svg
                  v-if="emergency.source === choice.id"
                  class="h-2.5 w-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="text-[13px] font-bold text-slate-900">{{ choice.label }}</span>
            </div>
            <span v-if="choice.hint" class="pl-[30px] text-left text-[11px] text-slate-500">{{ choice.hint }}</span>
          </button>
        </div>
      </EnrollmentField>

      <div
        v-if="emergency.source === 'GUARDIAN1' || emergency.source === 'GUARDIAN2'"
        class="mt-4 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3.5"
      >
        <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">Coordonnées reprises</p>
        <dl class="mt-2 grid gap-2 sm:grid-cols-3">
          <div>
            <dt class="text-[10px] font-semibold uppercase text-slate-400">Nom</dt>
            <dd class="text-sm font-medium text-slate-800">{{ emergency.fullName || '—' }}</dd>
          </div>
          <div>
            <dt class="text-[10px] font-semibold uppercase text-slate-400">Lien</dt>
            <dd class="text-sm font-medium text-slate-800">{{ emergency.relation || '—' }}</dd>
          </div>
          <div>
            <dt class="text-[10px] font-semibold uppercase text-slate-400">Téléphone</dt>
            <dd class="text-sm font-medium text-slate-800">{{ emergency.phone || '—' }}</dd>
          </div>
        </dl>
      </div>

      <div v-else-if="emergency.source === 'OTHER'" class="mt-4 grid gap-4 sm:grid-cols-3">
        <EnrollmentField label="Prénom et nom" required>
          <input
            v-model.trim="emergency.fullName"
            type="text"
            class="enrollment-input"
            placeholder="À renseigner"
          />
        </EnrollmentField>
        <EnrollmentField label="Lien avec l'enfant">
          <input
            v-model.trim="emergency.relation"
            type="text"
            class="enrollment-input"
            placeholder="Grand-mère, oncle…"
          />
        </EnrollmentField>
        <EnrollmentField label="Téléphone" required>
          <input
            v-model.trim="emergency.phone"
            type="tel"
            class="enrollment-input"
            placeholder="{{ schoolPhone }}"
          />
        </EnrollmentField>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  EnrollmentEmergencyDraft,
  EnrollmentGuardian2Draft,
  EnrollmentParentDraft,
} from '~/composables/useEnrollmentWizard';
import {
  guardian2IsFilled,
  parentRelationLabel,
  syncEmergencyFromSource,
} from '~/utils/enrollment-family';
import { useSchoolContact } from '~/composables/useSchoolContact';

type EmergencySource = EnrollmentEmergencyDraft['source'];

const parent = defineModel<EnrollmentParentDraft>('parent', { required: true });
const guardian2 = defineModel<EnrollmentGuardian2Draft>('guardian2', { required: true });
const emergency = defineModel<EnrollmentEmergencyDraft>('emergency', { required: true });

const schoolPhone = useSchoolContact().value.phone;

defineProps<{
  parentAccountLocked?: boolean;
}>();

const guardian1Hint = computed(() => {
  const name = parent.value.fullName.trim();
  const relation = parentRelationLabel(parent.value.relation);
  if (name && relation) return `${name} · ${relation}`;
  if (name) return name;
  return 'Renseignez le responsable 1 ci-dessus';
});

const guardian2Hint = computed(() => {
  const name = guardian2.value.fullName.trim();
  const relation = guardian2.value.relation.trim();
  if (name && relation) return `${name} · ${relation}`;
  if (name) return name;
  return 'Renseignez le responsable 2 ci-dessus';
});

const emergencyChoices = computed(() => [
  {
    id: 'GUARDIAN1' as const,
    label: 'Responsable 1',
    hint: guardian1Hint.value,
    disabled: false,
  },
  {
    id: 'GUARDIAN2' as const,
    label: 'Responsable 2',
    hint: guardian2Hint.value,
    disabled: !guardian2IsFilled(guardian2.value),
  },
  {
    id: 'OTHER' as const,
    label: 'Autre personne',
    hint: 'Saisie manuelle',
    disabled: false,
  },
]);

function selectEmergencySource(source: EmergencySource) {
  if (source === 'GUARDIAN2' && !guardian2IsFilled(guardian2.value)) return;
  emergency.value.source = source;
  if (source === 'OTHER') {
    emergency.value.fullName = '';
    emergency.value.relation = '';
    emergency.value.phone = '';
    return;
  }
  syncEmergencyFromSource(emergency.value, parent.value, guardian2.value);
}

watch(
  () => [
    parent.value.fullName,
    parent.value.relation,
    parent.value.phone,
    guardian2.value.fullName,
    guardian2.value.relation,
    guardian2.value.phone,
    emergency.value.source,
  ],
  () => {
    if (emergency.value.source === 'GUARDIAN1' || emergency.value.source === 'GUARDIAN2') {
      syncEmergencyFromSource(emergency.value, parent.value, guardian2.value);
    }
    if (emergency.value.source === 'GUARDIAN2' && !guardian2IsFilled(guardian2.value)) {
      emergency.value.source = '';
      emergency.value.fullName = '';
      emergency.value.relation = '';
      emergency.value.phone = '';
    }
  },
);
</script>
