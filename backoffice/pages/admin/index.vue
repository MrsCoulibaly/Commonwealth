<template>
  <div class="space-y-8">
    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.title"
        class="relative overflow-hidden rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h3 class="text-sm font-semibold leading-snug text-slate-600">{{ card.title }}</h3>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]" v-html="card.icon" />
        </div>
        <p class="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          <span v-if="pending" class="inline-block h-8 w-24 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
        <p class="mt-1 text-xs font-medium text-slate-400">{{ card.subtitle }}</p>
      </article>
    </section>

    <AdminDashboardChart
      :month-labels="chartData.monthLabels"
      :parents-per-month="chartData.parentsPerMonth"
      :students-per-month="chartData.studentsPerMonth"
      :pending="pending"
    />

    <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-bold text-slate-800">Demandes récentes d'inscription</h2>
        <NuxtLink to="/admin/inscriptions" class="text-sm font-semibold text-[#216EC2] hover:underline"> Voir tout &gt; </NuxtLink>
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
              <tr v-for="n in 4" :key="'sk-' + n" class="text-slate-700">
                <td v-for="c in 6" :key="c" class="px-4 py-3">
                  <span class="inline-block h-4 w-full max-w-[8rem] animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!enrollmentRows.length">
              <td colspan="6" class="px-4 py-10 text-center text-slate-500">Aucune inscription pour le moment.</td>
            </tr>
            <tr v-for="row in enrollmentRows" v-else :key="row.id" class="text-slate-700">
              <td class="whitespace-nowrap px-4 py-3 font-medium">{{ row.dateLabel }}</td>
              <td class="px-4 py-3 font-medium">{{ row.studentName }}</td>
              <td class="px-4 py-3">{{ row.age }}</td>
              <td class="px-4 py-3">{{ row.className }}</td>
              <td class="whitespace-nowrap px-4 py-3">{{ row.schoolYear }}</td>
              <td class="px-4 py-3">
                <NuxtLink
                  :to="`/admin/inscriptions/${row.id}`"
                  class="inline-block rounded-lg border border-[#216EC2]/50 bg-[#216EC2]/5 px-4 py-1.5 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/10"
                >
                  Ouvrir
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type DashboardDto = {
  stats: {
    totalEnrollments: number
    totalStudents: number
    totalParents: number
    totalTuitionPaidCents: number
  }
  recentEnrollments: Array<{
    id: string
    date: string
    studentName: string
    age: string
    className: string
    schoolYear: string
  }>
  chart: {
    monthLabels: string[]
    parentsPerMonth: number[]
    studentsPerMonth: number[]
  }
}

const { token } = useAuth()
const config = useRuntimeConfig()

const dashboard = ref<DashboardDto | null>(null)
const loadError = ref<string | null>(null)
const pending = ref(true)

const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

function formatXofFromCents(cents: number): string {
  const xof = cents / 100
  return `${intFr.format(Math.round(xof))} XOF`
}

function formatDateFr(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

const statCards = computed(() => {
  const s = dashboard.value?.stats
  return [
    {
      title: 'Total Inscriptions',
      value: s != null ? intFr.format(s.totalEnrollments) : '—',
      subtitle: 'Total cumulé',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      title: 'Total élèves',
      value: s != null ? intFr.format(s.totalStudents) : '—',
      subtitle: 'Total cumulé',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><polyline points="16 3.13 16 8 22 8"/></svg>`,
    },
    {
      title: 'Total Parents',
      value: s != null ? intFr.format(s.totalParents) : '—',
      subtitle: 'Total cumulé',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      title: 'Total Scolarité',
      value: s != null ? formatXofFromCents(s.totalTuitionPaidCents) : '—',
      subtitle: 'Paiements encaissés (scolarité + mensualités)',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    },
  ]
})

const enrollmentRows = computed(() => {
  const rows = dashboard.value?.recentEnrollments ?? []
  return rows.map((r) => ({
    ...r,
    dateLabel: formatDateFr(r.date),
  }))
})

const chartData = computed(() => {
  const c = dashboard.value?.chart
  return {
    monthLabels: c?.monthLabels ?? [],
    parentsPerMonth: c?.parentsPerMonth ?? [],
    studentsPerMonth: c?.studentsPerMonth ?? [],
  }
})

async function loadDashboard() {
  pending.value = true
  loadError.value = null
  const t = token.value
  if (!t) {
    pending.value = false
    dashboard.value = null
    return
  }
  try {
    dashboard.value = await $fetch<DashboardDto>(`${config.public.apiBase}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${t}` },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    const msg =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger le tableau de bord.'
    loadError.value = msg
    dashboard.value = null
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})

watch(token, () => {
  void loadDashboard()
})
</script>
