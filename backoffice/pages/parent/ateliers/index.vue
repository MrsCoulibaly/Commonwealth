<template>
  <div>
    <h1 class="mb-3 text-4xl font-bold text-brandBlue sm:text-5xl">Ateliers</h1>
    <p class="mb-6 max-w-3xl text-base leading-relaxed text-slate-500 sm:text-lg">
      Découvrez nos ateliers éducatifs et ludiques et inscrivez vous et votre enfant en quelques clics
    </p>

    <div class="mb-8 flex gap-2 border-b border-slate-200">
      <button
        type="button"
        class="border-b-2 px-4 py-2.5 text-sm font-semibold transition"
        :class="
          tab === 'ateliers'
            ? 'border-brandBlue text-brandBlue'
            : 'border-transparent text-slate-500 hover:text-brandBlue'
        "
        @click="tab = 'ateliers'"
      >
        Ateliers
      </button>
      <button
        type="button"
        class="border-b-2 px-4 py-2.5 text-sm font-semibold transition"
        :class="
          tab === 'reservations'
            ? 'border-brandBlue text-brandBlue'
            : 'border-transparent text-slate-500 hover:text-brandBlue'
        "
        @click="openReservations"
      >
        Mes réservations
        <span
          v-if="reservations.length"
          class="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brandBlue/10 px-1.5 text-[11px] font-bold text-brandBlue"
        >
          {{ reservations.length }}
        </span>
      </button>
    </div>

    <!-- Liste ateliers -->
    <div v-if="tab === 'ateliers'">
      <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative min-w-0 w-full sm:max-w-md">
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="search"
            type="search"
            class="w-full rounded-xl border border-brandBlue/40 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none ring-brandBlue/20 focus:border-brandBlue focus:ring-2"
            placeholder="Search"
            autocomplete="off"
          >
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <label class="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-brandBlue px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round" />
            </svg>
            <span>{{ dateFilterLabel }}</span>
            <input v-model="dateFilter" type="date" class="sr-only">
          </label>

          <div class="relative">
            <select
              v-model="sort"
              class="h-11 appearance-none rounded-xl border-0 bg-brandOrange py-0 pl-4 pr-10 text-sm font-bold text-white shadow-sm outline-none transition hover:brightness-105"
              aria-label="Trier par"
            >
              <option value="date_asc" class="bg-white text-slate-800">Trier par</option>
              <option value="date_desc" class="bg-white text-slate-800">Date ↓</option>
              <option value="title_asc" class="bg-white text-slate-800">Titre A → Z</option>
              <option value="title_desc" class="bg-white text-slate-800">Titre Z → A</option>
            </select>
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>

          <button
            v-if="dateFilter"
            type="button"
            class="text-sm font-medium text-slate-500 underline hover:text-brandBlue"
            @click="dateFilter = ''"
          >
            Effacer la date
          </button>
        </div>
      </div>

      <p v-if="pending" class="text-sm text-slate-500">Chargement des ateliers…</p>
      <p v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ loadError }}
      </p>
      <p
        v-else-if="!filtered.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center text-sm text-slate-500"
      >
        Aucun atelier prévu pour le moment.
      </p>

      <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="w in filtered"
          :key="w.id"
          class="flex flex-col rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        >
          <h2 class="text-[15px] font-bold leading-snug text-slate-900">{{ w.title }}</h2>

          <div class="mt-3 overflow-hidden rounded-xl">
            <img class="h-[150px] w-full object-cover" :src="mediaUrl(w.image)" :alt="w.title">
          </div>

          <p class="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{{ w.description }}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <span class="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#FFF1E8] px-2 py-1 text-[10px] font-medium leading-tight text-[#E87A3A]">
              <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round" />
              </svg>
              {{ w.date }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-[#E8F1FB] px-2 py-1 text-[10px] font-medium text-brandBlue">
              <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ w.time }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-[#EAF8EF] px-2 py-1 text-[10px] font-medium text-brandGreen">
              <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" stroke-linecap="round" />
              </svg>
              {{ w.age }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-md bg-[#F3EBFA] px-2 py-1 text-[10px] font-medium text-brandPurple">
              <svg viewBox="0 0 24 24" fill="none" class="h-3 w-3 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 3l2.2 2.2L20 4l-1.2 5.8L21 12l-2.2 2.2L20 20l-5.8-1.2L12 21l-2.2-2.2L4 20l1.2-5.8L3 12l2.2-2.2L4 4l5.8 1.2L12 3Z" stroke-linejoin="round" />
              </svg>
              {{ w.price }}
            </span>
          </div>

          <NuxtLink
            v-if="(w.placesRemaining ?? 0) > 0"
            :to="`/parent/ateliers/${w.id}`"
            class="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brandBlue text-sm font-semibold text-white transition hover:brightness-105"
          >
            Inscription
          </NuxtLink>
          <span
            v-else
            class="mt-4 block"
            title="Plus de places disponibles"
          >
            <button
              type="button"
              disabled
              class="inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-lg bg-slate-300 text-sm font-semibold text-slate-500"
            >
              Complet
            </button>
          </span>
        </article>
      </div>
    </div>

    <!-- Mes réservations -->
    <div v-else>
      <p v-if="reservationsPending" class="text-sm text-slate-500">Chargement de vos réservations…</p>
      <p v-else-if="reservationsError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ reservationsError }}
      </p>
      <p
        v-else-if="!reservations.length"
        class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center text-sm text-slate-500"
      >
        Vous n’avez aucune réservation pour le moment.
      </p>

      <div v-else class="space-y-4">
        <article
          v-for="r in reservations"
          :key="r.id"
          class="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center"
        >
          <img
            class="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-28"
            :src="mediaUrl(r.workshop.image)"
            :alt="r.workshop.title"
          >
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex rounded-md bg-[#E8F1FB] px-2.5 py-1 text-[11px] font-bold text-brandBlue">
                {{ r.code }}
              </span>
              <span
                class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold"
                :class="statusClass(r.status)"
              >
                {{ statusLabel(r.status) }}
              </span>
            </div>
            <h2 class="mt-2 text-base font-bold text-slate-900">{{ r.workshop.title }}</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ r.workshop.date }} · {{ r.workshop.time }}
            </p>
            <p v-if="r.childName && r.childName !== 'À préciser'" class="mt-1 text-sm text-slate-600">
              Enfant(s) : <span class="font-medium">{{ r.childName }}</span>
            </p>
            <p class="mt-1 text-xs text-slate-400">
              {{ r.places }} place{{ r.places > 1 ? 's' : '' }} · Réservé le {{ r.reservedAtLabel }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
})

useHead({ title: 'Ateliers' })

type Workshop = {
  id: string
  title: string
  description: string
  image: string
  date: string
  dateValue: string
  endDateValue?: string
  time: string
  age: string
  price: string
  placesRemaining?: number
}

type ReservationStatus = 'VALIDEE' | 'EN_ATTENTE' | 'ANNULEE'

type Reservation = {
  id: string
  code: string
  status: ReservationStatus
  places: number
  childName: string
  reservedAtLabel: string
  workshop: {
    id: string
    title: string
    image: string
    date: string
    time: string
  }
}

const { authFetch } = useParentAuth()
const config = useRuntimeConfig()

const tab = ref<'ateliers' | 'reservations'>('ateliers')
const items = ref<Workshop[]>([])
const pending = ref(true)
const loadError = ref<string | null>(null)

const reservations = ref<Reservation[]>([])
const reservationsPending = ref(false)
const reservationsError = ref<string | null>(null)
const reservationsLoaded = ref(false)

const search = ref('')
const dateFilter = ref('')
const sort = ref('date_asc')

const dateFilterLabel = computed(() => {
  if (!dateFilter.value) return 'Sélectionner la date'
  const [y, m, d] = dateFilter.value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let list = items.value.filter((w) => {
    if (dateFilter.value) {
      const start = w.dateValue
      const end = w.endDateValue || w.dateValue
      if (dateFilter.value < start || dateFilter.value > end) return false
    }
    if (!q) return true
    return `${w.title} ${w.description} ${w.age}`.toLowerCase().includes(q)
  })
  if (sort.value === 'title_asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  else if (sort.value === 'title_desc') list = [...list].sort((a, b) => b.title.localeCompare(a.title, 'fr'))
  else if (sort.value === 'date_desc') list = [...list].sort((a, b) => b.dateValue.localeCompare(a.dateValue))
  else list = [...list].sort((a, b) => a.dateValue.localeCompare(b.dateValue))
  return list
})

function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

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

async function loadWorkshops() {
  pending.value = true
  loadError.value = null
  try {
    const data = await authFetch<{ items: Workshop[] }>('/parent/ateliers')
    items.value = data.items ?? []
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les ateliers.'
    items.value = []
  } finally {
    pending.value = false
  }
}

async function loadReservations() {
  reservationsPending.value = true
  reservationsError.value = null
  try {
    const data = await authFetch<{ items: Reservation[] }>('/parent/ateliers/reservations')
    reservations.value = data.items ?? []
    reservationsLoaded.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    reservationsError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger vos réservations.'
    reservations.value = []
  } finally {
    reservationsPending.value = false
  }
}

function openReservations() {
  tab.value = 'reservations'
  if (!reservationsLoaded.value) void loadReservations()
}

onMounted(() => {
  void loadWorkshops()
  void loadReservations()
})
</script>
