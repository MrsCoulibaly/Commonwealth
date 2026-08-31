<template>
  <Teleport to="body">
    <Transition name="pay-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-tuition-title"
      >
        <div
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="close"
        />
        <div
          class="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 id="pay-tuition-title" class="text-lg font-bold text-brandBlue">Payer la scolarité</h2>
              <p class="mt-0.5 text-xs text-slate-500">Sélectionnez les élèves concernés et le moyen de paiement.</p>
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Fermer"
              @click="close"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div v-if="loading" class="py-10 text-center text-sm text-slate-500">Chargement…</div>
            <template v-else>
              <p class="mb-2 text-sm font-semibold text-slate-800">Élèves</p>
              <ul class="mb-5 space-y-2">
                <li
                  v-for="row in rows"
                  :key="row.childId"
                  class="flex items-start gap-3 rounded-xl border px-3 py-2.5 transition"
                  :class="
                    row.canPay
                      ? 'border-slate-200 bg-white'
                      : 'cursor-not-allowed border-slate-100 bg-slate-100/90 text-slate-400'
                  "
                >
                  <input
                    :id="`pay-child-${row.childId}`"
                    v-model="selectedIds"
                    type="checkbox"
                    class="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brandBlue focus:ring-brandBlue"
                    :value="row.childId"
                    :disabled="!row.canPay"
                  >
                  <label
                    :for="`pay-child-${row.childId}`"
                    class="min-w-0 flex-1 cursor-pointer text-sm"
                    :class="row.canPay ? 'text-slate-800' : 'cursor-not-allowed'"
                  >
                    <span class="font-medium">{{ row.label }}</span>
                    <span v-if="row.schoolYear" class="mt-0.5 block text-xs font-normal text-slate-500">
                      {{ row.schoolYear }}
                    </span>
                    <span v-if="!row.canPay" class="mt-1 block text-xs text-slate-500">
                      {{ row.blockReason }}
                    </span>
                  </label>
                </li>
              </ul>
              <p v-if="!rows.length" class="mb-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
                Aucun enfant enregistré.
              </p>

              <label class="mb-5 block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-800">Téléphone</span>
                <input
                  v-model.trim="phone"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="Ex. 77 123 45 67"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none ring-brandBlue/30 transition focus:border-brandBlue focus:ring-2"
                >
              </label>

              <p class="mb-2 text-sm font-semibold text-slate-800">Moyen de paiement</p>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
                <button
                  v-for="m in methods"
                  :key="m.id"
                  type="button"
                  class="flex min-h-[52px] items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide shadow-sm transition"
                  :class="[
                    m.style,
                    paymentMethod === m.id ? m.ring : 'border-transparent opacity-90 hover:opacity-100',
                  ]"
                  @click="paymentMethod = m.id"
                >
                  <img :src="m.logo" :alt="m.label" class="h-6 w-auto object-contain" />
                </button>
              </div>

              <p v-if="feedback" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {{ feedback }}
              </p>
              <p v-if="errorMsg" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {{ errorMsg }}
              </p>
            </template>
          </div>

          <div class="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4">
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-xl bg-brandBlue px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading || submitting || !canSubmit"
              @click="submit"
            >
              {{ submitting ? 'Envoi…' : 'Payer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import waveLogo from '~/assets/images/wave.png';
import omLogo from '~/assets/images/om.png';
import wizallLogo from '~/assets/images/wizall.png';
import westernLogo from '~/assets/images/western.png';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type OverviewChild = {
  id: string;
  firstName: string;
  lastName: string;
  enrollments: Array<{
    id: string;
    schoolYear: string;
    status: EnrollmentStatus;
  }>;
};

type Me = { phone: string | null };

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  /** Après enregistrement réussi en base (recharger les paiements côté parent). */
  completed: [];
}>();

const { authFetch } = useParentAuth();

const loading = ref(false);
const submitting = ref(false);
const phone = ref('');
const selectedIds = ref<string[]>([]);
const paymentMethod = ref<'wave' | 'orange_money' | 'wizall' | 'western_union' | null>(null);
const feedback = ref('');
const errorMsg = ref('');
const overview = ref<OverviewChild[] | null>(null);

const methods = [
  {
    id: 'wave' as const,
    label: 'Wave',
    logo: waveLogo,
    style: 'bg-[#00D4AA] text-white',
    ring: 'ring-2 ring-[#00b894] ring-offset-2',
  },
  {
    id: 'orange_money' as const,
    label: 'OM',
    logo: omLogo,
    style: 'bg-[#FF6600] text-white',
    ring: 'ring-2 ring-[#e65c00] ring-offset-2',
  },
  {
    id: 'wizall' as const,
    label: 'Wizall',
    logo: wizallLogo,
    style: 'bg-[#5B2C91] text-white',
    ring: 'ring-2 ring-[#4a2478] ring-offset-2',
  },
  {
    id: 'western_union' as const,
    label: 'Western union',
    logo: westernLogo,
    style: 'bg-[#FFDD00] text-[#1a1a1a]',
    ring: 'ring-2 ring-[#1a1a1a] ring-offset-2',
  },
];

type Row = {
  childId: string;
  label: string;
  schoolYear: string;
  canPay: boolean;
  blockReason: string;
};

const rows = computed((): Row[] => {
  const list = overview.value ?? [];
  return list.map((c) => {
    const name = `${c.firstName} ${c.lastName}`.trim();
    const latest = c.enrollments?.[0];
    if (!latest) {
      return {
        childId: c.id,
        label: name,
        schoolYear: '',
        canPay: false,
        blockReason: 'Aucune inscription — paiement indisponible.',
      };
    }
    const sy = latest.schoolYear ? `Année scolaire ${latest.schoolYear}` : '';
    if (latest.status === 'APPROVED') {
      return {
        childId: c.id,
        label: name,
        schoolYear: sy,
        canPay: true,
        blockReason: '',
      };
    }
    if (latest.status === 'PENDING') {
      return {
        childId: c.id,
        label: name,
        schoolYear: sy,
        canPay: false,
        blockReason: 'Inscription non encore validée par l’école.',
      };
    }
    return {
      childId: c.id,
      label: name,
      schoolYear: sy,
      canPay: false,
      blockReason: 'Inscription refusée — paiement indisponible.',
    };
  });
});

const canSubmit = computed(() => {
  if (!selectedIds.value.length) return false;
  if (!phone.value.trim()) return false;
  if (!paymentMethod.value) return false;
  return true;
});

function close() {
  emit('update:modelValue', false);
}

async function loadData() {
  loading.value = true;
  errorMsg.value = '';
  feedback.value = '';
  try {
    const [ov, me] = await Promise.all([
      authFetch<OverviewChild[]>('/parent/overview'),
      authFetch<Me>('/parent/me'),
    ]);
    overview.value = ov ?? [];
    phone.value = me?.phone?.trim() ?? '';
    selectedIds.value = [];
    paymentMethod.value = null;
  } catch {
    overview.value = [];
    errorMsg.value = 'Impossible de charger les élèves.';
  } finally {
    loading.value = false;
  }
}

type CompletePaymentsDto = {
  channel: string;
  phone: string;
  recordedAt: string;
  results: Array<{
    childId: string;
    ok: boolean;
    kind?: 'TUITION' | 'MONTHLY_INSTALLMENT';
    message?: string;
  }>;
};

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  errorMsg.value = '';
  feedback.value = '';
  try {
    const res = await authFetch<CompletePaymentsDto>('/parent/payments/complete', {
      method: 'POST',
      body: {
        childIds: [...selectedIds.value],
        phone: phone.value.trim(),
        channel: paymentMethod.value,
      },
    });
    const ok = res.results.filter((r) => r.ok);
    const ko = res.results.filter((r) => !r.ok);
    const kindFr = (k?: string) =>
      k === 'TUITION' ? 'scolarité' : k === 'MONTHLY_INSTALLMENT' ? 'mensualité' : 'paiement';
    let msg = `Paiement enregistré pour ${ok.length} élève${ok.length > 1 ? 's' : ''}`;
    const kinds = [...new Set(ok.map((r) => kindFr(r.kind)).filter(Boolean))];
    if (kinds.length) msg += ` (${kinds.join(', ')})`;
    msg += '.';
    if (ko.length) {
      msg += ` Non traité : ${ko.map((k) => k.message ?? '—').join(' ; ')}`;
    }
    feedback.value = msg;
    emit('completed');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    errorMsg.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Enregistrement du paiement impossible.';
  } finally {
    submitting.value = false;
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      feedback.value = '';
      errorMsg.value = '';
      void loadData();
    }
  },
);

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    e.preventDefault();
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown);
});
</script>

<style scoped>
.pay-modal-enter-active,
.pay-modal-leave-active {
  transition: opacity 0.2s ease;
}
.pay-modal-enter-active .relative,
.pay-modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.pay-modal-enter-from,
.pay-modal-leave-to {
  opacity: 0;
}
.pay-modal-enter-from .relative,
.pay-modal-leave-to .relative {
  transform: translateY(12px);
  opacity: 0.95;
}
</style>
