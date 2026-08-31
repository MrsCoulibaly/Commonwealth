<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Gestion des Élèves</h1>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border-2 border-[#216EC2]/30 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-700">{{ card.title }}</h2>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
        </div>
        <p class="text-3xl font-bold tracking-tight text-slate-900">
          <span v-if="pending" class="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
        <p class="mt-1 text-xs font-medium text-slate-400">Total cumulé</p>
      </article>
    </section>

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
        class="w-full rounded-2xl border border-[#216EC2]/30 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
        placeholder="Rechercher…"
        autocomplete="off"
      />
    </div>

    <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
      <div class="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 class="text-3xl font-bold tracking-tight text-slate-800">Élèves</h2>
        <select
          v-model="sort"
          class="rounded-xl border-2 border-[#F9994B] bg-[#F9994B] px-4 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#F9994B]/30"
          @change="page = 1"
        >
          <option value="date_desc">Trier par</option>
          <option value="date_asc">Plus ancien</option>
          <option value="name_asc">Nom A → Z</option>
          <option value="name_desc">Nom Z → A</option>
        </select>
      </div>

      <div class="overflow-x-auto px-4 pb-3">
        <table class="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3 font-semibold">Noms de l'élèves</th>
              <th class="px-4 py-3 font-semibold">Âges</th>
              <th class="px-4 py-3 font-semibold">Classe</th>
              <th class="px-4 py-3 font-semibold">Année scolaire</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <template v-if="pending">
              <tr v-for="n in 7" :key="'s-' + n">
                <td v-for="c in 5" :key="c" class="px-4 py-3">
                  <span class="inline-block h-4 w-full max-w-[7rem] animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!rows.length">
              <td colspan="5" class="px-4 py-12 text-center text-slate-500">Aucun élève.</td>
            </tr>
            <tr v-for="row in rows" v-else :key="row.childId" class="text-slate-700">
              <td class="px-4 py-3 font-semibold">
                <span class="inline-flex items-center gap-3">
                  <img
                    v-if="row.photoUrl"
                    :src="row.photoUrl"
                    alt=""
                    class="h-9 w-9 rounded-lg object-cover"
                  >
                  <span
                    v-else
                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#216EC2]/10 text-xs font-bold text-[#216EC2]"
                  >{{ studentInitials(row.studentName) }}</span>
                  {{ row.studentName }}
                </span>
              </td>
              <td class="px-4 py-3">{{ row.age }}</td>
              <td class="px-4 py-3">{{ row.className }}</td>
              <td class="whitespace-nowrap px-4 py-3">{{ row.schoolYear }}</td>
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/admin/students/${row.childId}`"
                  class="inline-flex min-w-[140px] items-center justify-center gap-1.5 rounded-lg border border-[#216EC2]/50 bg-[#216EC2]/10 px-3 py-1.5 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/15"
                >
                  Ouvrir
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
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
          {{ pageStart }} – {{ pageEnd }} pour {{ intFr.format(overview.total) }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            @click="page--"
          >
            ‹
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pageEnd >= overview.total"
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
  stats: { total: number; maternel: number; creche: number; cp: number }
  items: Array<{
    childId: string
    enrollmentId: string
    studentName: string
    photoUrl: string | null
    age: string
    className: string
    schoolYear: string
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
    { key: 'total', title: 'Total Inscriptions', value: s != null ? intFr.format(s.total) : '—' },
    { key: 'maternel', title: 'Maternel', value: s != null ? intFr.format(s.maternel) : '—' },
    { key: 'creche', title: 'Crèche', value: s != null ? intFr.format(s.creche) : '—' },
    { key: 'cp', title: 'CP', value: s != null ? intFr.format(s.cp) : '—' },
  ]
})

const rows = computed(() => overview.value?.items ?? [])

function studentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? ''
  const b = parts.length > 1 ? parts[parts.length - 1]![0] : ''
  return `${a}${b}`.toUpperCase() || '?'
}

const pageStart = computed(() => {
  if (!overview.value?.total) return 0
  return (overview.value.page - 1) * overview.value.limit + 1
})
const pageEnd = computed(() => {
  if (!overview.value?.total) return 0
  return Math.min(overview.value.page * overview.value.limit, overview.value.total)
})

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
    overview.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/students`, {
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
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les élèves.'
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
