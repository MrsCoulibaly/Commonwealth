<template>
  <div class="rounded-3xl border-2 border-[#216EC2]/20 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <span
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#216EC2]/10 text-[#216EC2]"
            aria-hidden="true"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" stroke-linejoin="round" />
            </svg>
          </span>
          <h2 class="text-xl font-bold text-slate-900 sm:text-2xl">Fiche santé</h2>
        </div>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Informations médicales de l'enfant. La fiche doit être signée par l'école et par les parents pour être
          valide.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span
          class="inline-flex items-center rounded-full px-4 py-2 text-sm font-bold"
          :class="
            record?.isValid
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-[#F9994B]/15 text-[#F9994B]'
          "
        >
          {{ record?.statusLabel ?? 'En attente de signature' }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-2xl border-2 border-[#216EC2]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5"
          @click="openEditModal"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Modifier
        </button>
      </div>
    </div>

    <p v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <div v-if="pending" class="py-16 text-center text-sm text-slate-500">Chargement de la fiche santé…</div>

    <template v-else-if="record">
      <div class="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="tile in infoTiles"
          :key="tile.label"
          class="rounded-3xl border-2 border-[#216EC2]/20 bg-white p-5 shadow-sm"
        >
          <div class="mb-3 flex items-center gap-3">
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
              :class="tile.iconWrap"
              aria-hidden="true"
            >
              <component :is="tile.icon" class="h-5 w-5" />
            </span>
            <p class="text-sm font-semibold text-[#216EC2]">{{ tile.label }}</p>
          </div>
          <p class="text-base font-bold leading-relaxed text-slate-900">{{ tile.value || '—' }}</p>
        </article>
      </div>

      <section class="mb-6 rounded-3xl border-2 border-[#216EC2]/20 bg-white p-5 shadow-sm sm:p-6">
        <div class="mb-4 flex items-center gap-3">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#216EC2]/10 text-[#216EC2]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 2 2 4H4v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6h-4l-2-4Z" />
              <path d="M9 12v6M15 12v6" stroke-linecap="round" />
            </svg>
          </span>
          <h3 class="text-lg font-bold text-slate-900">Vaccinations</h3>
        </div>
        <div v-if="record.vaccinations.length" class="flex flex-wrap gap-2">
          <span
            v-for="vac in record.vaccinations"
            :key="vac.id"
            class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            :class="
              vac.status === 'DONE'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-[#F9994B]/15 text-[#F9994B]'
            "
          >
            <svg
              v-if="vac.status === 'DONE'"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" stroke-linecap="round" />
            </svg>
            {{ vac.name }}
            <template v-if="vac.status === 'DONE' && vac.dateLabel"> {{ vac.dateLabel }}</template>
            <template v-else-if="vac.status === 'MISSING'"> Manquant</template>
          </span>
        </div>
        <p v-else class="text-sm text-slate-500">Aucune vaccination renseignée.</p>
      </section>

      <section
        v-if="record.instructions"
        class="mb-6 rounded-3xl border-2 border-[#216EC2]/15 bg-[#216EC2]/5 px-5 py-4"
      >
        <div class="flex gap-3">
          <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6M12 7h.01" stroke-linecap="round" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-bold text-[#216EC2]">Consignes / Remarques</p>
            <p class="mt-1 text-sm leading-relaxed text-slate-700">{{ record.instructions }}</p>
          </div>
        </div>
      </section>

      <section>
        <div class="mb-4 flex items-center gap-3">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#216EC2]/10 text-[#216EC2]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
          <h3 class="text-lg font-bold text-slate-900">Signatures</h3>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <button
            type="button"
            class="rounded-3xl border-2 p-5 text-left transition hover:brightness-[0.99] sm:p-6"
            :class="
              record.schoolSigned
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-slate-200 bg-slate-50/40 hover:border-[#216EC2]/30'
            "
            @click="openSchoolSignatureModal"
          >
            <div class="mb-4 flex items-center gap-3">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-full"
                :class="record.schoolSigned ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'"
              >
                <svg
                  v-if="record.schoolSigned"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </span>
              <div>
                <p class="font-bold text-slate-900">Signature de l'école</p>
                <p class="text-sm font-semibold" :class="record.schoolSigned ? 'text-emerald-600' : 'text-slate-500'">
                  {{ record.schoolSigned ? 'Signé' : 'Non signé' }}
                </p>
              </div>
            </div>
            <div v-if="record.schoolSigned" class="min-h-[72px]">
              <img
                v-if="record.schoolSignatureUrl"
                :src="resolveUploadUrl(record.schoolSignatureUrl)"
                alt="Signature de l'école"
                class="max-h-20 max-w-full object-contain"
              >
              <p
                v-else-if="record.schoolSignatureText"
                class="font-signature text-3xl leading-none text-slate-800"
              >
                {{ record.schoolSignatureText }}
              </p>
              <p v-if="record.schoolSignedAt" class="mt-3 text-xs font-medium text-slate-500">
                Signé le {{ formatSignedDate(record.schoolSignedAt) }}
              </p>
            </div>
            <p v-else class="text-sm text-slate-500">Cliquez pour signer (manuscrite ou image).</p>
          </button>

          <div
            class="rounded-3xl border-2 p-5 sm:p-6"
            :class="
              record.parentSigned
                ? 'border-emerald-200 bg-emerald-50/40'
                : 'border-slate-200 bg-white'
            "
          >
            <div class="mb-4 flex items-center gap-3">
              <span
                class="inline-flex h-10 w-10 items-center justify-center rounded-full"
                :class="record.parentSigned ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'"
              >
                <svg
                  v-if="record.parentSigned"
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </span>
              <div>
                <p class="font-bold text-slate-900">Signature des parents</p>
                <p class="text-sm font-semibold" :class="record.parentSigned ? 'text-emerald-600' : 'text-slate-500'">
                  {{ record.parentSigned ? 'Signé' : 'Non signé' }}
                </p>
              </div>
            </div>
            <div v-if="record.parentSigned && record.parentSignatureUrl" class="min-h-[72px]">
              <img
                :src="resolveUploadUrl(record.parentSignatureUrl)"
                alt="Signature des parents"
                class="max-h-24 max-w-full rounded-lg border border-slate-200 bg-white object-contain p-2"
              >
              <p v-if="record.parentSignedAt" class="mt-3 text-xs font-medium text-slate-500">
                Signé le {{ formatSignedDate(record.parentSignedAt) }}
              </p>
            </div>
            <p v-else class="text-sm text-slate-500">
              La signature parent apparaîtra ici une fois déposée depuis l'espace parent (lecture d'image).
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-[#216EC2]/30 bg-white px-3 py-2 text-xs font-semibold text-[#216EC2] shadow-sm transition hover:bg-[#216EC2]/5 disabled:opacity-50"
            :disabled="requestingParent || record.parentSigned"
            @click="requestParentSignature"
          >
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m22 2-7 20-4-9-9-4Z" stroke-linejoin="round" />
              <path d="M22 2 11 13" stroke-linecap="round" />
            </svg>
            {{ requestingParent ? 'Envoi…' : 'Demander une signature' }}
          </button>
          <p v-if="requestSuccess" class="text-xs font-medium text-emerald-600">
            E-mail et notification envoyés au parent.
          </p>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <div
        v-if="schoolModalOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeSchoolModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="school-signature-title"
          class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white px-6 pb-7 pt-6 shadow-xl sm:px-8"
          @click.stop
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2 id="school-signature-title" class="text-lg font-bold text-[#216EC2] sm:text-xl">
              Signature de l'école
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2]"
              aria-label="Fermer"
              :disabled="signingSchool"
              @click="closeSchoolModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div v-if="schoolSignStep === 'choose'" class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-3xl border-2 border-[#216EC2]/25 bg-[#216EC2]/5 p-5 text-left transition hover:border-[#216EC2]/50 hover:bg-[#216EC2]/10"
              @click="openHandwrittenStep"
            >
              <p class="font-bold text-slate-900">Signature manuscrite</p>
              <p class="mt-1 text-sm text-slate-500">Dessinez votre signature à la souris ou au doigt.</p>
            </button>
            <button
              type="button"
              class="rounded-3xl border-2 border-[#216EC2]/25 bg-white p-5 text-left transition hover:border-[#216EC2]/50 hover:bg-slate-50"
              @click="schoolSignStep = 'image'"
            >
              <p class="font-bold text-slate-900">Importer une image</p>
              <p class="mt-1 text-sm text-slate-500">Téléverser une photo ou un scan de signature.</p>
            </button>
          </div>

          <div v-else-if="schoolSignStep === 'handwritten'" class="space-y-3">
            <p class="text-sm text-slate-500">Tracez votre signature dans le cadre ci-dessous.</p>
            <div class="signature-canvas-wrap overflow-hidden rounded-2xl border-2 border-slate-200">
              <canvas
                ref="signatureCanvas"
                class="block h-[180px] w-full touch-none cursor-crosshair bg-transparent"
                width="480"
                height="180"
                aria-label="Zone de signature manuscrite"
                @mousedown="onDrawStart"
                @mousemove="onDrawMove"
                @mouseup="onDrawEnd"
                @mouseleave="onDrawEnd"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend.prevent="onDrawEnd"
              />
            </div>
            <button
              type="button"
              class="text-sm font-semibold text-[#216EC2] hover:underline"
              @click="clearSignatureCanvas"
            >
              Effacer et recommencer
            </button>
          </div>

          <div v-else class="space-y-4">
            <input
              ref="signatureFileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="hidden"
              @change="onSignatureFileSelect"
            >
            <button
              type="button"
              class="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#216EC2]/35 bg-[#216EC2]/5 px-4 py-10 transition hover:bg-[#216EC2]/10"
              @click="signatureFileInput?.click()"
            >
              <img
                v-if="signaturePreview"
                :src="signaturePreview"
                alt="Aperçu signature"
                class="max-h-28 max-w-full object-contain"
              >
              <template v-else>
                <svg class="h-10 w-10 text-[#216EC2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m17 8-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="text-sm font-semibold text-[#216EC2]">Choisir une image de signature</span>
              </template>
            </button>
          </div>

          <p v-if="schoolSignError" class="mt-4 text-sm text-red-600">{{ schoolSignError }}</p>

          <div v-if="schoolSignStep !== 'choose'" class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              class="rounded-2xl border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              :disabled="signingSchool"
              @click="schoolSignStep = 'choose'"
            >
              Retour
            </button>
            <button
              type="button"
              class="rounded-2xl bg-[#216EC2] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              :disabled="signingSchool"
              @click="confirmSchoolSignature"
            >
              {{ signingSchool ? 'Enregistrement…' : 'Valider la signature' }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="editModalOpen"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeEditModal" />
        <div
          role="dialog"
          aria-modal="true"
          class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white px-6 pb-7 pt-6 shadow-xl sm:px-8"
          @click.stop
        >
          <h2 class="mb-5 text-lg font-bold text-[#216EC2]">Modifier la fiche santé</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <label v-for="field in editFields" :key="field.key" class="block" :class="field.full ? 'sm:col-span-2' : ''">
              <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">{{ field.label }}</span>
              <textarea
                v-if="field.multiline"
                v-model="editForm[field.key]"
                rows="3"
                class="w-full rounded-2xl border-2 border-[#216EC2]/30 px-4 py-3 text-sm outline-none focus:border-[#216EC2]"
              />
              <input
                v-else
                v-model="editForm[field.key]"
                type="text"
                class="w-full rounded-2xl border-2 border-[#216EC2]/30 px-4 py-3 text-sm outline-none focus:border-[#216EC2]"
              >
            </label>
          </div>

          <div class="mt-6">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-bold text-slate-900">Vaccinations</span>
              <button
                type="button"
                class="text-sm font-semibold text-[#216EC2]"
                @click="addVaccinationRow"
              >
                + Ajouter
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="(vac, i) in editForm.vaccinations"
                :key="i"
                class="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <input
                  v-model="vac.name"
                  type="text"
                  placeholder="Nom (ex. BCG)"
                  class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                <select v-model="vac.status" class="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <option value="DONE">Effectuée</option>
                  <option value="MISSING">Manquante</option>
                </select>
                <input
                  v-if="vac.status === 'DONE'"
                  v-model="vac.vaccinatedAt"
                  type="date"
                  class="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
              </div>
            </div>
          </div>

          <p v-if="editError" class="mt-4 text-sm text-red-600">{{ editError }}</p>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-2xl border-2 border-slate-200 px-5 py-3 text-sm font-bold"
              :disabled="editSaving"
              @click="closeEditModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="rounded-2xl bg-[#216EC2] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              :disabled="editSaving"
              @click="saveEdit"
            >
              {{ editSaving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { h, nextTick } from 'vue'

export type HealthVaccination = {
  id: string
  name: string
  status: 'DONE' | 'MISSING'
  vaccinatedAt: string | null
  dateLabel: string | null
}

export type HealthRecordDto = {
  id: string
  childId: string
  bloodGroup: string
  doctorName: string
  doctorPhone: string
  knownAllergies: string
  ongoingTreatments: string
  dietaryRegime: string
  instructions: string
  schoolSignatureType: 'CALLIGRAPHY' | 'HANDWRITTEN' | 'IMAGE' | null
  schoolSignatureText: string | null
  schoolSignatureUrl: string | null
  schoolSignedAt: string | null
  schoolSigned: boolean
  parentSignatureUrl: string | null
  parentSignedAt: string | null
  parentSigned: boolean
  parentSignatureRequestedAt: string | null
  isValid: boolean
  statusLabel: string
  vaccinations: HealthVaccination[]
}

const props = defineProps<{ childId: string }>()

const emit = defineEmits<{
  status: [payload: { pendingSignature: boolean }]
}>()

const { token } = useAuth()
const config = useRuntimeConfig()

const record = ref<HealthRecordDto | null>(null)
const pending = ref(true)
const loadError = ref<string | null>(null)
const requestingParent = ref(false)
const requestSuccess = ref(false)

const schoolModalOpen = ref(false)
const schoolSignStep = ref<'choose' | 'handwritten' | 'image'>('choose')
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
let signatureHasInk = false
const signatureFile = ref<File | null>(null)
const signaturePreview = ref('')
const signatureFileInput = ref<HTMLInputElement | null>(null)
const signingSchool = ref(false)
const schoolSignError = ref<string | null>(null)

const editModalOpen = ref(false)
const editSaving = ref(false)
const editError = ref<string | null>(null)
const editForm = reactive({
  bloodGroup: '',
  doctorName: '',
  doctorPhone: '',
  knownAllergies: '',
  ongoingTreatments: '',
  dietaryRegime: '',
  instructions: '',
  vaccinations: [] as { name: string; status: 'DONE' | 'MISSING'; vaccinatedAt: string }[],
})

const editFields = [
  { key: 'bloodGroup' as const, label: 'Groupe sanguin' },
  { key: 'doctorName' as const, label: 'Médecin traitant' },
  { key: 'doctorPhone' as const, label: 'Téléphone médecin' },
  { key: 'knownAllergies' as const, label: 'Allergies connues', multiline: true, full: true },
  { key: 'ongoingTreatments' as const, label: 'Traitements en cours', multiline: true, full: true },
  { key: 'dietaryRegime' as const, label: 'Régime alimentaire', multiline: true, full: true },
  { key: 'instructions' as const, label: 'Consignes / remarques', multiline: true, full: true },
]

function iconBlood() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' }, [
    h('path', { d: 'M12 2s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z' }),
  ])
}
function iconUser() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '8', r: '4' }),
    h('path', { d: 'M6 21v-1a6 6 0 0 1 12 0v1' }),
  ])
}
function iconPhone() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z',
    }),
  ])
}
function iconHeart() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z',
    }),
  ])
}
function iconPill() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'm10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z' }),
    h('path', { d: 'm8.5 8.5 7 7', 'stroke-linecap': 'round' }),
  ])
}
function iconDiet() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z' }),
    h('path', { d: 'm9 12 2 2 4-4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])
}

const infoTiles = computed(() => {
  const r = record.value
  if (!r) return []
  return [
    { label: 'Groupe sanguin', value: r.bloodGroup, icon: iconBlood, iconWrap: 'bg-rose-100 text-rose-600' },
    { label: 'Médecin traitant', value: r.doctorName, icon: iconUser, iconWrap: 'bg-[#216EC2]/10 text-[#216EC2]' },
    { label: 'Téléphone médecin', value: r.doctorPhone, icon: iconPhone, iconWrap: 'bg-emerald-100 text-emerald-600' },
    { label: 'Allergies connues', value: r.knownAllergies, icon: iconHeart, iconWrap: 'bg-pink-100 text-pink-600' },
    { label: 'Traitements en cours', value: r.ongoingTreatments, icon: iconPill, iconWrap: 'bg-violet-100 text-violet-600' },
    { label: 'Régime alimentaire', value: r.dietaryRegime, icon: iconDiet, iconWrap: 'bg-emerald-100 text-emerald-600' },
  ]
})

function resolveUploadUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  const apiBase = config.public.apiBase as string
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

function formatSignedDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

function applyRecord(data: HealthRecordDto) {
  record.value = data
  emit('status', { pendingSignature: !data.isValid })
}

async function loadRecord() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  pending.value = true
  loadError.value = null
  try {
    const data = await $fetch<HealthRecordDto>(`${config.public.apiBase}/admin/students/${id}/health-record`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    applyRecord(data)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Chargement impossible.'
    record.value = null
  } finally {
    pending.value = false
  }
}

function openSchoolSignatureModal() {
  schoolSignStep.value = 'choose'
  signatureFile.value = null
  signaturePreview.value = ''
  signatureHasInk = false
  schoolSignError.value = null
  schoolModalOpen.value = true
}

function openHandwrittenStep() {
  schoolSignStep.value = 'handwritten'
  signatureHasInk = false
  nextTick(() => initSignatureCanvas())
}

function initSignatureCanvas() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  signatureHasInk = false
}

