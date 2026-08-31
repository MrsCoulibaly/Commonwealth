<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[110] flex items-end justify-center p-3 sm:items-center sm:p-4"
      role="presentation"
    >
      <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="emit('close')" />

      <div
        role="dialog"
        aria-modal="true"
        :aria-labelledby="step === 'edit' ? 'dossier-edit-title' : 'dossier-notify-title'"
        class="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-xl"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div class="min-w-0">
            <h2
              v-if="step === 'edit'"
              id="dossier-edit-title"
              class="text-xl font-bold tracking-tight text-slate-900"
            >
              Modifier le dossier
            </h2>
            <h2 v-else id="dossier-notify-title" class="text-xl font-bold tracking-tight text-slate-900">
              E-mail de notification
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              <template v-if="step === 'edit'">
                Corrections avant validation. Le parent sera informé à l’enregistrement.
              </template>
              <template v-else>
                Relisez et corrigez le message envoyé à
                <span class="font-semibold text-slate-700">{{ notifyTo || '—' }}</span>.
              </template>
            </p>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p v-if="formError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {{ formError }}
          </p>

          <form v-if="step === 'edit'" class="space-y-8" @submit.prevent="goToNotify">
            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Élève</h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Prénom <span class="text-[#216EC2]">*</span>
                  </span>
                  <input v-model.trim="form.firstName" type="text" required :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Nom <span class="text-[#216EC2]">*</span>
                  </span>
                  <input v-model.trim="form.lastName" type="text" required :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Date de naissance
                  </span>
                  <input v-model="form.birthDate" type="date" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Genre</span>
                  <select v-model="form.gender" :class="inp">
                    <option value="FEMALE">Fille</option>
                    <option value="MALE">Garçon</option>
                    <option value="UNSPECIFIED">Non précisé</option>
                  </select>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Lieu de naissance
                  </span>
                  <input v-model.trim="form.birthPlace" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Nationalité
                  </span>
                  <input v-model.trim="form.nationality" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Langue(s) à la maison
                  </span>
                  <input v-model.trim="form.homeLanguages" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Matricule
                  </span>
                  <input v-model.trim="form.matricule" type="text" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Adresse de l’enfant
                  </span>
                  <input v-model.trim="form.childAddress" type="text" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    École précédente
                  </span>
                  <input v-model.trim="form.previousSchool" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Classe demandée <span class="text-[#216EC2]">*</span>
                  </span>
                  <select v-model="form.levelId" required :class="inp">
                    <option v-for="lv in levels" :key="lv.id" :value="lv.id">{{ lv.name }}</option>
                  </select>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Formule horaire
                  </span>
                  <select v-model="form.scheduleId" :class="inp">
                    <option value="">— Aucune —</option>
                    <option v-for="sc in schedules" :key="sc.id" :value="sc.id">
                      {{ sc.label }}{{ sc.timeDescription ? ` · ${sc.timeDescription}` : '' }}
                    </option>
                  </select>
                </label>
              </div>
            </section>

            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Parent inscripteur</h3>
              <p class="text-xs leading-relaxed text-slate-500">
                L’e-mail de connexion du compte parent n’est pas modifié ici. Vous pourrez choisir le destinataire de
                la notification à l’étape suivante.
              </p>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Prénom et nom
                  </span>
                  <input v-model.trim="form.parentFullName" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Lien avec l’enfant
                  </span>
                  <select v-model="form.parentRelation" :class="inp">
                    <option value="">—</option>
                    <option value="FATHER">Père</option>
                    <option value="MOTHER">Mère</option>
                  </select>
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Téléphone
                  </span>
                  <input v-model.trim="form.parentPhone" type="tel" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Profession
                  </span>
                  <input v-model.trim="form.parentProfession" type="text" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Adresse
                  </span>
                  <input v-model.trim="form.parentAddress" type="text" :class="inp" />
                </label>
              </div>
            </section>

            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Famille &amp; contacts</h3>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Parent / responsable 2</p>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Prénom et nom
                  </span>
                  <input v-model.trim="form.g2FullName" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Lien</span>
                  <input v-model.trim="form.g2Relation" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Téléphone
                  </span>
                  <input v-model.trim="form.g2Phone" type="tel" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">E-mail</span>
                  <input v-model.trim="form.g2Email" type="email" :class="inp" />
                </label>
              </div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Contact d’urgence</p>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Prénom et nom
                  </span>
                  <input v-model.trim="form.emFullName" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Lien</span>
                  <input v-model.trim="form.emRelation" type="text" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Téléphone
                  </span>
                  <input v-model.trim="form.emPhone" type="tel" :class="inp" />
                </label>
              </div>
            </section>

            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Santé</h3>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Médecin référent
                  </span>
                  <input v-model.trim="form.doctorName" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Téléphone du cabinet
                  </span>
                  <input v-model.trim="form.doctorPhone" type="tel" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Groupe sanguin
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="g in bloodGroups"
                      :key="g"
                      type="button"
                      class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                      :class="
                        form.bloodGroup === g
                          ? 'border-rose-400 bg-rose-50 text-rose-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      "
                      @click="form.bloodGroup = g"
                    >
                      {{ bloodGroupLabel(g) }}
                    </button>
                  </div>
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Allergies
                  </span>
                  <textarea v-model.trim="form.knownAllergies" rows="2" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Traitements en cours
                  </span>
                  <input v-model.trim="form.ongoingTreatments" type="text" :class="inp" />
                </label>
                <label class="block">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Régime alimentaire
                  </span>
                  <input v-model.trim="form.dietaryRegime" type="text" :class="inp" />
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                    Consigne équipe
                  </span>
                  <textarea v-model.trim="form.instructions" rows="2" :class="inp" />
                </label>
              </div>
              <div v-if="form.vaccinations.length" class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Vaccinations</p>
                <div
                  v-for="(vax, idx) in form.vaccinations"
                  :key="`${vax.name}-${idx}`"
                  class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span class="min-w-[4rem] text-sm font-medium text-slate-800">{{ vax.name }}</span>
                  <input v-model="vax.vaccinatedAt" type="date" :class="inp" class="!w-auto" />
                </div>
              </div>
            </section>

            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Services</h3>
              <p v-if="!catalogServices.length" class="text-sm text-slate-500">Aucun service au catalogue.</p>
              <div v-else class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="service in catalogServices"
                  :key="service.id"
                  class="rounded-xl border border-slate-200 p-3"
                >
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-semibold text-slate-900">{{ service.label }}</p>
                    <button
                      v-if="service.pricingMode === 'FLAT'"
                      type="button"
                      class="shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold"
                      :class="
                        isServiceSelected(service.id)
                          ? 'bg-[#216EC2] text-white'
                          : 'border border-slate-200 bg-slate-50 text-slate-700'
                      "
                      @click="toggleFlatService(service)"
                    >
                      {{ isServiceSelected(service.id) ? 'Retirer' : 'Choisir' }}
                    </button>
                  </div>
                  <div v-if="service.pricingMode === 'CUSTOMIZABLE'" class="mt-2 space-y-1.5">
                    <button
                      v-for="variant in service.variants"
                      :key="variant.id"
                      type="button"
                      class="flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-xs"
                      :class="
                        selectedVariantId(service.id) === variant.id
                          ? 'border-[#216EC2] bg-[#216EC2]/5 font-semibold text-[#216EC2]'
                          : 'border-slate-200 text-slate-700'
                      "
                      @click="selectVariant(service, variant)"
                    >
                      <span>{{ variant.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section class="space-y-4">
              <h3 class="text-sm font-bold text-[#216EC2]">Autorisations</h3>
              <div class="grid gap-2 sm:grid-cols-2">
                <label
                  v-for="auth in authorizationChoices"
                  :key="auth.key"
                  class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <input v-model="form.authorizations[auth.key]" type="checkbox" class="mt-1" />
                  <span>
                    <span class="block font-semibold text-slate-800">{{ auth.title }}</span>
                    <span class="text-xs text-slate-500">{{ auth.subtitle }}</span>
                  </span>
                </label>
              </div>
              <label class="block">
                <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Commentaire
                </span>
                <textarea v-model.trim="form.comment" rows="3" :class="inp" />
              </label>
            </section>
          </form>

          <div v-else class="space-y-4">
            <label class="block">
              <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Destinataire
              </span>
              <input v-model.trim="notifyTo" type="email" required :class="inp" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Objet</span>
              <input v-model="notifySubject" type="text" required :class="inp" />
            </label>
            <label class="block">
              <span class="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Message
              </span>
              <textarea v-model="notifyBody" rows="14" required :class="inp" class="min-h-[280px] font-sans" />
            </label>
            <p class="text-xs text-slate-500">
              Ce texte est envoyé tel quel au parent, en plus d’une notification dans son espace.
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 border-t border-slate-100 px-6 py-4">
          <template v-if="step === 'edit'">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#216EC2] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="saving"
              @click="goToNotify"
            >
              Continuer vers la notification
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              :disabled="saving"
              @click="emit('close')"
            >
              Annuler
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#216EC2] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="saving"
              @click="submit"
            >
              {{ saving ? 'Envoi…' : 'Enregistrer et notifier' }}
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              :disabled="saving"
              @click="step = 'edit'"
            >
              Retour
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ENROLLMENT_AUTHORIZATIONS, type EnrollmentAuthorizationKey } from '~/utils/enrollment-options'
import { bloodGroupLabel, ENROLLMENT_BLOOD_GROUPS } from '~/utils/enrollment-health'
import { looksLikeTechnicalId, stripTechnicalIds } from '~/utils/strip-technical-ids'

type WizardSlice = {
  childExtras?: {
    birthPlace?: string
    nationality?: string
    homeLanguages?: string
    matricule?: string
    childAddress?: string
    previousSchool?: string
  }
  parentExtras?: { profession?: string }
  guardian2?: { fullName?: string; relation?: string; phone?: string; email?: string }
  emergency?: { source?: string; fullName?: string; relation?: string; phone?: string }
  options?: {
    scheduleId?: string
    scheduleLabel?: string
    comment?: string
    authorizations?: Partial<Record<EnrollmentAuthorizationKey, boolean>>
    serviceSelections?: Array<{ serviceTariffId: string; code: string; variantId?: string | null }>
  }
}

export type DossierEnrollment = {
  id: string
  schoolYear: string
  pendingParentEmail: string | null
  pendingParentFirstName: string | null
  pendingParentLastName: string | null
  pendingParentPhone: string | null
  pendingParentRelation: 'FATHER' | 'MOTHER' | null
  pendingParentAddress: string | null
  wizardData?: Record<string, unknown> | null
  child: {
    firstName: string
    lastName: string
    birthDate: string | null
    gender: string
    allergies?: string | null
    parent: {
      fullName: string | null
      email: string
      phone: string | null
      parentRelation: 'FATHER' | 'MOTHER' | null
      address: string | null
    } | null
    healthRecord?: {
      bloodGroup: string | null
      doctorName: string | null
      doctorPhone: string | null
      knownAllergies: string | null
      ongoingTreatments: string | null
      dietaryRegime: string | null
      instructions: string | null
      vaccinations?: Array<{ name: string; status: string; vaccinatedAt: string | null }>
    } | null
  }
  level: { id: string; name: string }
  schedule?: { id: string; label: string; timeDescription: string | null } | null
  serviceSubscriptions?: Array<{
    serviceTariffId?: string
    variantId?: string | null
    serviceTariff: { id?: string; label: string; code: string }
    variant?: { id?: string; label: string } | null
  }>
}

type ApiSchedule = { id: string; label: string; timeDescription: string }
type ApiService = {
  id: string
  code: string
  label: string
  pricingMode: 'FLAT' | 'CUSTOMIZABLE'
  variants: Array<{ id: string; label: string }>
}

type DossierForm = {
  firstName: string
  lastName: string
  birthDate: string
  gender: 'FEMALE' | 'MALE' | 'UNSPECIFIED'
  birthPlace: string
  nationality: string
  homeLanguages: string
  matricule: string
  childAddress: string
  previousSchool: string
  levelId: string
  scheduleId: string
  parentFullName: string
  parentRelation: '' | 'FATHER' | 'MOTHER'
  parentPhone: string
  parentProfession: string
  parentAddress: string
  g2FullName: string
  g2Relation: string
  g2Phone: string
  g2Email: string
  emFullName: string
  emRelation: string
  emPhone: string
  doctorName: string
  doctorPhone: string
  bloodGroup: string
  knownAllergies: string
  ongoingTreatments: string
  dietaryRegime: string
  instructions: string
  vaccinations: Array<{ name: string; vaccinatedAt: string }>
  comment: string
  authorizations: Record<EnrollmentAuthorizationKey, boolean>
  serviceSelections: Array<{ serviceTariffId: string; code: string; variantId: string | null }>
}

const props = defineProps<{
  enrollment: DossierEnrollment
  token: string
}>()

const emit = defineEmits<{
  close: []
  saved: [payload: { message: string; enrollment: unknown; stats?: unknown }]
}>()

const config = useRuntimeConfig()
const inp =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20'

const bloodGroups = ENROLLMENT_BLOOD_GROUPS
const authorizationChoices = ENROLLMENT_AUTHORIZATIONS

const step = ref<'edit' | 'notify'>('edit')
const saving = ref(false)
const formError = ref('')
const catalogReady = ref(false)
const levels = ref<Array<{ id: string; name: string }>>([])
const schedules = ref<ApiSchedule[]>([])
const catalogServices = ref<ApiService[]>([])
const scheduleLabels = ref<Record<string, string>>({})
const levelNames = ref<Record<string, string>>({})
const serviceLabels = ref<Record<string, string>>({})

const form = reactive<DossierForm>(emptyForm())
const snapshot = ref('')

const notifyTo = ref('')
const notifySubject = ref('')
const notifyBody = ref('')

function wizardOf(e: DossierEnrollment): WizardSlice {
  const raw = e.wizardData
  if (!raw || typeof raw !== 'object') return {}
  return raw as WizardSlice
}

function toIsoDate(v: string | null | undefined): string {
  if (!v) return ''
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})/)
  if (m) return m[1]
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function genderFr(g: string) {
  if (g === 'FEMALE') return 'Fille'
  if (g === 'MALE') return 'Garçon'
  if (g === 'UNSPECIFIED') return 'Non précisé'
  return looksLikeTechnicalId(g) ? '' : g
}

