<template>
  <section class="sante">
    <header class="sante__head">
      <div class="sante__head-left">
        <span class="sante__head-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </span>
        <div>
          <h2 class="sante__title">Fiche santé</h2>
          <p class="sante__subtitle">
            Informations médicales de votre enfant, partagées avec l'école.
          </p>
        </div>
      </div>
      <span
        v-if="record && record.awaitingParentSignature && !record.parentSigned"
        class="sante__pending"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" stroke-linecap="round" />
        </svg>
        En attente de votre signature
      </span>
    </header>

    <div v-if="!record" class="sante__empty">
      La fiche santé n'est pas encore disponible.
    </div>

    <div v-else class="sante__grid">
      <section class="sante-card">
        <div class="sante-info-list">
          <div v-for="row in infoRows" :key="row.label" class="sante-info-row">
            <span class="sante-info-row__icon" :class="row.iconClass" aria-hidden="true">
              <component :is="row.icon" />
            </span>
            <div class="sante-info-row__text">
              <p class="sante-info-row__label">{{ row.label }}</p>
              <p class="sante-info-row__value">{{ row.value }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="sante__side">
        <section class="sante-card">
          <header class="sante-card__head">
            <span class="sante-card__head-icon sante-card__head-icon--green" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <h3 class="sante-card__title">Vaccinations</h3>
          </header>

          <ul v-if="record.vaccinations.length" class="sante-vax-list">
            <li v-for="v in record.vaccinations" :key="v.id" class="sante-vax-item">
              <div class="sante-vax-item__left">
                <span
                  class="sante-vax-item__status"
                  :class="v.status === 'DONE' ? 'sante-vax-item__status--done' : 'sante-vax-item__status--missing'"
                  aria-hidden="true"
                >
                  <svg v-if="v.status === 'DONE'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" stroke-linecap="round" />
                  </svg>
                </span>
                <span class="sante-vax-item__name">{{ v.name }}</span>
              </div>
              <span v-if="v.status === 'DONE' && v.dateLabel" class="sante-vax-item__date">{{ v.dateLabel }}</span>
              <span v-else class="sante-vax-item__missing">Manquant</span>
            </li>
          </ul>
          <p v-else class="sante-card__empty">Aucune vaccination renseignée.</p>
        </section>

        <section class="sante-card">
          <header class="sante-card__head">
            <span class="sante-card__head-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </span>
            <h3 class="sante-card__title">Signatures</h3>
          </header>

          <div class="sante-sign-list">
            <div class="sante-sign-block sante-sign-block--school">
              <div class="sante-sign-block__main">
                <span class="sante-sign-block__icon sante-sign-block__icon--green" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <div class="sante-sign-block__text">
                  <p class="sante-sign-block__label">Signature de l'école</p>
                  <template v-if="record.schoolSigned">
                    <p v-if="record.schoolSignedByName" class="sante-sign-block__name">{{ record.schoolSignedByName }}</p>
                    <p v-if="record.schoolSignedAt" class="sante-sign-block__date">{{ formatSignedDate(record.schoolSignedAt) }}</p>
                  </template>
                  <p v-else class="sante-sign-block__dash">—</p>
                </div>
              </div>
              <span v-if="record.schoolSigned" class="sante-sign-badge sante-sign-badge--signed">Signé</span>
            </div>

            <div class="sante-sign-block sante-sign-block--parent">
              <div class="sante-sign-block__main">
                <span class="sante-sign-block__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </span>
                <div class="sante-sign-block__text">
                  <p class="sante-sign-block__label">Votre signature</p>
                  <div v-if="record.parentSigned && record.parentSignatureUrl" class="sante-sign-block__sig-img">
                    <img :src="resolveUploadUrl(record.parentSignatureUrl)" alt="Votre signature">
                    <p v-if="record.parentSignedAt" class="sante-sign-block__date">{{ formatSignedDate(record.parentSignedAt) }}</p>
                  </div>
                  <p v-else class="sante-sign-block__dash">—</p>
                </div>
              </div>
              <button
                v-if="!record.parentSigned"
                type="button"
                class="sante-sign-btn"
                :disabled="signing"
                @click="signModalOpen = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                {{ signing ? 'Envoi…' : 'Signer la fiche' }}
              </button>
              <span v-else class="sante-sign-badge sante-sign-badge--signed">Signé</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="editModalOpen" class="sante-modal" role="presentation">
        <div class="sante-modal__backdrop" aria-hidden="true" @click="closeEditModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-health-title"
          class="sante-modal__panel sante-modal__panel--wide"
          @click.stop
        >
          <h2 id="edit-health-title" class="sante-modal__title">Modifier la fiche santé</h2>
          <p class="sante-modal__sub">Mettez à jour les informations médicales de votre enfant.</p>
          <div class="sante-modal__body sante-modal__body--scroll">
            <EnrollmentStepSante v-model:health="healthDraft" />
          </div>
          <p v-if="editError" class="sante-modal__error">{{ editError }}</p>
          <div class="sante-modal__actions">
            <button type="button" class="sante-modal__cancel" :disabled="saving" @click="closeEditModal">
              Annuler
            </button>
            <button
              type="button"
              class="sante-modal__confirm sante-modal__confirm--orange"
              :disabled="saving"
              @click="submitEdit"
            >
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="signModalOpen" class="sante-modal" role="presentation">
        <div class="sante-modal__backdrop" aria-hidden="true" @click="closeSignModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-health-title"
          class="sante-modal__panel"
          @click.stop
        >
          <h2 id="sign-health-title" class="sante-modal__title">Signer la fiche santé</h2>
          <p class="sante-modal__sub">Dessinez ou importez votre signature pour valider la fiche.</p>
          <div class="sante-modal__body">
            <EnrollmentParentSignature v-model:signature-data-url="signatureDataUrl" />
          </div>
          <p v-if="signError" class="sante-modal__error">{{ signError }}</p>
          <div class="sante-modal__actions">
            <button type="button" class="sante-modal__cancel" :disabled="signing" @click="closeSignModal">
              Annuler
            </button>
            <button
              type="button"
              class="sante-modal__confirm"
              :disabled="signing || !signatureDataUrl"
              @click="submitSignature"
            >
              {{ signing ? 'Envoi…' : 'Confirmer la signature' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue';
import type { EnrollmentHealthDraft } from '~/composables/useEnrollmentWizard';
import { bloodGroupLabel, healthToApiPayload } from '~/utils/enrollment-health';
import { healthRecordToEnrollmentDraft } from '~/utils/parent-health-mapper';
import type { HealthRecord } from './types';

const props = defineProps<{
  childId: string;
  record: HealthRecord | null;
}>();

const emit = defineEmits<{
  signed: [record: HealthRecord];
  updated: [record: HealthRecord];
}>();

const config = useRuntimeConfig();
const { authFetch } = useParentAuth();

const editModalOpen = ref(false);
const healthDraft = ref<EnrollmentHealthDraft>(healthRecordToEnrollmentDraft(null));
const saving = ref(false);
const editError = ref<string | null>(null);

const signModalOpen = ref(false);
const signatureDataUrl = ref('');
const signing = ref(false);
const signError = ref<string | null>(null);

const iconBlood = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z' }),
  ]);
const iconUser = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' }),
  ]);