function clearSignatureCanvas() {
  initSignatureCanvas()
}

function canvasPoint(clientX: number, clientY: number) {
  const canvas = signatureCanvas.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

function onDrawStart(e: MouseEvent) {
  const ctx = signatureCanvas.value?.getContext('2d')
  if (!ctx) return
  isDrawing.value = true
  const { x, y } = canvasPoint(e.clientX, e.clientY)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function onDrawMove(e: MouseEvent) {
  if (!isDrawing.value) return
  const ctx = signatureCanvas.value?.getContext('2d')
  if (!ctx) return
  const { x, y } = canvasPoint(e.clientX, e.clientY)
  ctx.lineTo(x, y)
  ctx.stroke()
  signatureHasInk = true
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  const ctx = signatureCanvas.value?.getContext('2d')
  if (!ctx) return
  isDrawing.value = true
  const { x, y } = canvasPoint(touch.clientX, touch.clientY)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

function onTouchMove(e: TouchEvent) {
  if (!isDrawing.value) return
  const touch = e.touches[0]
  if (!touch) return
  const ctx = signatureCanvas.value?.getContext('2d')
  if (!ctx) return
  const { x, y } = canvasPoint(touch.clientX, touch.clientY)
  ctx.lineTo(x, y)
  ctx.stroke()
  signatureHasInk = true
}

function onDrawEnd() {
  isDrawing.value = false
}

async function exportHandwrittenSignatureFile(): Promise<File | null> {
  const canvas = signatureCanvas.value
  if (!canvas || !signatureHasInk) return null
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png')
  })
  if (!blob) return null
  return new File([blob], 'signature-manuscrite.png', { type: 'image/png' })
}

function closeSchoolModal() {
  if (signingSchool.value) return
  schoolModalOpen.value = false
}

function onSignatureFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  signatureFile.value = file ?? null
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      signaturePreview.value = String(reader.result ?? '')
    }
    reader.readAsDataURL(file)
  } else {
    signaturePreview.value = ''
  }
  input.value = ''
}

