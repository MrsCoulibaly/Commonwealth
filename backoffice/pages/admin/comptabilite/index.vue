<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Gestion de Comptabilité</h1>
        <label class="flex flex-col gap-0.5 text-sm text-slate-600">
          <span class="text-xs text-slate-500">Graphiques &amp; tableau</span>
          <input
            v-model="periodInput"
            type="month"
            class="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
            :disabled="pending"
          />
        </label>
      </div>
      <div class="flex flex-wrap gap-2 self-start">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#216EC2]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5 disabled:opacity-50"
          :disabled="pending"
          title="Actualiser"
          @click="loadOverview"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': pending }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Actualiser
        </button>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
        :disabled="exporting || pending"
        @click="exportCsv"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Exporter
      </button>
      </div>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>
    <p v-if="actionMessage" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ actionMessage }}</p>

    <div
      v-if="showEmptyPeriodHint"
      class="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Aucun paiement plateforme pour <strong>{{ data?.period.monthLabel }}</strong> (graphiques et tableau).
        Les soldes ci-dessous restent le <strong>cumul historique</strong>.
      </p>
      <button
        v-if="data?.latestEncashment"
        type="button"
        class="shrink-0 rounded-lg bg-amber-800 px-4 py-2 text-xs font-bold text-white hover:bg-amber-900"
        @click="goToLatestEncashment"
      >
        Voir {{ data.latestEncashment.monthLabel }}
      </button>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in kpiCards"
        :key="card.key"
        class="rounded-2xl border-2 border-[#216EC2]/25 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold text-slate-700">{{ card.title }}</h2>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="card.iconBg" v-html="card.icon" />
        </div>
        <p class="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
          <span v-if="pending" class="inline-block h-9 w-28 animate-pulse rounded bg-slate-200" />
          <span v-else :key="`${card.key}-${card.value}`" class="inline-block animate-fade-in-kpi">{{ card.value }}</span>
        </p>
        <p class="mt-1 text-xs font-medium" :class="card.hintClass">{{ card.hint }}</p>
      </article>
    </section>

    <section class="flex flex-col gap-4">
      <div class="flex justify-end">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#216EC2] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
          :disabled="cashBusy"
          @click="goToCashDesk"
        >
          Ouvrir la caisse
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 14-4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
      <AdminAccountingTotalsBlocks
        variant="accounting"
        :pending="pending"
        :entries-cents="data?.accountingTotals.entriesCents ?? 0"
        :exits-cents="data?.accountingTotals.exitsCents ?? 0"
        :balance-cents="data?.accountingTotals.balanceCents ?? 0"
        :tuition-month-cents="data?.accountingTotals.tuitionMonthCents ?? 0"
        :monthly-invoices-month-cents="data?.accountingTotals.monthlyInvoicesMonthCents ?? 0"
        :manual-cents="data?.accountingTotals.manualEntriesCents ?? 0"
        :period-label="accountingPeriodLabel"
      />
      <p v-if="data?.cashSession.sessionOpen" class="text-right text-xs font-medium text-emerald-700">
        Session de caisse ouverte — utilisez « Ouvrir la caisse » pour les encaissements manuels.
      </p>
    </section>

    <section class="grid grid-cols-2 items-start gap-4">
      <article class="flex min-w-0 flex-col rounded-2xl border-2 border-[#216EC2]/25 bg-white p-4 shadow-sm">
        <h2 class="text-base font-bold text-slate-800">Répartition des paiements par service</h2>
        <p class="text-xs text-slate-500">{{ data?.period.monthLabel ?? '' }}</p>
        <p class="mt-1 text-[11px] leading-snug text-slate-400">{{ serviceBreakdownHint }}</p>
        <div v-if="pending" class="mt-3 h-24 animate-pulse rounded-lg bg-slate-100" />
        <div v-else-if="!serviceBars.length" class="mt-3 py-4 text-center text-sm text-slate-500">Aucun encaissement sur la période.</div>
        <ul v-else class="mt-3 max-h-[160px] space-y-2 overflow-y-auto pr-1">
          <li v-for="bar in serviceBars" :key="bar.label">
            <div class="mb-0.5 flex justify-between text-xs">
              <span class="font-medium text-slate-700">{{ bar.label }}</span>
              <span class="font-bold text-slate-900">{{ formatXof(bar.amountCents) }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full bg-[#216EC2] transition-all duration-700 ease-out"
                :style="{ width: `${bar.pct}%` }"
              />
            </div>
          </li>
        </ul>
        <p v-if="data?.serviceBreakdownTotalCents" class="mt-3 border-t border-slate-100 pt-2 text-xs font-bold text-slate-800">
          Total collecté : {{ formatXof(data.serviceBreakdownTotalCents) }}
        </p>
      </article>

      <article class="flex min-w-0 flex-col rounded-2xl border-2 border-[#216EC2]/25 bg-white p-4 shadow-sm">
        <h2 class="text-base font-bold text-slate-800">Statut des paiements</h2>
        <div class="mt-2 flex items-center justify-center gap-4">
          <div v-if="pending" class="h-28 w-28 animate-pulse rounded-full bg-slate-100" />
          <svg v-else viewBox="0 0 120 120" class="h-28 w-28 shrink-0" role="img" aria-label="Répartition des statuts">
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" stroke-width="14" />
            <circle
              v-for="(seg, i) in donutSegments"
              :key="i"
              cx="60"
              cy="60"
              r="48"
              fill="none"
              :stroke="seg.color"
              stroke-width="14"
              :stroke-dasharray="seg.dash"
              :stroke-dashoffset="seg.offset"
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="56" text-anchor="middle" class="fill-slate-800 font-bold" font-size="13">{{ data?.paymentStatus.paidPercent ?? 0 }}%</text>
            <text x="60" y="70" text-anchor="middle" class="fill-slate-500" font-size="9">à jour</text>
          </svg>
          <ul class="space-y-1 text-xs">
            <li class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#216EC2]" />
              Payé — {{ data?.paymentStatus.paid ?? 0 }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#F9994B]" />
              En attente — {{ data?.paymentStatus.pending ?? 0 }}
            </li>
            <li class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-[#FC2B2B]" />
              Impayé — {{ data?.paymentStatus.unpaid ?? 0 }}
            </li>
          </ul>
        </div>
      </article>
    </section>

    <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <div>
          <h2 class="text-lg font-bold text-slate-800">Factures et paiements plateforme</h2>
          <p class="mt-1 text-xs text-slate-500">Scolarité et mensualités (tous statuts) — encaissements parents en ligne.</p>
        </div>
      </div>
      <div class="px-5 py-4">
        <div class="relative max-w-xl">
          <svg
            class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchInput"
            type="search"
            placeholder="Rechercher un enfant"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-12 pr-4 text-sm text-slate-800 outline-none focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
          />
        </div>
      </div>

      <div class="overflow-x-auto px-4 pb-4">
        <table class="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3 font-semibold">Date</th>
              <th class="px-4 py-3 font-semibold">Noms de l'élève</th>
              <th class="px-4 py-3 font-semibold">Classe</th>
              <th class="px-4 py-3 font-semibold">Type</th>
              <th class="px-4 py-3 font-semibold">Montant</th>
              <th class="px-4 py-3 font-semibold">Mode</th>
              <th class="px-4 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="pending">
              <tr v-for="n in 6" :key="n">
                <td v-for="c in 7" :key="c" class="px-4 py-3"><span class="block h-4 animate-pulse rounded bg-slate-200" /></td>
              </tr>
            </template>
            <tr v-else-if="!rows.length">
              <td colspan="7" class="px-4 py-12 text-center text-slate-500">Aucune opération.</td>
            </tr>
            <tr v-for="row in rows" v-else :key="row.id" class="text-slate-700">
              <td class="whitespace-nowrap px-4 py-3">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-3 font-medium">{{ row.studentName }}</td>
              <td class="px-4 py-3">{{ row.className }}</td>
              <td class="px-4 py-3">{{ row.services.join(', ') }}</td>
              <td class="px-4 py-3 font-semibold">{{ formatXof(row.amountCents) }}</td>
              <td class="px-4 py-3">{{ row.paymentMethod }}</td>
              <td class="px-4 py-3">
                <span :class="['inline-flex rounded-xl px-3 py-1.5 text-xs font-bold', badgeClass(row.status)]">
                  {{ row.statusLabel }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!pending && data && data.total > 0"
        class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 px-5 py-4"
      >
        <span class="text-sm text-slate-600">{{ pageStart }} – {{ pageEnd }} pour {{ data.total }}</span>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            :disabled="page <= 1"
            @click="page--"
          >
            ‹
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            :disabled="pageEnd >= data.total"
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
  period: { monthLabel: string; year: number; month: number }
  kpis: {
    monthlyRevenueCents: number
    monthlyRevenueTrendPct: number | null
    unpaidTotalCents: number
    paymentsReceived: number
    paymentsExpected: number
    overdueOver30Days: number
    remindersSent: number
  }
  accountingTotals: {
    entriesCents: number
    exitsCents: number
    balanceCents: number
    tuitionMonthCents: number
    monthlyInvoicesMonthCents: number
    manualEntriesCents: number
  }
  latestEncashment: { year: number; month: number; monthLabel: string } | null
  cashSession: {
    sessionOpen: boolean
  }
  serviceBreakdown: Array<{ label: string; amountCents: number }>
  serviceBreakdownTotalCents: number
  serviceBreakdownDetail: 'empty' | 'options' | 'basic'
  paymentStatus: { paid: number; pending: number; unpaid: number; paidPercent: number }
  transactions: Array<{
    id: string
    date: string
    studentName: string
    className: string
    services: string[]
    amountCents: number
    paymentMethod: string
    status: string
    statusLabel: string
  }>
  serviceOptions: string[]
  total: number
  page: number
  limit: number
}

const { token } = useAuth()
const config = useRuntimeConfig()

const data = ref<OverviewDto | null>(null)
const loadError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const pending = ref(true)
const exporting = ref(false)
const cashBusy = ref(false)
const searchInput = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const limit = ref(10)

const now = new Date()
const periodInput = ref(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
)

const selectedPeriod = computed(() => {
  const m = periodInput.value.match(/^(\d{4})-(\d{2})$/)
  if (!m) return { year: now.getFullYear(), month: now.getMonth() + 1 }
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) }
})

const showEmptyPeriodHint = computed(() => {
  if (pending.value || !data.value) return false
  return data.value.kpis.monthlyRevenueCents === 0 && data.value.serviceBreakdownTotalCents === 0
})

function goToLatestEncashment() {
  const le = data.value?.latestEncashment
  if (!le) return
  periodInput.value = `${le.year}-${String(le.month).padStart(2, '0')}`
}

const accountingPeriodLabel =
  'Toutes périodes — plateforme + entrées manuelles caisse'

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = v
    page.value = 1
  }, 350)
})