function relationFr(r: string) {
  if (r === 'FATHER') return 'Père'
  if (r === 'MOTHER') return 'Mère'
  return looksLikeTechnicalId(r) ? '' : r
}

function rememberService(id: string, label: string) {
  const key = id.trim()
  const name = label.trim()
  if (key && name) serviceLabels.value[key] = name
}

function serviceDisplay(sel: { serviceTariffId: string; code: string; variantId: string | null }) {
  const svc = catalogServices.value.find((s) => s.id === sel.serviceTariffId)
  if (svc) {
    if (sel.variantId) {
      const variant = svc.variants.find((v) => v.id === sel.variantId)
      return variant ? `${svc.label} — ${variant.label}` : svc.label
    }
    return svc.label
  }
  if (sel.serviceTariffId && serviceLabels.value[sel.serviceTariffId]) {
    return serviceLabels.value[sel.serviceTariffId]
  }
  if (sel.code && !looksLikeTechnicalId(sel.code)) return sel.code
  return 'Service'
}

function genderValue(raw: string): DossierForm['gender'] {
  if (raw === 'FEMALE' || raw === 'MALE' || raw === 'UNSPECIFIED') return raw
  return 'UNSPECIFIED'
}

function rememberSchedule(id: string, label: string) {
  const key = id.trim()
  const name = label.trim()
  if (key && name) scheduleLabels.value[key] = name
}

