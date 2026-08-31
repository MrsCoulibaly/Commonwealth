<template>
  <div class="space-y-8">
    <div class="grid gap-4 sm:grid-cols-2">
      <EnrollmentField label="Médecin référent" required>
        <input
          id="enrollment-doctor-name"
          v-model.trim="health.doctorName"
          type="text"
          class="enrollment-input"
          placeholder="Dr. Aminata Koné"
        />
      </EnrollmentField>
      <EnrollmentField label="Téléphone du cabinet" required>
        <input
          id="enrollment-doctor-phone"
          v-model.trim="health.doctorPhone"
          type="tel"
          class="enrollment-input"
          placeholder="(225) 07 88 12 34"
        />
      </EnrollmentField>
    </div>

    <div>
      <EnrollmentField id="enrollment-blood-group" label="Groupe sanguin" required>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          <button
            v-for="group in bloodGroups"
            :key="group"
            type="button"
            class="rounded-lg border px-2 py-2.5 text-center text-sm font-semibold transition"
            :class="
              health.bloodGroup === group
                ? 'border-rose-400 bg-rose-50 text-rose-700 ring-1 ring-rose-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            "
            @click="health.bloodGroup = group"
          >
            {{ bloodGroupLabel(group) }}
          </button>
        </div>
      </EnrollmentField>
    </div>

    <div>
      <EnrollmentFamilySectionHeader title="Allergies & traitements" tone="rose" />

      <div
        class="mb-4 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-800"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p>
          Allergies connues. En cas d'allergie grave, un protocole d'urgence est établi avec les parents avant la
          première journée.
        </p>
      </div>

      <div class="space-y-4">
        <EnrollmentField label="Allergène(s) — réaction — gravité">
          <textarea
            v-model.trim="health.knownAllergies"
            class="enrollment-textarea min-h-[100px]"
            rows="4"
            placeholder="Poussière — réaction respiratoire — à surveiller"
          />
        </EnrollmentField>
        <EnrollmentField label="Traitements en cours">
          <input
            v-model.trim="health.ongoingTreatments"
            type="text"
            class="enrollment-input"
            placeholder="Crème hydratante (eczéma) — application au besoin"
          />
        </EnrollmentField>
      </div>

      <div
        class="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" stroke-linecap="round" />
        </svg>
        <p>
          Règle Commonwealth : aucun médicament n'est administré sans ordonnance écrite ET autorisation parentale
          signée dans l'espace parents.
        </p>
      </div>
    </div>

    <div>
      <EnrollmentFamilySectionHeader title="Vaccinations" tone="blue" />

      <div class="space-y-3">
        <div
          v-for="vaccine in health.vaccinations"
          :key="vaccine.id"
          class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              :class="vaccinationStatus(vaccine.administeredAt) === 'up-to-date' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'"
            >
              <svg
                v-if="vaccinationStatus(vaccine.administeredAt) === 'up-to-date'"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg
                v-else
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 6v6l3 2" stroke-linecap="round" />
              </svg>
            </span>
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900">{{ vaccine.label }}</p>
              <p class="text-xs text-slate-500">{{ formatHealthDateFr(vaccine.administeredAt) }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 sm:justify-end">
            <input
              v-model="vaccine.administeredAt"
              type="date"
              class="enrollment-input h-9 w-full min-w-[148px] max-w-[180px] [color-scheme:light]"
              :placeholder="'À programmer'"
            />
            <span
              class="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              :class="
                vaccinationStatus(vaccine.administeredAt) === 'up-to-date'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              "
            >
              {{ vaccinationStatus(vaccine.administeredAt) === 'up-to-date' ? 'À jour' : 'Manquant' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <EnrollmentField label="Régime alimentaire">
        <input
          v-model.trim="health.dietaryRegime"
          type="text"
          class="enrollment-input"
          placeholder="Aucun aliment à base de mangue (allergie)"
        />
      </EnrollmentField>
      <EnrollmentField label="Consigne équipe">
        <input
          v-model.trim="health.instructions"
          type="text"
          class="enrollment-input"
          placeholder="Prévenir les parents si fièvre > 38,5 °C"
        />
      </EnrollmentField>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrollmentHealthDraft } from '~/composables/useEnrollmentWizard';
import {
  bloodGroupLabel,
  ENROLLMENT_BLOOD_GROUPS,
  formatHealthDateFr,
  vaccinationStatus,
} from '~/utils/enrollment-health';

const health = defineModel<EnrollmentHealthDraft>('health', { required: true });

const bloodGroups = ENROLLMENT_BLOOD_GROUPS;
</script>