async function confirmSchoolSignature() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  signingSchool.value = true
  schoolSignError.value = null
  try {
    if (schoolSignStep.value === 'handwritten') {
      const file = await exportHandwrittenSignatureFile()
      if (!file) {
        schoolSignError.value = 'Dessinez votre signature dans le cadre.'
        return
      }
      const fd = new FormData()
      fd.append('type', 'HANDWRITTEN')
      fd.append('file', file)
      const data = await $fetch<HealthRecordDto>(
        `${config.public.apiBase}/admin/students/${id}/health-record/school-signature`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
          body: fd,
        },
      )
      applyRecord(data)
    } else if (schoolSignStep.value === 'image') {
      if (!signatureFile.value) {
        schoolSignError.value = 'Choisissez une image de signature.'
        return
      }
      const fd = new FormData()
      fd.append('type', 'IMAGE')
      fd.append('file', signatureFile.value)
      const data = await $fetch<HealthRecordDto>(
        `${config.public.apiBase}/admin/students/${id}/health-record/school-signature`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
          body: fd,
        },
      )
      applyRecord(data)
    } else {
      return
    }
    schoolModalOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    schoolSignError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Signature impossible.'
  } finally {
    signingSchool.value = false
  }
}

async function requestParentSignature() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  requestingParent.value = true
  requestSuccess.value = false
  try {
    const data = await $fetch<HealthRecordDto>(
      `${config.public.apiBase}/admin/students/${id}/health-record/request-parent-signature`,
      { method: 'POST', headers: { Authorization: `Bearer ${t}` } },
    )
    applyRecord(data)
    requestSuccess.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Demande impossible.'
  } finally {
    requestingParent.value = false
  }
}