function rememberLevel(id: string, name: string) {
  const key = id.trim()
  const label = name.trim()
  if (key && label) levelNames.value[key] = label
}

function looksLikeUuid(v: string) {
  return looksLikeTechnicalId(v)
}

function levelDisplayName(id: string) {
  if (!id) return ''
  const fromList = levels.value.find((l) => l.id === id)?.name
  if (fromList) return fromList
  if (levelNames.value[id]) return levelNames.value[id]
  if (id === props.enrollment.level.id) return props.enrollment.level.name
  return looksLikeUuid(id) ? '' : id
}

function scheduleDisplayName(id: string) {
  if (!id) return ''
  const fromList = schedules.value.find((s) => s.id === id)
  if (fromList?.label) {
    return fromList.timeDescription ? `${fromList.label} · ${fromList.timeDescription}` : fromList.label
  }
  if (scheduleLabels.value[id]) return scheduleLabels.value[id]
  const current = props.enrollment.schedule
  if (current?.id === id && current.label) {
    return current.timeDescription ? `${current.label} · ${current.timeDescription}` : current.label
  }
  const wizardLabel = wizardOf(props.enrollment).options?.scheduleLabel
  if (wizardLabel && id === current?.id) return wizardLabel
  return looksLikeUuid(id) ? '' : id
}

