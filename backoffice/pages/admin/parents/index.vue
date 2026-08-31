<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Gestion des Parents</h1>

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
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4">
        <h2 class="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Parents</h2>
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
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3 font-semibold">Noms des parents</th>
              <th class="px-4 py-3 font-semibold">Lien de parenté</th>
              <th class="px-4 py-3 font-semibold">Téléphone</th>
              <th class="px-4 py-3 font-semibold">Enf. inscrits</th>
              <th class="px-4 py-3 font-semibold">Statut</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <template v-if="pending">
              <tr v-for="n in 7" :key="'s-' + n">
                <td v-for="c in 6" :key="c" class="px-4 py-3">
                  <span class="inline-block h-4 w-full max-w-[7rem] animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!rows.length">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">Aucun parent.</td>
            </tr>
            <tr v-for="row in rows" v-else :key="row.id" class="text-slate-700">
              <td class="px-4 py-3 font-semibold">
                <div class="flex flex-wrap items-center gap-2">
                  <span>{{ row.fullName }}</span>
                  <span
                    v-if="row.monthlyPaymentPlanEnabled"
                    class="rounded-md bg-[#216EC2]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#216EC2]"
                  >
                    Échéancier
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">{{ row.relationLabel }}</td>
              <td class="whitespace-nowrap px-4 py-3">{{ row.phone || '—' }}</td>
              <td class="px-4 py-3">{{ enfantsLabel(row.childrenCount) }}</td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="!row.blocked"
                  class="relative inline-flex h-7 w-[2.75rem] shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#216EC2]/40"
                  :class="[
                    row.blocked ? 'bg-rose-400' : 'bg-emerald-500',
                    rowActionId === row.id || (!row.blocked && !canToggleBlock(row)) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                  ]"
                  :disabled="rowActionId === row.id || (!row.blocked && !canToggleBlock(row))"
                  @click="onToggleSwitch(row)"
                >
                  <span
                    class="pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[transform]"
                    :class="row.blocked ? 'left-0.5 translate-x-0' : 'left-0.5 translate-x-[1.15rem]'"
                  />
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    :disabled="rowActionId === row.id || !canDeleteParent(row)"
                    :title="!canDeleteParent(row) ? 'Suppression impossible tant qu’un enfant est rattaché ou inscrit.' : undefined"
                    @click="openDeleteModal(row)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 11v-1a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="m21 21-3-3" stroke-linecap="round" />
                    </svg>
                    Supprimer
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                    :disabled="rowActionId === row.id || !canToggleBlock(row)"
                    :title="!canToggleBlock(row) && !row.blocked ? 'Blocage impossible tant qu’un enfant est inscrit (inscription validée avec paiement).' : undefined"
                    @click="openBlockActionModal(row)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M4.5 4.5l15 15" stroke-linecap="round" />
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    {{ row.blocked ? 'Débloquer' : 'Bloquer' }}
                  </button>
                  <NuxtLink
                    :to="`/admin/parents/${row.id}`"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#216EC2]/40 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
                    aria-label="Voir le parent"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </NuxtLink>
                </div>
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

    <Teleport to="body">
      <div
        v-if="deleteModalRow"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeDeleteModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-parent-title"
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2 id="delete-parent-title" class="pr-2 text-xl font-bold tracking-tight text-slate-900">
              Supprimer le parent
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
              aria-label="Fermer"
              @click="closeDeleteModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Voulez-vous vraiment supprimer {{ deleteModalRow.fullName }}&nbsp;?
          </p>
          <div class="flex gap-3 sm:gap-4">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 py-3.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100/90 disabled:opacity-50"
              :disabled="!!rowActionId"
              @click="confirmDeleteFromModal"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 11v-1a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="m21 21-3-3" stroke-linecap="round" />
              </svg>
              Supprimer
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
              @click="closeDeleteModal"
            >
              Annuler
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="blockModalRow"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeBlockModal" />
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="blockModalRow.blocked ? 'unblock-parent-title' : 'block-parent-title'"
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2
              v-if="blockModalRow.blocked"
              id="unblock-parent-title"
              class="pr-2 text-xl font-bold tracking-tight text-slate-900"
            >
              Débloquer le parent
            </h2>
            <h2 v-else id="block-parent-title" class="pr-2 text-xl font-bold tracking-tight text-slate-900">
              Bloquer le parent
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
              aria-label="Fermer"
              @click="closeBlockModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            <template v-if="blockModalRow.blocked">
              Voulez-vous vraiment débloquer {{ blockModalRow.fullName }}&nbsp;?
            </template>
            <template v-else>
              Voulez-vous vraiment bloquer {{ blockModalRow.fullName }}&nbsp;?
            </template>
          </p>
          <div class="flex gap-3 sm:gap-4">
            <button
              v-if="blockModalRow.blocked"
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-200/90 disabled:opacity-50"
              :disabled="!!rowActionId"
              @click="confirmBlockModal"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M4.5 4.5l15 15" stroke-linecap="round" />
              </svg>
              Débloquer
            </button>
            <button
              v-else
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-200/90 disabled:opacity-50"
              :disabled="!!rowActionId"
              @click="confirmBlockModal"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M4.5 4.5l15 15" stroke-linecap="round" />
              </svg>
              Bloquer
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
              @click="closeBlockModal"
            >
              Annuler
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
    id: string
    fullName: string
    email: string
    phone: string | null
    relationLabel: string
    /** Enfants avec inscription validée + paiement (liste élèves). */
    childrenCount: number
    /** Tous les enfants rattachés au compte. */
    totalChildrenCount: number
    blocked: boolean
    monthlyPaymentPlanEnabled?: boolean
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
const rowActionId = ref<string | null>(null)
const deleteModalRow = ref<OverviewDto['items'][0] | null>(null)
const blockModalRow = ref<OverviewDto['items'][0] | null>(null)
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
const pageStart = computed(() => {
  if (!overview.value?.total) return 0
  return (overview.value.page - 1) * overview.value.limit + 1
})
const pageEnd = computed(() => {
  if (!overview.value?.total) return 0
  return Math.min(overview.value.page * overview.value.limit, overview.value.total)
})