function formatXof(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

function badgeClass(status: string) {
  if (status === 'PAID') return 'bg-[#DFF4EF] text-[#00A87E]'
  if (status === 'PENDING') return 'bg-[#F7EFE5] text-[#F9994B]'
  if (status === 'FAILED') return 'bg-[#F8E1DD] text-[#FC2B2B]'
  return 'bg-slate-100 text-slate-600'
}

const kpiCards = computed(() => {
  const k = data.value?.kpis
  const trend = k?.monthlyRevenueTrendPct
  const trendHint =
    trend == null ? 'Mois en cours' : `${trend >= 0 ? '+' : ''}${trend}% vs mois précédent`
  return [
    {
      key: 'rev',
      title: 'Recettes du mois',
      value: k != null ? formatXof(k.monthlyRevenueCents) : '—',
      hint: `${trendHint} · scolarité + mensualités`,
      hintClass: trend != null && trend < 0 ? 'text-red-500' : 'text-slate-400',
      iconBg: 'bg-[#216EC2]/10 text-[#216EC2]',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>`,
    },
    {
      key: 'unpaid',
      title: 'Impayés en cours',
      value: k != null ? formatXof(k.unpaidTotalCents) : '—',
      hint: 'Total cumulé',
      hintClass: 'text-slate-400',
      iconBg: 'bg-slate-100 text-slate-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    },
    {
      key: 'received',
      title: 'Paiements reçus',
      value: k != null ? String(k.paymentsReceived) : '—',
      hint: k ? `Sur ${k.paymentsExpected} attendus` : '',
      hintClass: 'text-slate-400',
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`,
    },
    {
      key: 'late',
      title: 'Retards > 30 j',
      value: k != null ? String(k.overdueOver30Days) : '—',
      hint: `${k?.remindersSent ?? 0} relances envoyées`,
      hintClass: 'text-slate-400',
      iconBg: 'bg-red-50 text-red-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
    },
  ]
})

const serviceBreakdownHint = computed(() => {
  const d = data.value?.serviceBreakdownDetail
  if (d === 'empty') {
    return 'Aucune facture payée par les parents ce mois-ci via la plateforme.'
  }
  if (d === 'options') {
    return 'Paiements plateforme du mois, ventilés par service (mensualité, cantine, transport…).'
  }
  return 'Paiements plateforme du mois (scolarité et/ou mensualité).'
})

const serviceBars = computed(() => {
  const items = data.value?.serviceBreakdown ?? []
  const max = Math.max(...items.map((i) => i.amountCents), 1)
  return items.map((i) => ({
    label: i.label,
    amountCents: i.amountCents,
    pct: Math.round((i.amountCents / max) * 100),
  }))
})

const donutSegments = computed(() => {
  const ps = data.value?.paymentStatus
  if (!ps) return []
  const total = ps.paid + ps.pending + ps.unpaid || 1
  const circumference = 2 * Math.PI * 48
  const parts = [
    { n: ps.paid, color: '#216EC2' },
    { n: ps.pending, color: '#F9994B' },
    { n: ps.unpaid, color: '#FC2B2B' },
  ]
  let offset = 0
  return parts.map((p) => {
    const len = (p.n / total) * circumference
    const seg = {
      color: p.color,
      dash: `${len} ${circumference - len}`,
      offset: -offset,
    }
    offset += len
    return seg
  })
})

const rows = computed(() => data.value?.transactions ?? [])
const pageStart = computed(() => {
  if (!data.value?.total) return 0
  return (data.value.page - 1) * data.value.limit + 1
})
const pageEnd = computed(() => {
  if (!data.value?.total) return 0
  return Math.min(data.value.page * data.value.limit, data.value.total)
})

async function loadOverview() {
  pending.value = true
  loadError.value = null
  const t = token.value
  if (!t) {
    pending.value = false
    data.value = null
    return
  }
  try {
    data.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/accounting/overview`, {
      headers: { Authorization: `Bearer ${t}` },
      query: {
        page: page.value,
        limit: limit.value,
        year: selectedPeriod.value.year,
        month: selectedPeriod.value.month,
        search: debouncedSearch.value.trim() || undefined,
      },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger la comptabilité.'
    data.value = null
  } finally {
    pending.value = false
  }
}

function readFetchMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { message?: string | string[] }; message?: string }
  const raw = err?.data?.message ?? err?.message
  if (typeof raw === 'string' && raw.trim()) return raw
  if (Array.isArray(raw) && raw[0]) return String(raw[0])
  return fallback
}

async function goToCashDesk() {
  if (!token.value) {
    loadError.value = 'Session expirée. Reconnectez-vous.'
    return
  }
  cashBusy.value = true
  loadError.value = null
  try {
    await navigateTo({ path: '/admin/comptabilite/caisse', query: { open: '1' } })
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Impossible d’accéder à la caisse.')
  } finally {
    cashBusy.value = false
  }
}

async function exportCsv() {
  const t = token.value
  if (!t) return
  exporting.value = true
  try {
    const q = new URLSearchParams()
    if (debouncedSearch.value.trim()) q.set('search', debouncedSearch.value.trim())
    const url = `${config.public.apiBase}/admin/accounting/export?${q.toString()}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${t}` } })
    if (!res.ok) throw new Error('Export échoué')
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'comptabilite.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  } catch {
    loadError.value = 'Export impossible.'
  } finally {
    exporting.value = false
  }
}

watch(periodInput, () => {
  page.value = 1
})

watch([token, page, limit, debouncedSearch, periodInput], () => {
  if (token.value) void loadOverview()
}, { immediate: true })

useAccountingRefresh(() => loadOverview())
</script>

<style scoped>
@keyframes fade-in-kpi {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-kpi {
  animation: fade-in-kpi 0.35s ease-out;
}
</style>