function emptyForm(): DossierForm {
  return {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'UNSPECIFIED',
    birthPlace: '',
    nationality: '',
    homeLanguages: '',
    matricule: '',
    childAddress: '',
    previousSchool: '',
    levelId: '',
    scheduleId: '',
    parentFullName: '',
    parentRelation: '',
    parentPhone: '',
    parentProfession: '',
    parentAddress: '',
    g2FullName: '',
    g2Relation: '',
    g2Phone: '',
    g2Email: '',
    emFullName: '',
    emRelation: '',
    emPhone: '',
    doctorName: '',
    doctorPhone: '',
    bloodGroup: '',
    knownAllergies: '',
    ongoingTreatments: '',
    dietaryRegime: '',
    instructions: '',
    vaccinations: [],
    comment: '',
    authorizations: {
      photosInternal: true,
      photosCommunication: false,
      outings: true,
      firstAid: true,
    },
    serviceSelections: [],
  }
}

function hydrate(e: DossierEnrollment) {
  const w = wizardOf(e)
  rememberLevel(e.level.id, e.level.name)
  if (e.schedule?.id) {
    rememberSchedule(
      e.schedule.id,
      e.schedule.timeDescription
        ? `${e.schedule.label} · ${e.schedule.timeDescription}`
        : e.schedule.label,
    )
  } else if (w.options?.scheduleId && w.options.scheduleLabel) {
    rememberSchedule(w.options.scheduleId, w.options.scheduleLabel)
  }
  const extras = w.childExtras ?? {}
  const h = e.child.healthRecord
  const parentName =
    e.child.parent?.fullName?.trim() ||
    `${e.pendingParentFirstName ?? ''} ${e.pendingParentLastName ?? ''}`.trim()
  Object.assign(form, {
    firstName: e.child.firstName,
    lastName: e.child.lastName,
    birthDate: toIsoDate(e.child.birthDate),
    gender: genderValue(e.child.gender),
    birthPlace: extras.birthPlace ?? '',
    nationality: extras.nationality ?? '',
    homeLanguages: extras.homeLanguages ?? '',
    matricule: extras.matricule ?? '',
    childAddress: extras.childAddress ?? '',
    previousSchool: extras.previousSchool ?? '',
    levelId: e.level.id,
    scheduleId: e.schedule?.id ?? w.options?.scheduleId ?? '',
    parentFullName: parentName,
    parentRelation: e.pendingParentRelation ?? e.child.parent?.parentRelation ?? '',
    parentPhone: e.child.parent?.phone ?? e.pendingParentPhone ?? '',
    parentProfession: w.parentExtras?.profession ?? '',
    parentAddress: e.child.parent?.address ?? e.pendingParentAddress ?? '',
    g2FullName: w.guardian2?.fullName ?? '',
    g2Relation: w.guardian2?.relation ?? '',
    g2Phone: w.guardian2?.phone ?? '',
    g2Email: w.guardian2?.email ?? '',
    emFullName: w.emergency?.fullName ?? '',
    emRelation: w.emergency?.relation ?? '',
    emPhone: w.emergency?.phone ?? '',
    doctorName: h?.doctorName ?? '',
    doctorPhone: h?.doctorPhone ?? '',
    bloodGroup: h?.bloodGroup ?? '',
    knownAllergies: h?.knownAllergies ?? e.child.allergies ?? '',
    ongoingTreatments: h?.ongoingTreatments ?? '',
    dietaryRegime: h?.dietaryRegime ?? '',
    instructions: h?.instructions ?? '',
    vaccinations: (h?.vaccinations ?? []).map((v) => ({
      name: v.name,
      vaccinatedAt: toIsoDate(v.vaccinatedAt),
    })),
    comment: w.options?.comment ?? '',
    authorizations: {
      photosInternal: w.options?.authorizations?.photosInternal ?? true,
      photosCommunication: w.options?.authorizations?.photosCommunication ?? false,
      outings: w.options?.authorizations?.outings ?? true,
      firstAid: w.options?.authorizations?.firstAid ?? true,
    },
    serviceSelections: (e.serviceSubscriptions ?? []).map((s) => ({
      serviceTariffId: s.serviceTariffId || s.serviceTariff.id || '',
      code: s.serviceTariff.code,
      variantId: s.variantId ?? s.variant?.id ?? null,
    })),
  } satisfies DossierForm)
  for (const s of e.serviceSubscriptions ?? []) {
    const id = s.serviceTariffId || s.serviceTariff.id || ''
    const label = s.variant?.label ? `${s.serviceTariff.label} — ${s.variant.label}` : s.serviceTariff.label
    rememberService(id, label)
  }
  snapshot.value = JSON.stringify(form)
}

