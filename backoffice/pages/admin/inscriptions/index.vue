<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-slate-800">Gestion des inscriptions</h1>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>

    <!-- Cartes statistiques -->
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border-2 border-[#216EC2]/30 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-600">{{ card.title }}</h2>
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            :class="card.iconBg"
            v-html="card.icon"
          />
        </div>
        <p class="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          <span v-if="pending" class="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
        <p class="mt-1 text-xs font-medium text-slate-400">Total cumulé</p>
      </article>
    </section>

    <!-- Recherche -->
    <div class="relative max-w-2xl">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" stroke-linecap="round" />
        </svg>
      </span>
      <input
        v-model="searchInput"
        type="search"
        class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
        placeholder="Rechercher…"
        autocomplete="off"
      />
    </div>

    <!-- Tableau -->
    <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/20 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
        <label class="sr-only" for="inscriptions-sort">Trier par</label>
        <select
          id="inscriptions-sort"
          v-model="sort"
          class="rounded-xl border-2 border-[#F9994B] bg-white px-4 py-2.5 text-sm font-bold text-[#F9994B] outline-none focus:ring-2 focus:ring-[#F9994B]/30"
          @change="page = 1"
        >
          <option value="date_desc">Trier par : plus récent</option>
          <option value="date_asc">Trier par : plus ancien</option>
          <option value="name_asc">Trier par : nom A → Z</option>
          <option value="name_desc">Trier par : nom Z → A</option>
        </select>
      </div>

      <div class="px-5 pt-2 pb-1">
        <h2 class="text-base font-bold text-slate-800">Demandes récentes d'inscription</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Noms de l'élèves</th>
              <th class="px-4 py-3 font-semibold">Âges</th>
              <th class="px-4 py-3 font-semibold">Classe</th>
              <th class="px-4 py-3 font-semibold">Année</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <template v-if="pending">
              <tr v-for="n in 5" :key="'s-' + n">
                <td v-for="c in 6" :key="c" class="px-4 py-3">
                  <span class="inline-block h-4 w-full max-w-[6rem] animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!rows.length">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">Aucun résultat.</td>
            </tr>
            <tr v-for="row in rows" v-else :key="row.id" class="text-slate-700">
              <td class="whitespace-nowrap px-4 py-3 font-medium">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-3 font-medium">{{ row.studentName }}</td>
              <td class="px-4 py-3">{{ row.age }}</td>
              <td class="px-4 py-3">{{ row.className }}</td>
              <td class="whitespace-nowrap px-4 py-3">{{ row.schoolYear }}</td>
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/admin/inscriptions/${row.id}`"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-[#216EC2]/50 bg-[#216EC2]/5 px-3 py-1.5 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/10"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Ouvrir
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!pending && overview && overview.total > 0"
        class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 px-5 py-4"
      >
        <span class="text-sm font-medium text-slate-600">
          {{ pageStart }} – {{ pageEnd }} sur {{ intFr.format(overview.total) }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            aria-label="Page précédente"
            @click="page--"
          >
            ‹
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pageEnd >= overview.total"
            aria-label="Page suivante"
            @click="page++"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type OverviewDto = {
  stats: { total: number; pending: number; approved: number; rejected: number }
  items: Array<{
    id: string
    date: string
    studentName: string
    age: string
    className: string
    schoolYear: string
    status: string
  }>
  total: number
  page: number
  limit: number
}

const { token } = useAuth()
const config = useRuntimeConfig()

const searchInput = ref('')
const debouncedSearch = ref('')
const sort = ref('date_desc')
const page = ref(1)
const limit = ref(10)

const overview = ref<OverviewDto | null>(null)
const loadError = ref<string | null>(null)
const pending = ref(true)

const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = v
    page.value = 1
  }, 350)
})

const statCards = computed(() => {
  const s = overview.value?.stats
  return [
    {
      key: 'total',
      title: 'Total Inscriptions',
      value: s != null ? intFr.format(s.total) : '—',
      iconBg: 'bg-[#216EC2]/10 text-[#216EC2]',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      key: 'pending',
      title: 'Inscriptions en cours',
      value: s != null ? intFr.format(s.pending) : '—',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    },
    {
      key: 'approved',
      title: 'Inscriptions retenues',
      value: s != null ? intFr.format(s.approved) : '—',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8l3 3-6 6"/><path d="M22 11l-3-3"/></svg>`,
    },
    {
      key: 'rejected',
      title: 'Inscriptions rejetées',
      value: s != null ? intFr.format(s.rejected) : '—',
      iconBg: 'bg-red-100 text-red-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="17" y1="8" x2="22" y2="13" stroke-linecap="round"/><line x1="22" y1="8" x2="17" y2="13" stroke-linecap="round"/></svg>`,
    },
  ]
})

const rows = computed(() => overview.value?.items ?? [])

const pageStart = computed(() => {
  if (!overview.value?.total) return 0
  return (overview.value.page - 1) * overview.value.limit + 1
})

const pageEnd = computed(() => {
  if (!overview.value?.total) return 0
  return Math.min(overview.value.page * overview.value.limit, overview.value.total)
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

async function loadOverview() {
  pending.value = true
  loadError.value = null
  const t = token.value
  if (!t) {
    pending.value = false
    overview.value = null
    return
  }
  try {
    overview.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/enrollments`, {
      headers: { Authorization: `Bearer ${t}` },
      query: {
        page: page.value,
        limit: limit.value,
        search: debouncedSearch.value.trim() || undefined,
        sort: sort.value,
      },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les inscriptions.'
    overview.value = null
  } finally {
    pending.value = false
  }
}

watch(
  [token, page, limit, debouncedSearch, sort],
  () => {
    if (token.value) void loadOverview()
  },
  { immediate: true },
)
</script>
