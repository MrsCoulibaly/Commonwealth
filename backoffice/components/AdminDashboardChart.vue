<template>
  <div class="rounded-2xl border-2 border-[#216EC2]/25 bg-white p-5 shadow-sm sm:p-6">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-lg font-bold text-slate-800">Statistiques</h2>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-4 text-sm font-medium">
          <span class="flex items-center gap-2 text-[#216EC2]">
            <span class="h-0.5 w-6 rounded-full bg-[#216EC2]" />
            Parents (nouveaux comptes / mois)
          </span>
          <span class="flex items-center gap-2 text-[#F9994B]">
            <span class="h-0.5 w-6 rounded-full bg-[#F9994B]" />
            Élèves (nouveaux dossiers / mois)
          </span>
        </div>
        <label class="sr-only" for="admin-chart-period">Période</label>
        <select
          id="admin-chart-period"
          disabled
          class="cursor-not-allowed rounded-lg border-2 border-[#216EC2]/25 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500 outline-none"
          title="Bientôt : filtre par période"
        >
          <option>12 derniers mois</option>
        </select>
      </div>
    </div>
    <div class="relative w-full overflow-x-auto">
      <div v-if="pending" class="flex min-h-[240px] items-center justify-center">
        <span class="h-32 w-full max-w-md animate-pulse rounded-xl bg-slate-100" />
      </div>
      <svg
        v-else-if="pointCount > 0"
        class="min-h-[240px] w-full min-w-[600px]"
        viewBox="0 0 720 240"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        :aria-label="'Graphique Parents et Élèves sur ' + pointCount + ' mois'"
      >
        <defs>
          <linearGradient :id="fillGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#216EC2" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#216EC2" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <g stroke="#e2e8f0" stroke-width="1">
          <line v-for="i in 5" :key="i" x1="48" :y1="40 + (i - 1) * 40" x2="700" :y2="40 + (i - 1) * 40" />
        </g>
        <g fill="#64748b" font-size="11" font-weight="600" text-anchor="middle">
          <text v-for="(m, i) in monthLabels" :key="i" :x="xAt(i)" y="228">{{ m }}</text>
        </g>
        <path :d="areaPathParents" :fill="`url(#${fillGradientId})`" />
        <path
          :d="linePathParents"
          fill="none"
          stroke="#216EC2"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          :d="linePathStudents"
          fill="none"
          stroke="#F9994B"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p v-else class="flex min-h-[200px] items-center justify-center text-sm text-slate-500">
        Pas encore de données sur la période.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    monthLabels?: string[]
    parentsPerMonth?: number[]
    studentsPerMonth?: number[]
    pending?: boolean
  }>(),
  {
    monthLabels: () => [],
    parentsPerMonth: () => [],
    studentsPerMonth: () => [],
    pending: false,
  },
)

const fillGradientId = `adminChartFill_${useId().replace(/\W/g, '_')}`

const pointCount = computed(() => props.monthLabels.length)

const padL = 48
const padR = 20
const padT = 36
const padB = 28
const plotW = 720 - padL - padR
const plotH = 200 - padT - padB

function xAt(i: number) {
  const n = Math.max(1, pointCount.value - 1)
  return padL + (i / n) * plotW
}

function yAt(norm: number) {
  return padT + (1 - norm) * plotH
}

/** Normalise les comptes sur [0,1] pour l’échelle du graphique */
const parentsNorm = computed(() => {
  const p = props.parentsPerMonth
  const s = props.studentsPerMonth
  const max = Math.max(0, ...p, ...s, 1)
  return p.map((v) => v / max)
})

const studentsNorm = computed(() => {
  const p = props.parentsPerMonth
  const s = props.studentsPerMonth
  const max = Math.max(0, ...p, ...s, 1)
  return s.map((v) => v / max)
})

const linePathParents = computed(() => {
  const vals = parentsNorm.value
  if (!vals.length) return ''
  const pts = vals.map((ny, i) => `${xAt(i)},${yAt(ny)}`)
  return `M ${pts.join(' L ')}`
})

const linePathStudents = computed(() => {
  const vals = studentsNorm.value
  if (!vals.length) return ''
  const pts = vals.map((ny, i) => `${xAt(i)},${yAt(ny)}`)
  return `M ${pts.join(' L ')}`
})

const areaPathParents = computed(() => {
  const vals = parentsNorm.value
  if (!vals.length) return ''
  const points = vals.map((ny, i) => `${xAt(i)},${yAt(ny)}`)
  const firstX = points[0]!.split(',')[0]!
  const lastX = points[points.length - 1]!.split(',')[0]!
  const baseY = padT + plotH
  return `M ${firstX},${baseY} L ${points.join(' L ')} L ${lastX},${baseY} Z`
})
</script>