const iconPhone = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
    }),
  ]);
const iconAlert = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '9' }),
    h('path', { d: 'M12 8v4M12 16h.01', 'stroke-linecap': 'round' }),
  ]);
const iconFood = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 20c-4 0-7-2-7-5V6c0-1.1.9-2 2-2h1v11M12 20c4 0 7-2 7-5V6c0-1.1-.9-2-2-2h-1v11' }),
    h('path', { d: 'M12 4V2' }),
  ]);
const iconPill = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z' }),
    h('line', { x1: '8.5', y1: '8.5', x2: '15.5', y2: '15.5' }),
  ]);
const iconTeam = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '9', cy: '7', r: '4' }),
    h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }),
  ]);

const infoRows = computed(() => {
  const r = props.record;
  if (!r) return [];
  const dash = (v: string) => v?.trim() || '—';
  const blood = r.bloodGroup?.trim();
  return [
    {
      label: 'Groupe sanguin',
      value: blood ? bloodGroupLabel(blood) : '—',
      icon: iconBlood,
      iconClass: 'sante-info-row__icon--rose',
    },
    { label: 'Médecin traitant', value: dash(r.doctorName), icon: iconUser, iconClass: 'sante-info-row__icon--blue' },
    { label: 'Téléphone médecin', value: dash(r.doctorPhone), icon: iconPhone, iconClass: 'sante-info-row__icon--blue' },
    { label: 'Allergies connues', value: dash(r.knownAllergies), icon: iconAlert, iconClass: 'sante-info-row__icon--amber' },
    { label: 'Régime alimentaire', value: dash(r.dietaryRegime), icon: iconFood, iconClass: 'sante-info-row__icon--green' },
    { label: 'Traitements en cours', value: dash(r.ongoingTreatments), icon: iconPill, iconClass: 'sante-info-row__icon--violet' },
    { label: "Consigne à l'équipe", value: dash(r.instructions), icon: iconTeam, iconClass: 'sante-info-row__icon--blue' },
  ];
});

function resolveUploadUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const base = String(config.public.apiBase ?? '').replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function formatSignedDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `Signé le ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
}

function openEditModal() {
  healthDraft.value = healthRecordToEnrollmentDraft(props.record);
  editError.value = null;
  editModalOpen.value = true;
}

function closeEditModal(force = false) {
  if (!force && saving.value) return;
  editModalOpen.value = false;
  editError.value = null;
}

async function submitEdit() {
  saving.value = true;
  editError.value = null;
  try {
    const updated = await authFetch<HealthRecord>(`/parent/children/${props.childId}/health-record`, {
      method: 'PATCH',
      body: healthToApiPayload(healthDraft.value),
    });
    emit('updated', updated);
    closeEditModal(true);
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const m = err?.data?.message;
    editError.value = Array.isArray(m) ? m.join(' ') : m || 'Mise à jour impossible.';
  } finally {
    saving.value = false;
  }
}

function closeSignModal(force = false) {
  if (!force && signing.value) return;
  signModalOpen.value = false;
  signatureDataUrl.value = '';
  signError.value = null;
}

async function submitSignature() {
  if (!signatureDataUrl.value) return;
  signing.value = true;
  signError.value = null;
  try {
    const updated = await authFetch<HealthRecord>(
      `/parent/children/${props.childId}/health-record/sign`,
      {
        method: 'POST',
        body: { signatureDataUrl: signatureDataUrl.value },
      },
    );
    emit('signed', updated);
    emit('updated', updated);
    closeSignModal(true);
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const m = err?.data?.message;
    signError.value = Array.isArray(m) ? m.join(' ') : m || 'Signature impossible.';
  } finally {
    signing.value = false;
  }
}

defineExpose({ openEditModal });
</script>

<style scoped>
.sante__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.sante__head-left {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.sante__head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background: #fff1f2;
  color: #f97316;
}

.sante__head-icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.sante__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.sante__subtitle {
  margin-top: 0.2rem;
  font-size: 0.8125rem;
  color: #64748b;
  line-height: 1.45;
}

.sante__pending {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 9999px;
  background: #fff7ed;
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ea580c;
  white-space: nowrap;
}

.sante__pending svg {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}

.sante__empty {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 4rem 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #94a3b8;
}

.sante__grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .sante__grid {
    grid-template-columns: minmax(0, 1fr) 360px;
    align-items: start;
  }
}

.sante__side {
  display: grid;
  gap: 1rem;
}

.sante-card {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 1rem 1.125rem 1.125rem;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.sante-card__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
}

.sante-card__head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: #eff6ff;
  color: #216ec2;
}

.sante-card__head-icon--green {
  background: #ecfdf5;
  color: #16a34a;
}

.sante-card__head-icon svg {
  width: 1rem;
  height: 1rem;
}

.sante-card__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
}

.sante-card__empty {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.sante-info-list {
  display: grid;
  gap: 0.5rem;
}

.sante-info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 0.75rem;
  background: #f6f8fb;
  padding: 0.75rem 0.875rem;
}

.sante-info-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #fff;
}

.sante-info-row__icon :deep(svg) {
  width: 1rem;
  height: 1rem;
}

.sante-info-row__icon--rose { color: #e11d48; }
.sante-info-row__icon--blue { color: #216ec2; }
.sante-info-row__icon--amber { color: #d97706; }
.sante-info-row__icon--green { color: #16a34a; }
.sante-info-row__icon--violet { color: #7c3aed; }

.sante-info-row__label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #94a3b8;
}

.sante-info-row__value {
  margin-top: 0.1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
  white-space: pre-wrap;
}

.sante-vax-list {
  display: grid;
  gap: 0;
}

.sante-vax-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.sante-vax-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.sante-vax-item__left {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.sante-vax-item__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.sante-vax-item__status svg {
  width: 0.8rem;
  height: 0.8rem;
}

.sante-vax-item__status--done {
  background: #dcfce7;
  color: #16a34a;
}

.sante-vax-item__status--missing {
  background: #fff7ed;
  color: #ea580c;
}

.sante-vax-item__name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.sante-vax-item__date {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-align: right;
}

.sante-vax-item__missing {
  border-radius: 9999px;
  background: #fff7ed;
  padding: 0.2rem 0.55rem;
  font-size: 0.6875rem;
  font-weight: 700;
  color: #ea580c;
  white-space: nowrap;
}

.sante-sign-list {
  display: grid;
  gap: 0.625rem;
}

.sante-sign-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-radius: 0.75rem;
  padding: 0.75rem 0.875rem;
}

.sante-sign-block--school {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}

.sante-sign-block--parent {
  background: #f6f8fb;
  border: 1px solid #e8edf2;
}

.sante-sign-block__main {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  min-width: 0;
  flex: 1;
}

.sante-sign-block__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: #e2e8f0;
  color: #64748b;
}

.sante-sign-block__icon--green {
  background: #dcfce7;
  color: #16a34a;
}

.sante-sign-block__icon svg {
  width: 0.9rem;
  height: 0.9rem;
}

.sante-sign-block__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.sante-sign-block__name {
  margin-top: 0.1rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #0f172a;
}

.sante-sign-block__date {
  margin-top: 0.1rem;
  font-size: 0.6875rem;
  color: #64748b;
}

.sante-sign-block__dash {
  margin-top: 0.15rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.sante-sign-block__sig-img img {
  margin-top: 0.35rem;
  max-height: 3.5rem;
  max-width: 100%;
  object-fit: contain;
}

.sante-sign-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.6875rem;
  font-weight: 700;
}

.sante-sign-badge--signed {
  background: #dcfce7;
  color: #15803d;
}

.sante-sign-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
  background: #216ec2;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  transition: filter 0.15s ease;
}

.sante-sign-btn svg {
  width: 0.8rem;
  height: 0.8rem;
}

.sante-sign-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.sante-sign-btn:disabled {
  opacity: 0.6;
}

.sante-modal {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.sante-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
}

.sante-modal__panel {
  position: relative;
  width: 100%;
  max-width: 32rem;
  border-radius: 1rem;
  background: #fff;
  padding: 1.5rem;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
}

.sante-modal__panel--wide {
  max-width: 44rem;
  max-height: min(90vh, 52rem);
  display: flex;
  flex-direction: column;
}

.sante-modal__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #216ec2;
}

.sante-modal__sub {
  margin-top: 0.35rem;
  font-size: 0.875rem;
  color: #64748b;
}

.sante-modal__body {
  margin-top: 1.25rem;
}

.sante-modal__body--scroll {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 0.25rem;
}

.sante-modal__error {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #dc2626;
}

.sante-modal__actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .sante-modal__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.sante-modal__cancel {
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.sante-modal__confirm {
  border-radius: 0.75rem;
  background: #216ec2;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
}

.sante-modal__confirm--orange {
  background: #ea580c;
}

.sante-modal__confirm:disabled {
  opacity: 0.5;
}
</style>
