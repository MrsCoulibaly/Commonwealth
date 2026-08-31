<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <NuxtLink
        to="/admin/ateliers"
        class="inline-flex items-center gap-2 text-base font-semibold text-[#216EC2] transition hover:underline sm:text-lg"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Retour à la liste des Ateliers
      </NuxtLink>

      <NuxtLink
        v-if="detail"
        :to="`/admin/ateliers?edit=${detail.atelier.id}`"
        class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 20h9" stroke-linecap="round" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linejoin="round" />
        </svg>
        Modifier
      </NuxtLink>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</p>
    <p v-if="pending" class="text-sm text-slate-500">Chargement de l’atelier…</p>

    <template v-if="detail && !pending">
      <!-- Header block (maquette) : photo hors du cadre -->
      <section class="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
        <img
          class="h-[180px] w-full shrink-0 rounded-2xl object-cover sm:h-auto sm:w-[220px] lg:w-[260px]"
          :src="mediaUrl(atelier.image)"
          :alt="atelier.title"
        />

        <div class="min-w-0 flex-1 rounded-2xl border border-[#BFD6F0] bg-white p-4 sm:p-5">
          <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
            <div class="min-w-0 self-center">
              <h1 class="text-[22px] font-bold leading-tight text-slate-900 sm:text-[26px]">{{ atelier.title }}</h1>
              <p class="mt-1.5 text-sm leading-6 text-slate-500">{{ atelier.description }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="pill in headerPills"
                  :key="pill.key"
                  class="inline-flex items-center gap-1.5 rounded-md bg-[#E8F1FB] px-2.5 py-1.5 text-[11px] font-semibold text-[#216EC2]"
                >
                  <span class="inline-flex" v-html="pill.icon" />
                  {{ pill.label }}
                </span>
              </div>
            </div>

            <div class="flex w-full flex-col justify-center gap-2.5 border-[#BFD6F0] lg:border-l lg:pl-5">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border border-[#86EFAC] bg-[#E8F8EF] px-3.5 py-3 text-left text-[#15803D] transition disabled:opacity-50"
                :disabled="actionPending"
                @click="togglePublish"
              >
                <span class="text-[12px] font-semibold leading-snug">
                  {{
                    atelier.published
                      ? 'Atelier actif (cliquer ici pour désactiver)'
                      : 'Atelier inactif (cliquer ici pour activer)'
                  }}
                </span>
                <span
                  class="relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition"
                  :class="atelier.published ? 'bg-[#22C55E]' : 'bg-[#86EFAC]'"
                  aria-hidden="true"
                >
                  <span
                    class="absolute h-3.5 w-3.5 rounded-full bg-white shadow transition"
                    :class="atelier.published ? 'right-0.5' : 'left-0.5'"
                  />
                </span>
              </button>

              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[#F9994B] bg-[#FFF7F0] px-3.5 py-3 text-left text-[13px] font-bold text-[#F9994B] transition hover:bg-[#FFEDD5] disabled:opacity-50"
                :disabled="actionPending"
                @click="duplicateAtelier"
              >
                <span>Dupliquer cet Atelier</span>
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke-linecap="round" />
                  <path d="M14.5 12v4M12.5 14h4" stroke-linecap="round" />
                </svg>
              </button>

              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[#E85D4C] bg-[#FEF2F2] px-3.5 py-3 text-left text-[13px] font-bold text-[#E85D4C] transition hover:bg-[#FEE2E2] disabled:opacity-50"
                :disabled="actionPending"
                @click="deleteAtelier"
              >
                <span>Supprimer cet Atelier</span>
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M3 6h18" stroke-linecap="round" />
                  <path d="M8 6V4h8v2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M19 6l-1 14H6L5 6" stroke-linejoin="round" />
                  <path d="M10 11v6M14 11v6" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
          :class="
            tab === 'detail'
              ? 'bg-[#216EC2] text-white shadow-sm'
              : 'border border-[#D7E5F5] bg-white text-slate-800 hover:bg-slate-50'
          "
          @click="tab = 'detail'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Détail de l’ateliers
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition"
          :class="
            tab === 'reservations'
              ? 'bg-[#216EC2] text-white shadow-sm'
              : 'border border-[#D7E5F5] bg-white text-slate-800 hover:bg-slate-50'
          "
          @click="tab = 'reservations'"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="M3 9l2.5-4h13L21 9" />
            <path d="M9 13h6" stroke-linecap="round" />
          </svg>
          Réservations
        </button>
      </div>

      <!-- Detail tab -->
      <div v-if="tab === 'detail'" class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <section class="rounded-2xl border-2 border-[#216EC2]/25 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-base font-bold text-slate-900">Description</h2>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ atelier.description || 'Aucune description.' }}
          </p>

          <h2 class="mt-8 text-base font-bold text-slate-900">Informations importantes</h2>
          <ul v-if="importantBullets.length" class="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            <li v-for="(item, i) in importantBullets" :key="i">{{ item }}</li>
          </ul>
          <p v-else class="mt-3 text-sm text-slate-400">Aucune information importante renseignée.</p>
        </section>

        <section class="rounded-2xl border-2 border-[#216EC2]/25 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-base font-bold text-slate-900">Aperçues des réservations</h2>
          <dl class="mt-4 space-y-4 text-sm">
            <div class="flex items-start justify-between gap-3">
              <dt class="text-slate-500">Statut</dt>
              <dd class="inline-flex items-center gap-2 font-semibold text-slate-800">
                <span
                  class="h-2.5 w-2.5 rounded-full"
                  :class="atelier.published ? 'bg-[#216EC2]' : 'bg-slate-400'"
                />
                {{ atelier.published ? 'Actif' : 'Inactif' }}
              </dd>
            </div>
            <div class="flex items-start justify-between gap-3">
              <dt class="text-slate-500">Âge</dt>
              <dd class="font-semibold text-slate-800">{{ atelier.ageLabel }}</dd>
            </div>
            <div class="flex items-start justify-between gap-3">
              <dt class="text-slate-500">Date et heure</dt>
              <dd class="text-right font-semibold text-slate-800">{{ atelier.sessionLabel }}</dd>
            </div>
          </dl>

          <h3 class="mt-8 text-base font-bold text-slate-900">Tarifications</h3>
          <dl class="mt-4 space-y-4 text-sm">
            <div class="flex items-start justify-between gap-3">
              <dt class="text-slate-500">Tarifs</dt>
              <dd class="font-semibold text-slate-800">{{ atelier.priceLabel }}</dd>
            </div>
            <div>
              <div class="flex items-start justify-between gap-3">
                <dt class="text-slate-500">Places</dt>
                <dd class="font-semibold text-slate-800">{{ stats.booked }}/{{ stats.capacity }}</dd>
              </div>
              <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8F1FB]">
                <div
                  class="h-full rounded-full bg-[#22C55E] transition-all"
                  :style="{ width: `${placesPct}%` }"
                />
              </div>
            </div>
          </dl>
        </section>

        <section class="rounded-2xl border-2 border-[#216EC2]/25 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="text-base font-bold text-slate-900">Aperçues des réservations</h2>

          <div class="relative mx-auto mt-6 h-44 w-44">
            <div class="h-full w-full rounded-full" :style="{ background: donutGradient }" />
            <div class="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white text-center">
              <p class="text-2xl font-bold leading-none text-slate-900">{{ stats.booked }}/{{ stats.capacity }}</p>
              <p class="mt-1 text-[11px] font-medium text-slate-400">Réservées</p>
            </div>
          </div>

          <ul class="mt-6 space-y-2.5 text-sm">
            <li v-for="row in legend" :key="row.key" class="flex items-center justify-between gap-3">
              <span class="inline-flex items-center gap-2 text-slate-600">
                <span class="h-2.5 w-2.5 rounded-full" :style="{ background: row.color }" />
                {{ row.label }} ({{ row.value }})
              </span>
              <span class="font-semibold text-slate-800">{{ row.pct }}%</span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Reservations tab -->
      <section
        v-else
        class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr class="bg-[#216EC2] text-white">
                <th class="px-4 py-3.5 text-[12px] font-semibold">ID</th>
                <th class="px-4 py-3.5 text-[12px] font-semibold">Enfant</th>
                <th class="px-4 py-3.5 text-[12px] font-semibold">Parent / contact</th>
                <th class="px-4 py-3.5 text-[12px] font-semibold">Places</th>
                <th class="px-4 py-3.5 text-[12px] font-semibold">Statut</th>
                <th class="px-4 py-3.5 text-[12px] font-semibold">Réservé le</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EEF2F7]">
              <tr v-if="!detail.reservations.length">
                <td colspan="6" class="px-4 py-12 text-center text-slate-500">Aucune réservation pour cet atelier.</td>
              </tr>
              <tr v-for="row in detail.reservations" :key="row.id" class="bg-white text-slate-700">
                <td class="whitespace-nowrap px-4 py-3.5">
                  <span class="inline-flex rounded-md bg-[#E8F1FB] px-2.5 py-1 text-[12px] font-bold text-[#216EC2]">
                    {{ row.code }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3.5">
                  <p class="font-bold text-slate-900">{{ row.childName }}</p>
                  <p class="text-[11px] text-slate-400">{{ row.childAge }} ans</p>
                </td>
                <td class="px-4 py-3.5">
                  <p class="font-bold text-slate-900">{{ row.parentName }}</p>
                  <p class="text-[11px] text-slate-400">{{ row.parentPhone || '—' }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-3.5 font-semibold">{{ row.places }}</td>
                <td class="whitespace-nowrap px-4 py-3.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" :class="statusClass(row.status)">
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3.5 text-[12px] text-slate-500">{{ row.reservedAt }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type ReservationStatus = 'VALIDEE' | 'EN_ATTENTE' | 'ANNULEE'

type AtelierDetail = {
  id: string
  title: string
  description: string
  importantInfo: string
  image: string
  dateLabel: string
  dateValue: string
  endDateValue?: string
  timeLabel: string
  sessionLabel: string
  startTime: string
  endTime: string
  location: string
  ageLabel: string
  ageRange: string
  recommendedAge: string
  priceLabel: string
  isFree: boolean
  capacity: number
  booked: number
  published: boolean
}

type DetailDto = {
  atelier: AtelierDetail
  stats: {
    confirmed: number
    pending: number
    cancelled: number
    available: number
    booked: number
    capacity: number
    confirmedPct: number
    pendingPct: number
    cancelledPct: number
    availablePct: number
  }
  reservations: Array<{
    id: string
    code: string
    childName: string
    childAge: number
    parentName: string
    parentPhone: string
    places: number
    status: ReservationStatus
    reservedAt: string
  }>
}

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const config = useRuntimeConfig()

const tab = ref<'detail' | 'reservations'>('detail')
const detail = ref<DetailDto | null>(null)
const pending = ref(true)
const loadError = ref<string | null>(null)
const actionPending = ref(false)

const atelierId = computed(() => String(route.params.id || ''))
const atelier = computed(() => detail.value!.atelier)
const stats = computed(() => detail.value!.stats)

useHead(() => ({
  title: detail.value ? `Atelier · ${detail.value.atelier.title}` : 'Détail atelier',
}))

function authHeaders() {
  const t = token.value
  if (!t) throw new Error('Session expirée. Reconnectez-vous.')
  return { Authorization: `Bearer ${t}` }
}

function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function apiErrorMessage(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string | string[] }; message?: string }
  const msg = err?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  return msg || err?.message || fallback
}