function isServiceSelected(serviceId: string) {
  return form.serviceSelections.some((s) => s.serviceTariffId === serviceId)
}

function selectedVariantId(serviceId: string) {
  return form.serviceSelections.find((s) => s.serviceTariffId === serviceId)?.variantId ?? null
}

function toggleFlatService(service: ApiService) {
  if (isServiceSelected(service.id)) {
    form.serviceSelections = form.serviceSelections.filter((s) => s.serviceTariffId !== service.id)
    return
  }
  form.serviceSelections = [
    ...form.serviceSelections,
    { serviceTariffId: service.id, code: service.code, variantId: null },
  ]
}

function selectVariant(service: ApiService, variant: { id: string }) {
  if (selectedVariantId(service.id) === variant.id) {
    form.serviceSelections = form.serviceSelections.filter((s) => s.serviceTariffId !== service.id)
    return
  }
  form.serviceSelections = [
    ...form.serviceSelections.filter((s) => s.serviceTariffId !== service.id),
    { serviceTariffId: service.id, code: service.code, variantId: variant.id },
  ]
}

function norm(v: unknown) {
  return String(v ?? '').trim()
}

function diffLines(): string[] {
  let before: DossierForm
  try {
    before = JSON.parse(snapshot.value) as DossierForm
  } catch {
    return []
  }
  const lines: string[] = []
  const add = (label: string, a: unknown, b: unknown) => {
    if (norm(a) === norm(b)) return
    lines.push(`${label} : ${norm(a) || '—'} → ${norm(b) || '—'}`)
  }
  add('Prénom', before.firstName, form.firstName)
  add('Nom', before.lastName, form.lastName)
  add('Date de naissance', before.birthDate, form.birthDate)
  add('Genre', genderFr(before.gender), genderFr(form.gender))
  add('Lieu de naissance', before.birthPlace, form.birthPlace)
  add('Nationalité', before.nationality, form.nationality)
  add('Langue(s) à la maison', before.homeLanguages, form.homeLanguages)
  add('Matricule', before.matricule, form.matricule)
  add('Adresse de l’enfant', before.childAddress, form.childAddress)
  add('École précédente', before.previousSchool, form.previousSchool)
  add('Classe demandée', levelDisplayName(before.levelId), levelDisplayName(form.levelId))
  add(
    'Formule horaire',
    scheduleDisplayName(before.scheduleId),
    scheduleDisplayName(form.scheduleId),
  )
  add('Parent inscripteur', before.parentFullName, form.parentFullName)
  add('Lien avec l’enfant', relationFr(before.parentRelation), relationFr(form.parentRelation))
  add('Téléphone parent', before.parentPhone, form.parentPhone)
  add('Profession', before.parentProfession, form.parentProfession)
  add('Adresse parent', before.parentAddress, form.parentAddress)
  add(
    'Parent / responsable 2',
    [before.g2FullName, before.g2Relation, before.g2Phone, before.g2Email].filter(Boolean).join(' · '),
    [form.g2FullName, form.g2Relation, form.g2Phone, form.g2Email].filter(Boolean).join(' · '),
  )
  add(
    'Contact d’urgence',
    [before.emFullName, before.emRelation, before.emPhone].filter(Boolean).join(' · '),
    [form.emFullName, form.emRelation, form.emPhone].filter(Boolean).join(' · '),
  )
  add('Médecin référent', before.doctorName, form.doctorName)
  add('Téléphone du cabinet', before.doctorPhone, form.doctorPhone)
  add(
    'Groupe sanguin',
    before.bloodGroup ? bloodGroupLabel(before.bloodGroup) : '',
    form.bloodGroup ? bloodGroupLabel(form.bloodGroup) : '',
  )
  add('Allergies', before.knownAllergies, form.knownAllergies)
  add('Traitements', before.ongoingTreatments, form.ongoingTreatments)
  add('Régime alimentaire', before.dietaryRegime, form.dietaryRegime)
  add('Consigne équipe', before.instructions, form.instructions)
  add('Commentaire', before.comment, form.comment)
  for (const a of authorizationChoices) {
    add(a.title, before.authorizations[a.key] ? 'Oui' : 'Non', form.authorizations[a.key] ? 'Oui' : 'Non')
  }
  const svcKey = (list: DossierForm['serviceSelections']) =>
    [...list]
      .map((s) => `${s.serviceTariffId}:${s.variantId ?? ''}`)
      .sort()
      .join('|')
  if (svcKey(before.serviceSelections) !== svcKey(form.serviceSelections)) {
    const from = before.serviceSelections.map(serviceDisplay).join(', ') || 'aucun'
    const to = form.serviceSelections.map(serviceDisplay).join(', ') || 'aucun'
    lines.push(`Services : ${from} → ${to}`)
  }
  const vaxKey = (list: DossierForm['vaccinations']) =>
    list.map((v) => `${v.name}|${v.vaccinatedAt}`).join(';')
  if (vaxKey(before.vaccinations) !== vaxKey(form.vaccinations)) {
    lines.push('Vaccinations mises à jour')
  }
  return lines.map((line) => stripTechnicalIds(line)).filter((line) => !looksLikeTechnicalId(line))
}

