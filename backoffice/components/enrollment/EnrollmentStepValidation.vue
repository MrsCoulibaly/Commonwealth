<template>
  <div class="enrollment-recap">
    <EnrollmentRecapCard title="Enfant" @edit="$emit('edit', 1)">
      <template #icon>
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </template>
      <EnrollmentRecapRow label="Nom complet" :value="childFullName" />
      <EnrollmentRecapRow label="Né(e) le" :value="birthLine" />
      <EnrollmentRecapRow label="Classe demandée" :value="classLine" />
      <EnrollmentRecapRow label="Matricule" :value="child.matricule || '—'" />
    </EnrollmentRecapCard>

    <EnrollmentRecapCard title="Famille & contacts" @edit="$emit('edit', 2)">
      <template #icon>
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </template>
      <EnrollmentRecapRow label="Responsable 1" :value="guardian1Line" />
      <EnrollmentRecapRow label="Téléphone · E-mail" :value="contactLine" />
      <EnrollmentRecapRow label="Urgence" :value="emergency.phone || '—'" />
    </EnrollmentRecapCard>

    <EnrollmentRecapCard title="Santé" icon-class="text-rose-500" @edit="$emit('edit', 3)">
      <template #icon>
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 0 1 7.5 6.566z" />
        </svg>
      </template>
      <EnrollmentRecapRow label="Groupe sanguin · Médecin" :value="healthLine" />
      <EnrollmentRecapRow v-if="allergyTags.length || treatmentTag" label="Allergies">
        <div class="recap-tags recap-tags--end">
          <span v-for="tag in allergyTags" :key="tag" class="recap-tag recap-tag--rose">{{ tag }}</span>
          <span v-if="treatmentTag" class="recap-tag recap-tag--amber">{{ treatmentTag }}</span>
        </div>
      </EnrollmentRecapRow>
      <EnrollmentRecapRow label="Vaccins">
        <div class="recap-tags recap-tags--end">
          <span
            v-for="tag in vaccineTags"
            :key="tag.label"
            class="recap-tag"
            :class="tag.missing ? 'recap-tag--amber' : 'recap-tag--green'"
          >{{ tag.label }}</span>
          <span v-if="!vaccineTags.length" class="text-sm font-medium text-slate-500">—</span>
        </div>
      </EnrollmentRecapRow>
    </EnrollmentRecapCard>

    <EnrollmentRecapCard title="Options" @edit="$emit('edit', 4)">
      <template #icon>
        <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" stroke-linecap="round" />
        </svg>
      </template>
      <EnrollmentRecapRow label="Journée" :value="journeeLine" />
      <EnrollmentRecapRow label="Autorisations">
        <div class="recap-tags recap-tags--end">
          <span
            v-for="auth in authorizationTags"
            :key="auth"
            class="recap-tag recap-tag--green"
          >{{ auth }}</span>
          <span v-if="!authorizationTags.length" class="text-sm font-medium text-slate-500">Aucune</span>
        </div>
      </EnrollmentRecapRow>
    </EnrollmentRecapCard>

    <section class="recap-engagement">
      <div class="recap-engagement__title">
        <span class="recap-engagement__line" aria-hidden="true" />
        <span>Engagement & signature</span>
      </div>

      <label id="enrollment-certified" class="recap-certification">
        <input
          v-model="engagement.certified"
          type="checkbox"
          class="recap-certification__checkbox"
        />
        <span>
          Je certifie l'exactitude des informations fournies et m'engage à informer Commonwealth de tout
          changement dans les meilleurs délais (48 h pour la situation médicale). J'ai pris connaissance du
          règlement intérieur.
        </span>
      </label>

      <div class="recap-sign-meta">
        <div>
          <label class="recap-meta-label" for="enrollment-signed-place">Fait à</label>
          <input
            id="enrollment-signed-place"
            v-model.trim="engagement.signedPlace"
            type="text"
            class="enrollment-input recap-meta-input"
            placeholder="Abidjan"
          />
        </div>
        <div>
          <label class="recap-meta-label" for="enrollment-signed-at">Le</label>
          <input
            id="enrollment-signed-at"
            v-model="engagement.signedAt"
            type="date"
            class="enrollment-input recap-meta-input"
          />
        </div>
      </div>

      <EnrollmentParentSignature
        v-model:mode="engagement.signatureMode"
        v-model:signature-data-url="engagement.signatureDataUrl"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import type {
  EnrollmentChildDraft,
  EnrollmentEmergencyDraft,
  EnrollmentEngagementDraft,
  EnrollmentHealthDraft,
  EnrollmentOptionsDraft,
  EnrollmentParentDraft,
  EnrollmentStepId,
} from '~/composables/useEnrollmentWizard';
import {
  authorizationLabel,
  formatServiceSelectionLabel,
  type EnrollmentAuthorizationKey,
} from '~/utils/enrollment-options';
import { bloodGroupLabel } from '~/utils/enrollment-health';

const props = defineProps<{
  child: EnrollmentChildDraft;
  parent: EnrollmentParentDraft;
  emergency: EnrollmentEmergencyDraft;
  health: EnrollmentHealthDraft;
  options: EnrollmentOptionsDraft;
}>();