async function loadDetail() {
  loadError.value = null
  pending.value = true
  try {
    detail.value = await $fetch<DetailDto>(`${config.public.apiBase}/admin/ateliers/${atelierId.value}`, {
      headers: authHeaders(),
    })
  } catch (e: unknown) {
    detail.value = null
    loadError.value = apiErrorMessage(e, "Impossible de charger l'atelier.")
  } finally {
    pending.value = false
  }
}

const headerPills = computed(() => {
  if (!detail.value) return []
  const a = detail.value.atelier
  const icon = (path: string) =>
    `<svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${path}</svg>`
  return [
    {
      key: 'date',
      label: a.dateLabel,
      icon: icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round"/>'),
    },
    {
      key: 'time',
      label: a.timeLabel,
      icon: icon('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round"/>'),
    },
    {
      key: 'age',
      label: a.ageLabel,
      icon: icon('<circle cx="12" cy="8" r="3.5"/><path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" stroke-linecap="round"/>'),
    },
    {
      key: 'price',
      label: a.priceLabel,
      icon: icon(
        '<path d="M12 3l2.2 2.2L20 4l-1.2 5.8L21 12l-2.2 2.2L20 20l-5.8-1.2L12 21l-2.2-2.2L4 20l1.2-5.8L3 12l2.2-2.2L4 4l5.8 1.2L12 3Z" stroke-linejoin="round"/>',
      ),
    },
  ]
})