function parentDisplayName() {
  return form.parentFullName.trim() || 'Parent'
}

function parentEmail() {
  return (props.enrollment.child.parent?.email ?? props.enrollment.pendingParentEmail ?? '').trim()
}

function goToNotify() {
  formError.value = ''
  if (!form.firstName.trim() || !form.lastName.trim()) {
    formError.value = 'Le prénom et le nom de l’enfant sont obligatoires.'
    return
  }
  const lines = diffLines()
  if (!lines.length) {
    formError.value = 'Aucune modification à enregistrer.'
    return
  }
  const child = `${form.firstName} ${form.lastName}`.trim()
  notifyTo.value = parentEmail()
  notifySubject.value = stripTechnicalIds(`Dossier d’inscription mis à jour — ${child}`)
  notifyBody.value = stripTechnicalIds(
    [
      `Bonjour ${parentDisplayName()},`,
      '',
      `L’administration a mis à jour le dossier d’inscription de ${child} pour l’année scolaire ${props.enrollment.schoolYear}.`,
      '',
      'Modifications :',
      ...lines.map((l) => `• ${l}`),
      '',
      'Ces informations seront utilisées pour la validation du dossier. Vous pouvez les consulter dans votre espace parent.',
      '',
      'Cordialement,',
      'Le service administratif',
    ].join('\n'),
  )
  step.value = 'notify'
}