function enfantsLabel(n: number): string {
  if (n <= 0) return '—'
  if (n === 1) return '1 enfant'
  return `${n} enfants`
}

/** Suppression : aucune fiche enfant rattachée. */
function canDeleteParent(row: OverviewDto['items'][0]): boolean {
  return row.totalChildrenCount === 0
}

/** Blocage : aucun enfant « inscrit » (validé + payé). Le déblocage reste toujours possible. */
function canToggleBlock(row: OverviewDto['items'][0]): boolean {
  return row.blocked || row.childrenCount === 0
}

function openDeleteModal(row: OverviewDto['items'][0]) {
  if (!canDeleteParent(row)) return
  loadError.value = null
  deleteModalRow.value = row
}

function closeDeleteModal() {
  deleteModalRow.value = null
}

function openBlockActionModal(row: OverviewDto['items'][0]) {
  if (!canToggleBlock(row)) return
  loadError.value = null
  blockModalRow.value = row
}

function closeBlockModal() {
  blockModalRow.value = null
}

function onToggleSwitch(row: OverviewDto['items'][0]) {
  openBlockActionModal(row)
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
    overview.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/parents`, {
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
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les parents.'
    overview.value = null
  } finally {
    pending.value = false
  }
}

async function patchParentBlocked(row: OverviewDto['items'][0], blocked: boolean) {
  const t = token.value
  if (!t) return
  rowActionId.value = row.id
  try {
    await $fetch(`${config.public.apiBase}/admin/parents/${row.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: { blocked },
    })
    row.blocked = blocked
    closeBlockModal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Impossible de mettre à jour le statut.'
  } finally {
    rowActionId.value = null
  }
}

function confirmBlockModal() {
  const row = blockModalRow.value
  if (!row) return
  void patchParentBlocked(row, !row.blocked)
}

async function confirmDeleteFromModal() {
  const row = deleteModalRow.value
  if (!row) return
  closeDeleteModal()
  await deleteParent(row)
}

async function deleteParent(row: OverviewDto['items'][0]) {
  const t = token.value
  if (!t) return
  rowActionId.value = row.id
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/parents/${row.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${t}` },
    })
    await loadOverview()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Suppression impossible.'
  } finally {
    rowActionId.value = null
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
