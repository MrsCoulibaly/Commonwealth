<template>
  <div>
    <EnrollmentWizardHeader
      :school-year-label="schoolYearLabel"
      :matricule="child.matricule"
      :back-to="backTo"
      :back-label="backLabel"
    />

    <main class="mx-auto max-w-[920px] px-5 py-8">
      <div v-if="!submitted">
        <div class="mb-7">
          <div class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#216EC2]">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Inscriptions
          </div>

          <h1 class="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">
            {{ isReenrollment ? 'Réinscription' : 'Nouvelle inscription' }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Dossier {{ isReenrollment ? 'de réinscription' : "d'inscription" }} de
            <span class="font-semibold text-slate-700">{{ childDisplayName }}</span>
            pour l'année scolaire
            <span class="font-semibold text-slate-700">{{ schoolYearLabel }}</span>.
            Complétez les 5 étapes puis validez le dossier.
          </p>
        </div>

        <EnrollmentStepper :current-step="step" :is-step-done="isStepDone" />

        <div class="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div class="px-6 pb-2 pt-6 sm:px-8 sm:pt-7">
            <div class="flex items-start gap-3.5">
              <div
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]"
              >
                <component :is="stepIcon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1 pt-0.5">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-[17px] font-bold text-slate-900">{{ stepTitle }}</h2>
                  <span
                    v-if="step === 3"
                    class="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700"
                  >
                    Confidentiel
                  </span>
                </div>
                <p class="mt-0.5 text-sm text-slate-500">{{ stepSubtitle }}</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-6 sm:px-8">
            <div
              v-if="submitError"
              ref="errorAlert"
              id="enrollment-submit-error"
              class="mb-5 scroll-mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
              tabindex="-1"
            >
              {{ submitError }}
            </div>

            <EnrollmentStepEnfant v-if="step === 1" v-model:child="child" />
            <EnrollmentStepFamille
              v-else-if="step === 2"
              v-model:parent="parent"
              v-model:guardian2="guardian2"
              v-model:emergency="emergency"
              :parent-account-locked="enrollmentFromParentAccount"
            />
            <EnrollmentStepSante v-else-if="step === 3" v-model:health="health" />
            <EnrollmentStepOptions
              v-else-if="step === 4"
              v-model:options="options"
              :level-id="child.levelId"
            />
            <EnrollmentStepValidation
              v-else
              v-model:engagement="engagement"
              :child="child"
              :parent="parent"
              :emergency="emergency"
              :health="health"
              :options="options"
              @edit="goToStep"
            />
          </div>

          <div class="border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">
            <EnrollmentNavFooter
              :current-step="step"
              :submitting="submitting"
              :error="submitError"
              @prev="prev"
              @next="onNext"
              @submit="onSubmit"
            />
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
      >
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900">Demande enregistrée</h2>
        <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Merci ! Votre demande a été enregistrée. L'administration vous contactera sous 48 h. Vous recevrez
          un e-mail récapitulatif.
        </p>
        <NuxtLink
          :to="backTo"
          class="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ backLabel }}
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue';
import type { EnrollmentStepId } from '~/composables/useEnrollmentWizard';

definePageMeta({
  layout: 'enrollment',
});

const {
  step,
  submitted,
  submitting,
  submitError,
  child,
  parent,
  guardian2,
  emergency,
  health,
  options,
  engagement,
  enrollmentFromParentAccount,
  schoolYearLabel,
  childDisplayName,
  stepTitle,
  stepSubtitle,
  isStepDone,
  next,
  prev,
  goToStep,
  submit,
} = useEnrollmentWizard();

const route = useRoute();
const fromParent = computed(() => String(route.query.from ?? '') === 'parent');
const isReenrollment = computed(() => fromParent.value && Boolean(String(route.query.child ?? '').trim()));
const backTo = computed(() => (fromParent.value ? '/parent/enfants' : '/'));
const backLabel = computed(() => (fromParent.value ? 'Retour à l\'espace parent' : 'Retour'));

useHead({
  title: computed(() => {
    const kind = isReenrollment.value ? 'Réinscription' : 'Nouvelle inscription';
    return childDisplayName.value !== 'votre enfant'
      ? `${kind} — ${childDisplayName.value}`
      : kind;
  }),
});

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.75,
} as const;

const stepIcons: Record<EnrollmentStepId, FunctionalComponent> = {
  1: () =>
    h('svg', iconProps, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 12, cy: 7, r: 4 }),
    ]),
  2: () =>
    h('svg', iconProps, [
      h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 9, cy: 7, r: 4 }),
      h('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }),
    ]),
  3: () =>
    h('svg', iconProps, [
      h('path', {
        d: 'M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 0 1 7.5 6.566z',
      }),
    ]),
  4: () =>
    h('svg', iconProps, [
      h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
    ]),
  5: () =>
    h('svg', iconProps, [
      h('path', {
        d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2',
      }),
      h('rect', { x: 9, y: 3, width: 6, height: 4, rx: 1 }),
      h('path', { d: 'M9 14l2 2 4-4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
    ]),
};

const stepIcon = computed(() => stepIcons[step.value]);

const errorAlert = ref<HTMLElement | null>(null);

function fieldIdForError(message: string): string | null {
  const m = message.toLowerCase();
  if (m.includes('engagement')) return 'enrollment-certified';
  if (m.includes('lieu de signature')) return 'enrollment-signed-place';
  if (m.includes('date de signature')) return 'enrollment-signed-at';
  if (m.includes('dessinez') || m.includes('importez votre signature') || m.includes('signature')) {
    return 'enrollment-signature';
  }
  if (m.includes('classe demandée')) return 'enrollment-level';
  if (m.includes('formule horaire')) return 'enrollment-schedule';
  if (m.includes('date de naissance')) return 'enrollment-birth-date';
  if (m.includes('prénom et le nom de famille')) return 'enrollment-child-first-name';
  if (m.includes('responsable 1')) return 'enrollment-parent-name';
  if (m.includes('lien avec')) return 'enrollment-parent-relation';
  if (m.includes('adresse e-mail')) return 'enrollment-parent-email';
  if (m.includes('numéro de téléphone')) return 'enrollment-parent-phone';
  if (m.includes('contact d’urgence') || m.includes("contact d'urgence") || m.includes('responsable 2')) {
    return 'enrollment-emergency';
  }
  if (m.includes('médecin')) return 'enrollment-doctor-name';
  if (m.includes('téléphone du cabinet')) return 'enrollment-doctor-phone';
  if (m.includes('groupe sanguin')) return 'enrollment-blood-group';
  return null;
}

async function scrollToEnrollmentError() {
  if (!submitError.value) return;
  await nextTick();
  await nextTick();
  const fieldId = fieldIdForError(submitError.value);
  const field = fieldId ? document.getElementById(fieldId) : null;
  const target = field ?? errorAlert.value;
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!field) {
    errorAlert.value?.focus({ preventScroll: true });
  }
}

watch(submitError, (msg) => {
  if (msg) void scrollToEnrollmentError();
});

watch(step, () => {
  if (submitError.value) void scrollToEnrollmentError();
});

async function onNext() {
  await next();
  if (submitError.value) void scrollToEnrollmentError();
}

async function onSubmit() {
  await submit();
  if (submitError.value) void scrollToEnrollmentError();
}
</script>
