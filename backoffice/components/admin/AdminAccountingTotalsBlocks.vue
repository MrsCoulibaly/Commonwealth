<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <article
      class="rounded-2xl border-2 border-[#216EC2]/20 bg-white p-5 shadow-sm transition-shadow duration-300"
      :class="{ 'ring-2 ring-[#216EC2]/20': highlight === 'entries' }"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-semibold text-slate-700">Total entrées</p>
        <span class="text-[#216EC2]" aria-hidden="true">↓</span>
      </div>
      <p class="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
        <span v-if="pending" class="inline-block h-9 w-32 animate-pulse rounded bg-slate-200" />
        <span v-else :key="`e-${entriesCents}`" class="inline-block animate-fade-in">{{ formatXof(entriesCents) }}</span>
      </p>
      <p v-if="periodLabel" class="mt-1 text-xs text-slate-400">{{ periodLabel }}</p>
      <div v-if="!pending && showEntriesSplit" class="mt-3 space-y-1.5">
        <div class="flex flex-wrap justify-between gap-x-2 gap-y-0.5 text-[10px] font-medium text-slate-500">
          <span>Scolarité {{ entriesSplit.tuitionPct }}%</span>
          <span>Mensualités {{ entriesSplit.monthlyPct }}%</span>
          <span v-if="entriesSplit.manualPct > 0">Caisse {{ entriesSplit.manualPct }}%</span>
        </div>
        <div class="flex h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full bg-[#216EC2] transition-all duration-500 ease-out"
            :style="{ width: `${entriesSplit.tuitionPct}%` }"
          />
          <div
            class="h-full bg-[#F9994B] transition-all duration-500 ease-out"
            :style="{ width: `${entriesSplit.monthlyPct}%` }"
          />
          <div
            v-if="entriesSplit.manualPct > 0"
            class="h-full bg-emerald-500 transition-all duration-500 ease-out"
            :style="{ width: `${entriesSplit.manualPct}%` }"
          />
        </div>
      </div>
      <p v-else-if="!pending && variant === 'session'" class="mt-1 text-xs text-slate-400">
        Paiements plateforme
        <template v-if="paymentsCents != null"> ({{ formatXof(paymentsCents) }})</template>
        · manuel
        <template v-if="manualCents != null"> ({{ formatXof(manualCents) }})</template>
      </p>
      <p v-else-if="!pending" class="mt-1 text-xs text-slate-400">
        Cumul — plateforme
        <template v-if="(manualCents ?? 0) > 0"> + caisse manuelle ({{ formatXof(manualCents!) }})</template>
      </p>
    </article>

    <article
      class="rounded-2xl border-2 border-[#216EC2]/20 bg-white p-5 shadow-sm transition-shadow duration-300"
      :class="{ 'ring-2 ring-[#F9994B]/25': highlight === 'exits' }"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-semibold text-slate-700">Total sorties</p>
        <span class="text-[#F9994B]" aria-hidden="true">↑</span>
      </div>
      <p class="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
        <span v-if="pending" class="inline-block h-8 w-28 animate-pulse rounded bg-slate-200" />
        <span v-else :key="`x-${exitsCents}`" class="inline-block animate-fade-in">{{ formatXof(exitsCents) }}</span>
      </p>
      <p v-if="periodLabel" class="mt-1 text-xs text-slate-400">{{ periodLabel }}</p>
      <div v-if="!pending && entriesCents > 0" class="mt-3">
        <div class="mb-1 flex justify-between text-[10px] text-slate-500">
          <span>Part des entrées</span>
          <span>{{ exitsSharePct }}%</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full bg-[#F9994B] transition-all duration-500 ease-out"
            :style="{ width: `${Math.min(100, exitsSharePct)}%` }"
          />
        </div>
      </div>
      <p v-else-if="!pending" class="mt-1 text-xs text-slate-400">Dépenses enregistrées</p>
    </article>

    <article
      class="rounded-2xl bg-[#216EC2] p-5 text-white shadow-md transition-shadow duration-300"
      :class="balanceToneClass"
    >
      <div class="mb-2 flex items-center justify-between">
        <p class="text-sm font-semibold opacity-90">Solde</p>
        <span
          v-if="!pending && balanceCents !== 0"
          class="rounded-full px-2 py-0.5 text-[10px] font-bold"
          :class="balanceCents >= 0 ? 'bg-white/20 text-white' : 'bg-red-400/30 text-white'"
        >
          {{ balanceCents >= 0 ? 'Positif' : 'Négatif' }}
        </span>
      </div>
      <p class="text-2xl font-bold tabular-nums sm:text-3xl">
        <span v-if="pending" class="inline-block h-9 w-32 animate-pulse rounded bg-white/20" />
        <span v-else :key="`b-${balanceCents}`" class="inline-block animate-fade-in">{{ formatXof(balanceCents) }}</span>
      </p>
      <p class="mt-2 text-xs opacity-90">Total entrées − total sorties</p>
      <p v-if="!pending && lastUpdated" class="mt-2 text-[10px] opacity-75">Mis à jour {{ lastUpdated }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    entriesCents: number
    exitsCents: number
    balanceCents: number
    tuitionMonthCents?: number
    monthlyInvoicesMonthCents?: number
    paymentsCents?: number
    manualCents?: number
    periodLabel?: string
    pending?: boolean
    variant?: 'accounting' | 'session'
    highlight?: 'entries' | 'exits' | 'balance' | null
  }>(),
  {
    entriesCents: 0,
    exitsCents: 0,
    balanceCents: 0,
    pending: false,
    variant: 'accounting',
    highlight: null,
  },
)

const showEntriesSplit = computed(
  () =>
    props.variant === 'accounting' &&
    (props.tuitionMonthCents ?? 0) +
      (props.monthlyInvoicesMonthCents ?? 0) +
      (props.manualCents ?? 0) >
      0,
)

const entriesSplit = computed(() => {
  const tuition = props.tuitionMonthCents ?? 0
  const monthly = props.monthlyInvoicesMonthCents ?? 0
  const manual = props.manualCents ?? 0
  const total = tuition + monthly + manual || props.entriesCents || 1
  const tuitionPct = Math.round((tuition / total) * 100)
  const monthlyPct = Math.round((monthly / total) * 100)
  let manualPct = Math.round((manual / total) * 100)
  const sum = tuitionPct + monthlyPct + manualPct
  if (sum > 100) manualPct = Math.max(0, manualPct - (sum - 100))
  return {
    tuitionPct,
    monthlyPct,
    manualPct,
  }
})

const exitsSharePct = computed(() => {
  if (props.entriesCents <= 0) return 0
  return Math.round((props.exitsCents / props.entriesCents) * 100)
})

const balanceToneClass = computed(() => {
  if (props.pending) return ''
  if (props.balanceCents < 0) return 'bg-gradient-to-br from-red-600 to-red-700 shadow-md'
  return 'bg-gradient-to-br from-[#216EC2] to-[#1a5a9e] shadow-md'
})

const lastUpdated = computed(() => {
  if (props.pending) return ''
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date())
})

function formatXof(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.35s ease-out;
}
</style>
