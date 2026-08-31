<template>
  <div class="-mt-3 space-y-6 sm:-mt-4">
    <div class="mb-0 flex flex-wrap items-center gap-3">
      <NuxtLink to="/admin/parents" class="inline-flex h-10 w-10 items-center justify-center" aria-label="Retour à la liste">
        <svg class="h-6 w-6 text-[#216EC2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.5 5.75 8.25 12l7.25 6.25V5.75Z" />
        </svg>
      </NuxtLink>
      <h1 class="min-w-0 flex-1 text-[1.65rem] font-bold tracking-tight text-[#216EC2] sm:text-[2.1rem]">Fiche parent</h1>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>

    <div
      v-if="pending"
      class="flex min-h-[200px] items-center justify-center rounded-2xl border-2 border-[#216EC2]/15 bg-white text-slate-500 shadow-sm"
    >
      Chargement…
    </div>

    <article v-else-if="detail" class="space-y-6">
      <section class="overflow-hidden rounded-3xl border-2 border-[#216EC2]/30 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xl font-bold text-slate-900 sm:text-2xl">{{ detail.fullName }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ detail.email }}</p>
            <span
              v-if="detail.relationLabel !== '—'"
              class="mt-3 inline-block rounded-lg bg-[#F9994B] px-3 py-1 text-xs font-bold text-white shadow-sm"
            >
              {{ detail.relationLabel }}
            </span>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-bold"
            :class="detail.blocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'"
          >
            {{ detail.blocked ? 'Compte bloqué' : 'Compte actif' }}
          </span>
        </div>
        <ul class="mt-6 space-y-3 text-sm">
          <li v-if="detail.phone" class="flex gap-2">
            <span class="font-semibold text-[#216EC2]">Tél.</span>
            <a :href="`tel:${phoneRaw}`" class="font-medium text-slate-900">{{ detail.phone }}</a>
          </li>
          <li v-if="detail.address" class="flex gap-2">
            <span class="font-semibold text-[#216EC2]">Adresse</span>
            <span class="text-slate-800">{{ detail.address }}</span>
          </li>
        </ul>
      </section>

      <section class="overflow-hidden rounded-3xl border-2 border-[#216EC2]/25 bg-white px-6 py-6 shadow-sm sm:px-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h2 class="text-lg font-bold text-slate-900">Paiement de la scolarité</h2>
            <p class="mt-1 text-sm leading-relaxed text-slate-600">
              Par défaut, une
              <strong class="font-semibold text-slate-800">facture annuelle</strong>
              regroupe les frais de scolarité et les mensualités de l’année (septembre à juin).
              L’échéancier ajoute des factures mois par mois, en conservant la facture de scolarité.
            </p>
            <p class="mt-2 text-sm font-medium" :class="detail.monthlyPaymentPlanEnabled ? 'text-[#216EC2]' : 'text-slate-500'">
              {{
                detail.monthlyPaymentPlanEnabled
                  ? 'Échéancier activé : scolarité + factures mensuelles, pour tous les enfants de ce parent.'
                  : 'Paiement annuel — une facture (scolarité + mensualités de l’année).'
              }}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            :aria-checked="detail.monthlyPaymentPlanEnabled"
            class="relative inline-flex h-7 w-[2.75rem] shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#216EC2]/40 disabled:cursor-not-allowed disabled:opacity-50"
            :class="detail.monthlyPaymentPlanEnabled ? 'bg-[#216EC2]' : 'bg-slate-300'"
            :disabled="planPending"
            @click="openPlanModal"
          >
            <span
              class="pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[transform]"
              :class="detail.monthlyPaymentPlanEnabled ? 'left-0.5 translate-x-[1.15rem]' : 'left-0.5 translate-x-0'"
            />
          </button>
        </div>
        <p v-if="planError" class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {{ planError }}
        </p>
      </section>

      <section class="overflow-hidden rounded-3xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
        <h2 class="border-b border-slate-100 px-6 py-4 text-lg font-bold text-slate-900">Enfants inscrits</h2>
        <ul class="divide-y divide-slate-100">
          <li v-for="c in detail.children" :key="c.childId" class="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <p class="font-semibold text-slate-900">{{ c.name }}</p>
              <p class="text-sm text-slate-600">{{ c.className }} · {{ c.schoolYear }}</p>
            </div>
            <NuxtLink
              v-if="c.canViewStudent"
              :to="`/admin/students/${c.childId}`"
              class="inline-flex items-center gap-1.5 rounded-xl border border-[#216EC2]/50 bg-[#216EC2]/10 px-3 py-2 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/15"
            >
              Voir l’élève
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
            <span
              v-else
              class="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-400"
              title="Disponible après validation de l'inscription et paiement."
            >
              Voir l’élève
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </li>
        </ul>
      </section>
    </article>

    <Teleport to="body">
      <div
        v-if="planModalOpen && detail"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="planModalOpen = false" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-parent-title"
          class="relative w-full max-w-[480px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <h2 id="plan-parent-title" class="text-xl font-bold tracking-tight text-slate-900">
            {{ detail.monthlyPaymentPlanEnabled ? 'Revenir au paiement annuel' : 'Activer l’échéancier mensuel' }}
          </h2>
          <p class="mt-4 text-[15px] leading-relaxed text-slate-600">
            {{
              detail.monthlyPaymentPlanEnabled
                ? 'Les mensualités encore impayées seront regroupées dans la facture annuelle (scolarité + mensualités de l’année). Les règlements déjà effectués sont conservés.'
                : 'La facture annuelle impayée sera scindée : une facture de scolarité, plus une facture par mois (septembre à juin) avec les options. Les règlements déjà effectués sont conservés.'
            }}
          </p>
          <p v-if="planError" class="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {{ planError }}
          </p>
          <div class="mt-6 flex gap-3">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="planPending"
              @click="confirmPlanChange"
            >
              {{ planPending ? 'Mise à jour…' : 'Confirmer' }}
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              :disabled="planPending"
              @click="planModalOpen = false"
            >
              Annuler
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