function openEditModal() {
  const r = record.value
  if (!r) return
  editForm.bloodGroup = r.bloodGroup
  editForm.doctorName = r.doctorName
  editForm.doctorPhone = r.doctorPhone
  editForm.knownAllergies = r.knownAllergies
  editForm.ongoingTreatments = r.ongoingTreatments
  editForm.dietaryRegime = r.dietaryRegime
  editForm.instructions = r.instructions
  editForm.vaccinations = r.vaccinations.map((v) => ({
    name: v.name,
    status: v.status,
    vaccinatedAt: v.vaccinatedAt ?? '',
  }))
  if (!editForm.vaccinations.length) {
    editForm.vaccinations.push({ name: '', status: 'MISSING', vaccinatedAt: '' })
  }
  editError.value = null
  editModalOpen.value = true
}

function closeEditModal() {
  if (editSaving.value) return
  editModalOpen.value = false
}

function addVaccinationRow() {
  editForm.vaccinations.push({ name: '', status: 'MISSING', vaccinatedAt: '' })
}

async function saveEdit() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  editSaving.value = true
  editError.value = null
  try {
    const vaccinations = editForm.vaccinations
      .map((v) => ({
        name: v.name.trim(),
        status: v.status,
        vaccinatedAt: v.status === 'DONE' && v.vaccinatedAt ? v.vaccinatedAt : null,
      }))
      .filter((v) => v.name)
    const data = await $fetch<HealthRecordDto>(`${config.public.apiBase}/admin/students/${id}/health-record`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: { ...editForm, vaccinations },
    })
    applyRecord(data)
    editModalOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    editError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Enregistrement impossible.'
  } finally {
    editSaving.value = false
  }
}

watch(
  () => [props.childId, token.value] as const,
  () => {
    if (token.value && props.childId) void loadRecord()
  },
  { immediate: true },
)
</script>

<style scoped>
.font-signature {
  font-family: 'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive;
}

/* Damier léger : guide visuel uniquement, le PNG exporté reste transparent. */
.signature-canvas-wrap {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 14px 14px;
  background-position:
    0 0,
    0 7px,
    7px -7px,
    -7px 0;
}
</style>