function apiError(e: unknown) {
  const err = e as { data?: { message?: string | string[] } }
  const raw = err?.data?.message
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0] ?? 'La mise à jour a échoué.'
  return 'La mise à jour a échoué.'
}

async function submit() {
  formError.value = ''
  if (!notifyTo.value.trim() || !notifySubject.value.trim() || !notifyBody.value.trim()) {
    formError.value = 'Indiquez le destinataire, l’objet et le message.'
    return
  }
  saving.value = true
  try {
    const schedule = schedules.value.find((s) => s.id === form.scheduleId)
    const res = await $fetch<{
      enrollment: unknown
      stats?: unknown
      emailSent?: boolean
      recipient?: string | null
    }>(`${config.public.apiBase}/admin/enrollments/${props.enrollment.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${props.token}` },
      body: {
        levelId: form.levelId,
        child: {
          firstName: form.firstName,
          lastName: form.lastName,
          birthDate: form.birthDate || null,
          gender: form.gender,
          birthPlace: form.birthPlace,
          nationality: form.nationality,
          homeLanguages: form.homeLanguages,
          matricule: form.matricule,
          childAddress: form.childAddress,
          previousSchool: form.previousSchool,
        },
        parent: {
          fullName: form.parentFullName,
          relation: form.parentRelation || null,
          phone: form.parentPhone,
          address: form.parentAddress,
          profession: form.parentProfession,
        },
        guardian2: {
          fullName: form.g2FullName,
          relation: form.g2Relation,
          phone: form.g2Phone,
          email: form.g2Email,
        },
        emergency: {
          fullName: form.emFullName,
          relation: form.emRelation,
          phone: form.emPhone,
        },
        health: {
          doctorName: form.doctorName,
          doctorPhone: form.doctorPhone,
          bloodGroup: form.bloodGroup,
          knownAllergies: form.knownAllergies,
          ongoingTreatments: form.ongoingTreatments,
          dietaryRegime: form.dietaryRegime,
          instructions: form.instructions,
          vaccinations: form.vaccinations.map((v) => ({
            name: v.name,
            status: v.vaccinatedAt ? 'DONE' : 'MISSING',
            vaccinatedAt: v.vaccinatedAt || null,
          })),
        },
        options: {
          scheduleId: form.scheduleId,
          scheduleLabel: schedule?.label ?? '',
          comment: form.comment,
          authorizations: form.authorizations,
          serviceSelections: form.serviceSelections,
        },
        notify: {
          to: notifyTo.value.trim(),
          subject: stripTechnicalIds(notifySubject.value.trim()),
          body: stripTechnicalIds(notifyBody.value.trim()),
        },
      },
    })
    const mailHint = res.emailSent
      ? ` Un e-mail a été envoyé à ${res.recipient ?? notifyTo.value}.`
      : ' La notification a été déposée dans l’espace parent (l’e-mail n’a pas pu partir).'
    emit('saved', {
      message: `Dossier mis à jour.${mailHint}`,
      enrollment: res.enrollment,
      stats: res.stats,
    })
  } catch (e) {
    formError.value = apiError(e)
  } finally {
    saving.value = false
  }
}