const importantBullets = computed(() => {
  const raw = detail.value?.atelier.importantInfo?.trim() || ''
  if (!raw) return []
  return raw
    .split(/\r?\n|•|;/)
    .map((s) => s.replace(/^[-–•*\d.)\s]+/, '').trim())
    .filter(Boolean)
})

const placesPct = computed(() => {
  const s = stats.value
  if (!s.capacity) return 0
  return Math.min(100, Math.round((s.booked / s.capacity) * 100))
})

const legend = computed(() => {
  const s = stats.value
  return [
    { key: 'confirmed', label: 'Confirmées', value: s.confirmed, pct: s.confirmedPct, color: '#1E4F9C' },
    { key: 'pending', label: 'En attente', value: s.pending, pct: s.pendingPct, color: '#3B82C4' },
    { key: 'cancelled', label: 'Annulées', value: s.cancelled, pct: s.cancelledPct, color: '#93C5FD' },
    { key: 'available', label: 'Disponibles', value: s.available, pct: s.availablePct, color: '#D1D5DB' },
  ]
})

const donutGradient = computed(() => {
  const s = stats.value
  const parts = [
    { pct: s.confirmedPct, color: '#1E4F9C' },
    { pct: s.pendingPct, color: '#3B82C4' },
    { pct: s.cancelledPct, color: '#93C5FD' },
    { pct: s.availablePct, color: '#D1D5DB' },
  ]
  let cursor = 0
  const stops: string[] = []
  for (const part of parts) {
    const next = cursor + part.pct
    stops.push(`${part.color} ${cursor}% ${next}%`)
    cursor = next
  }
  if (cursor < 100) stops.push(`#E5E7EB ${cursor}% 100%`)
  return `conic-gradient(${stops.join(', ')})`
})