const engagement = defineModel<EnrollmentEngagementDraft>('engagement', { required: true });

defineEmits<{
  edit: [step: EnrollmentStepId];
}>();

function formatDateFr(iso: string): string {
  if (!iso.trim()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}

function parentRelationLabel(relation: string): string {
  if (relation === 'FATHER') return 'Père';
  if (relation === 'MOTHER') return 'Mère';
  return '';
}

function splitRecapTags(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((part) => part.split('—')[0]?.split('-')[0]?.trim() ?? '')
    .filter(Boolean);
}

const childFullName = computed(
  () => `${props.child.firstName.trim()} ${props.child.lastName.trim()}`.trim() || '—',
);

const birthLine = computed(() => {
  const date = formatDateFr(props.child.birthDate);
  const gender = props.child.gender.trim();
  if (!date && !gender) return '—';
  if (!gender) return date;
  if (!date) return gender;
  return `${date} · ${gender}`;
});

const classLine = computed(() => {
  const name = props.child.levelName.trim();
  const subtitle = props.child.levelSubtitle?.trim() ?? '';
  const emoji = props.child.levelEmoji?.trim() ?? '';
  if (!name) return '—';
  const label = subtitle ? `${name} · ${subtitle}` : name;
  return emoji ? `${emoji} ${label}` : label;
});

const guardian1Line = computed(() => {
  const name = props.parent.fullName.trim();
  const relation = parentRelationLabel(props.parent.relation);
  if (!name) return '—';
  return relation ? `${name} · ${relation}` : name;
});

const contactLine = computed(() => {
  const parts = [props.parent.phone.trim(), props.parent.email.trim()].filter(Boolean);
  return parts.length ? parts.join(' · ') : '—';
});

const healthLine = computed(() => {
  const blood = props.health.bloodGroup ? bloodGroupLabel(props.health.bloodGroup) : '';
  const doctor = props.health.doctorName.trim();
  if (!blood && !doctor) return '—';
  if (!doctor) return blood;
  if (!blood) return doctor;
  return `${blood} · ${doctor}`;
});

const allergyTags = computed(() => splitRecapTags(props.health.knownAllergies));

const treatmentTag = computed(() => {
  const treatment = props.health.ongoingTreatments.trim();
  if (!treatment) return '';
  return treatment.split('—')[0]?.split('(')[0]?.trim() || treatment;
});

const vaccineTags = computed(() =>
  props.health.vaccinations.map((v) => ({
    label: v.administeredAt.trim() ? v.label : `${v.label} manquant`,
    missing: !v.administeredAt.trim(),
  })),
);

const authorizationTags = computed(() =>
  (Object.keys(props.options.authorizations) as EnrollmentAuthorizationKey[])
    .filter((key) => props.options.authorizations[key])
    .map((key) => authorizationLabel(key)),
);

const journeeLine = computed(() => {
  const parts: string[] = [];
  if (props.options.scheduleLabel.trim()) parts.push(props.options.scheduleLabel);
  for (const service of props.options.serviceSelections) {
    parts.push(formatServiceSelectionLabel(service));
  }
  return parts.length ? parts.join(' · ') : '—';
});
</script>

<style scoped>
.enrollment-recap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recap-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.recap-tags--end {
  justify-content: flex-end;
}

.recap-tag {
  display: inline-flex;
  border-radius: 0.375rem;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.recap-tag--green {
  background: rgb(236 253 245);
  color: rgb(4 120 87);
  box-shadow: inset 0 0 0 1px rgb(167 243 208 / 0.85);
}

.recap-tag--rose {
  background: rgb(255 241 242);
  color: rgb(190 18 60);
  box-shadow: inset 0 0 0 1px rgb(254 205 211 / 0.85);
}

.recap-tag--amber {
  background: rgb(255 251 235);
  color: rgb(146 64 14);
  box-shadow: inset 0 0 0 1px rgb(253 230 138 / 0.85);
}

.recap-engagement {
  padding-top: 0.25rem;
}

.recap-engagement__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #216ec2;
}

.recap-engagement__line {
  height: 2px;
  width: 1.5rem;
  border-radius: 999px;
  background: #216ec2;
}

.recap-certification {
  display: flex;
  cursor: pointer;
  align-items: flex-start;
  gap: 0.875rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240);
  background: rgb(248 250 252);
  padding: 1rem 1.125rem;
  font-size: 0.875rem;
  line-height: 1.65;
  color: rgb(51 65 85);
}

.recap-certification__checkbox {
  margin-top: 0.125rem;
  height: 1.125rem;
  width: 1.125rem;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 0.25rem;
  border: 1px solid rgb(203 213 225);
  color: #216ec2;
}

.recap-certification__checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgb(33 110 194 / 0.2);
}

.recap-sign-meta {
  display: grid;
  gap: 0.875rem;
  margin: 1rem 0 0.875rem;
}

@media (min-width: 640px) {
  .recap-sign-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.recap-meta-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgb(148 163 184);
}

.recap-meta-input {
  margin-top: 0;
}
</style>