async function loadSchedules(levelId: string) {
  if (!levelId) {
    schedules.value = []
    return
  }
  try {
    const res = await $fetch<{ schedules: ApiSchedule[] }>(
      `${config.public.apiBase}/public/catalog/levels/${levelId}/schedules`,
    )
    const list = [...(res.schedules ?? [])]
    for (const s of list) rememberSchedule(s.id, s.label)
    const current = props.enrollment.schedule
    if (current?.id && !list.some((s) => s.id === current.id) && form.levelId === props.enrollment.level.id) {
      list.unshift({
        id: current.id,
        label: current.label,
        timeDescription: current.timeDescription ?? '',
      })
      rememberSchedule(current.id, current.label)
    }
    schedules.value = list
    if (form.scheduleId && !list.some((s) => s.id === form.scheduleId)) {
      form.scheduleId = ''
    }
  } catch {
    schedules.value = props.enrollment.schedule
      ? [
          {
            id: props.enrollment.schedule.id,
            label: props.enrollment.schedule.label,
            timeDescription: props.enrollment.schedule.timeDescription ?? '',
          },
        ]
      : []
  }
}

async function loadCatalog() {
  try {
    const [lv, sv] = await Promise.all([
      $fetch<Array<{ id: string; name: string }>>(`${config.public.apiBase}/public/catalog/levels`),
      $fetch<{ items: ApiService[] }>(`${config.public.apiBase}/public/catalog/services`),
    ])
    const list = Array.isArray(lv) ? lv : []
    if (props.enrollment.level.id && !list.some((l) => l.id === props.enrollment.level.id)) {
      list.unshift({ id: props.enrollment.level.id, name: props.enrollment.level.name })
    }
    for (const l of list) rememberLevel(l.id, l.name)
    levels.value = list
    catalogServices.value = sv.items ?? []
    for (const s of catalogServices.value) {
      rememberService(s.id, s.label)
      for (const v of s.variants) rememberService(v.id, `${s.label} — ${v.label}`)
    }
  } catch {
    levels.value = [{ id: props.enrollment.level.id, name: props.enrollment.level.name }]
  }
  await loadSchedules(form.levelId)
  snapshot.value = JSON.stringify(form)
}

watch(
  () => form.levelId,
  (id, prev) => {
    if (!catalogReady.value || id === prev) return
    void loadSchedules(id)
  },
)

function onEscape(e: KeyboardEvent) {
  if (e.key !== 'Escape' || saving.value) return
  if (step.value === 'notify') {
    step.value = 'edit'
    return
  }
  emit('close')
}

onMounted(() => {
  hydrate(props.enrollment)
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onEscape)
  void loadCatalog().finally(() => {
    catalogReady.value = true
  })
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onEscape)
})
</script>