function statusLabel(status: ReservationStatus) {
  if (status === 'VALIDEE') return 'Validée'
  if (status === 'EN_ATTENTE') return 'En attente'
  return 'Annulée'
}

function statusClass(status: ReservationStatus) {
  if (status === 'VALIDEE') return 'bg-emerald-50 text-emerald-700'
  if (status === 'EN_ATTENTE') return 'bg-orange-50 text-orange-700'
  return 'bg-slate-100 text-slate-600'
}

async function togglePublish() {
  if (!detail.value) return
  actionPending.value = true
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/${atelierId.value}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { published: !detail.value.atelier.published },
    })
    await loadDetail()
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, 'Impossible de mettre à jour le statut.')
  } finally {
    actionPending.value = false
  }
}

async function duplicateAtelier() {
  if (!detail.value) return
  actionPending.value = true
  loadError.value = null
  try {
    const created = await $fetch<{ id: string }>(`${config.public.apiBase}/admin/ateliers/${atelierId.value}/duplicate`, {
      method: 'POST',
      headers: authHeaders(),
    })
    await router.push(`/admin/ateliers/${created.id}`)
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, "Impossible de dupliquer l'atelier.")
  } finally {
    actionPending.value = false
  }
}

async function deleteAtelier() {
  if (!detail.value) return
  if (!confirm(`Supprimer l'atelier « ${detail.value.atelier.title} » ? Cette action est irréversible.`)) return
  actionPending.value = true
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/${atelierId.value}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    await router.push('/admin/ateliers')
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, "Impossible de supprimer l'atelier.")
  } finally {
    actionPending.value = false
  }
}

watch(
  () => route.params.id,
  () => {
    void loadDetail()
  },
)

onMounted(() => {
  void loadDetail()
})
</script>