type ParentDetailDto = {
  id: string
  email: string
  fullName: string
  phone: string | null
  address: string | null
  relationLabel: string
  blocked: boolean
  monthlyPaymentPlanEnabled: boolean
  createdAt: string
  children: Array<{
    childId: string
    name: string
    className: string
    schoolYear: string
    canViewStudent: boolean
  }>
}

const route = useRoute()
const { token } = useAuth()
const config = useRuntimeConfig()

const parentId = computed(() => String(route.params.id ?? ''))
const detail = ref<ParentDetailDto | null>(null)
const loadError = ref<string | null>(null)
const pending = ref(true)
const planPending = ref(false)
const planError = ref<string | null>(null)
const planModalOpen = ref(false)

const phoneRaw = computed(() => (detail.value?.phone ?? '').replace(/\s/g, ''))

function openPlanModal() {
  if (!detail.value || planPending.value) return
  planError.value = null
  planModalOpen.value = true
}

async function confirmPlanChange() {
  const current = detail.value
  const t = token.value
  if (!current || !t) return
  planPending.value = true
  planError.value = null
  try {
    const res = await $fetch<{ monthlyPaymentPlanEnabled: boolean }>(
      `${config.public.apiBase}/admin/parents/${current.id}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${t}` },
        body: { monthlyPaymentPlanEnabled: !current.monthlyPaymentPlanEnabled },
      },
    )
    current.monthlyPaymentPlanEnabled = res.monthlyPaymentPlanEnabled
    planModalOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    planError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de mettre à jour l’échéancier.'
  } finally {
    planPending.value = false
  }
}

async function load() {
  pending.value = true
  loadError.value = null
  const t = token.value
  const id = parentId.value
  if (!t || !id) {
    pending.value = false
    detail.value = null
    return
  }
  try {
    const fetched = await $fetch<ParentDetailDto>(`${config.public.apiBase}/admin/parents/${id}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    detail.value = {
      ...fetched,
      monthlyPaymentPlanEnabled: Boolean(fetched.monthlyPaymentPlanEnabled),
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    loadError.value =
      err?.statusCode === 404
        ? 'Parent introuvable.'
        : typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw[0]
            : 'Impossible de charger la fiche.'
    detail.value = null
  } finally {
    pending.value = false
  }
}

watch(
  [token, parentId],
  () => {
    if (token.value) void load()
  },
  { immediate: true },
)
</script>
