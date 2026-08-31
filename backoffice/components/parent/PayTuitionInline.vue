<template>
  <div class="mb-6 rounded-[24px] border border-[#9ec5e5] bg-white p-4 shadow-sm sm:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 class="text-[30px] font-bold text-brandBlue">Paiement</h2>
      </div>
      <button
        type="button"
        class="rounded-lg px-2 py-1 text-xl font-semibold leading-none text-[#c56b5f] hover:bg-slate-100"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div v-if="loading" class="py-10 text-center text-sm text-slate-500">Chargement…</div>
    <template v-else>
      <label class="mb-4 block">
        <span class="mb-1.5 block text-sm font-semibold text-slate-800">Montant</span>
        <input
          :value="displayAmount"
          type="text"
          readonly
          class="w-full rounded-[10px] border border-[#4a8cbe] bg-white px-4 py-2.5 text-sm text-[#3f6f95] outline-none"
        >
      </label>

      <p class="mb-2 text-sm font-semibold text-slate-800">Moyens de paiement</p>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <button
          v-for="m in methodsForCountry"
          :key="m.id"
          type="button"
          class="flex min-h-[68px] items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide shadow-sm transition"
          :class="[m.style, paymentMethod === m.id ? m.ring : 'border-transparent opacity-90 hover:opacity-100']"
          @click="paymentMethod = m.id"
        >
          <img :src="m.logo" :alt="m.label" class="h-10 w-auto object-contain sm:h-11" />
        </button>
        <button
          v-if="phoneCountry === '+225'"
          type="button"
          class="flex min-h-[68px] flex-col items-center justify-center rounded-xl border-2 border-[#ffcc00] bg-[#ffcc00] px-2 py-2 text-center text-[11px] font-extrabold uppercase leading-tight text-black shadow-sm transition"
          :class="paymentMethod === 'mtn_money' ? 'ring-2 ring-[#c9a100] ring-offset-2' : 'border-transparent opacity-95 hover:opacity-100'"
          @click="paymentMethod = 'mtn_money'"
        >
          MTN CI
        </button>
        <button
          v-if="phoneCountry === '+225'"
          type="button"
          class="flex min-h-[68px] flex-col items-center justify-center rounded-xl border-2 border-[#0066b3] bg-[#0066b3] px-2 py-2 text-center text-[11px] font-extrabold uppercase leading-tight text-white shadow-sm transition"
          :class="paymentMethod === 'moov_money' ? 'ring-2 ring-[#004a82] ring-offset-2' : 'border-transparent opacity-95 hover:opacity-100'"
          @click="paymentMethod = 'moov_money'"
        >
          Moov CI
        </button>
        <button
          type="button"
          class="flex min-h-[68px] items-center justify-center rounded-xl border-2 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide shadow-sm transition"
          :class="paymentMethod === 'card' ? 'border-[#1e5ea1] bg-[#2f77c2] text-white ring-2 ring-[#1e5ea1] ring-offset-2' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="paymentMethod = 'card'"
        >
          Carte bancaire
        </button>
      </div>

      <div v-if="paymentMethod === 'orange_money' && phoneCountry === '+225'" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
        Orange Money CI : composez <strong>#144*82#</strong> puis option <strong>2</strong> pour obtenir le code de paiement, puis saisissez-le ci-dessous.
      </div>
      <div v-if="paymentMethod === 'orange_money' && phoneCountry === '+225'" class="mt-2">
        <input
          v-model.trim="orangeMoneyCiOtp"
          type="text"
          inputmode="numeric"
          maxlength="8"
          placeholder="Code de paiement Orange CI"
          class="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
      </div>

      <div v-if="paymentMethod === 'wizall' && wizallTransactionId" class="mt-3">
        <p class="mb-2 text-xs text-slate-600">Saisissez le code Wizall reçu par SMS pour confirmer le paiement.</p>
        <input
          v-model.trim="wizallOtp"
          type="text"
          inputmode="numeric"
          maxlength="8"
          placeholder="Code Wizall"
          class="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
      </div>

      <div v-if="paymentMethod !== 'card' && paymentMethod !== 'western_union'" class="mt-4 grid gap-2 sm:grid-cols-2">
        <input
          v-model.trim="firstName"
          type="text"
          placeholder="Prénom"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
        <input
          v-model.trim="lastName"
          type="text"
          placeholder="Nom"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
        <div class="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-3">
          <select
            v-model="phoneCountry"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="+221">Sénégal (+221)</option>
            <option value="+225">Côte d'Ivoire (+225)</option>
          </select>
          <input
            v-model.trim="phoneLocal"
            type="tel"
            placeholder="Téléphone"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 sm:col-span-2"
          >
        </div>
      </div>

      <div v-else-if="paymentMethod === 'western_union'" class="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        Western Union n’est pas disponible en ligne. Rendez-vous à la caisse de l’école.
      </div>
      <div v-else class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Le paiement par carte bancaire sera bientôt disponible.
      </div>

      <p v-if="walletRedirectUrl" class="mt-4 text-sm">
        <a
          :href="walletRedirectUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-semibold text-[#216EC2] underline"
        >
          Ouvrir la page de paiement Wave / Orange Money
        </a>
      </p>

      <p v-if="feedback" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        {{ feedback }}
      </p>
      <p v-if="errorMsg" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ errorMsg }}
      </p>

      <div class="mt-5">
        <button
          type="button"
          class="flex w-full items-center justify-center rounded-[9px] bg-[#1ea20a] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || submitting || !canSubmit"
          @click="submit"
        >
          {{ submitting ? submitPhase : pendingCheckoutToken ? 'Vérifier le paiement' : 'Payer' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import waveLogo from '~/assets/images/wave.png';
import omLogo from '~/assets/images/om.png';
import wizallLogo from '~/assets/images/wizall.png';
import westernLogo from '~/assets/images/western.png';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type OverviewChild = { id: string; firstName: string; lastName: string; enrollments: Array<{ id: string; schoolYear: string; status: EnrollmentStatus }> };
type Me = { phone: string | null; fullName?: string | null; email?: string | null };
type ChildRef = { firstName: string; lastName: string };
type TuitionRow = { amountCents: number; status: string; schoolYear: string; enrollment: { child: ChildRef } };
type MonthlyRow = { totalAmountCents: number; status: string; year: number; month: number; enrollment: { child: ChildRef } };
type LegacyPaymentRow = { amountCents?: number; status: string; year: number; month: number; enrollment: { child: ChildRef } };

const emit = defineEmits<{ completed: []; close: [] }>();
const { authFetch } = useParentAuth();
const loading = ref(false);
const submitting = ref(false);
const firstName = ref('');
const lastName = ref('');
const phoneCountry = ref<'+221' | '+225'>('+221');
const phoneLocal = ref('');
const selectedIds = ref<string[]>([]);
const paymentMethod = ref<
  'wave' | 'orange_money' | 'wizall' | 'western_union' | 'mtn_money' | 'moov_money' | 'card' | null
>(null);
const orangeMoneyCiOtp = ref('');
const wizallOtp = ref('');
const wizallTransactionId = ref('');
const pendingCheckoutToken = ref('');
const walletRedirectUrl = ref('');
const submitPhase = ref('Envoi…');
const parentEmail = ref('');
const feedback = ref('');
const errorMsg = ref('');
const overview = ref<OverviewChild[] | null>(null);
const monthlyAmountXof = ref(0);

const methodsAll = [
  { id: 'wave' as const, label: 'Wave', logo: waveLogo, style: 'bg-[#4AD2FA] text-white', ring: 'ring-2 ring-[#30a7ca] ring-offset-2' },
  { id: 'orange_money' as const, label: 'OM', logo: omLogo, style: 'bg-black text-white', ring: 'ring-2 ring-black ring-offset-2' },
  { id: 'wizall' as const, label: 'Wizall', logo: wizallLogo, countries: ['+221'] as const, style: 'bg-[#00BACF] text-white', ring: 'ring-2 ring-[#008d9c] ring-offset-2' },
  { id: 'western_union' as const, label: 'Western union', logo: westernLogo, style: 'bg-black text-white', ring: 'ring-2 ring-black ring-offset-2' },
];

const methodsForCountry = computed(() => {
  const cc = phoneCountry.value;
  return methodsAll.filter((m) => !('countries' in m) || (m as { countries?: readonly string[] }).countries?.includes(cc));
});

const rows = computed(() =>
  (overview.value ?? []).map((c) => {
    const latest = c.enrollments?.[0];
    const label = `${c.firstName} ${c.lastName}`.trim();
    if (!latest) return { childId: c.id, label, schoolYear: '', canPay: false, blockReason: 'Aucune inscription.' };
    const schoolYear = latest.schoolYear ? `Année scolaire ${latest.schoolYear}` : '';
    if (latest.status === 'APPROVED') return { childId: c.id, label, schoolYear, canPay: true, blockReason: '' };
    if (latest.status === 'PENDING') return { childId: c.id, label, schoolYear, canPay: false, blockReason: 'Inscription non validée.' };
    return { childId: c.id, label, schoolYear, canPay: false, blockReason: 'Inscription refusée.' };
  }),
);

const canSubmit = computed(() => {
  if (!selectedIds.value.length || !paymentMethod.value) return false;
  if (paymentMethod.value === 'card' || paymentMethod.value === 'western_union') return false;
  if (paymentMethod.value === 'orange_money' && phoneCountry.value === '+225') {
    if (!orangeMoneyCiOtp.value.trim()) return false;
  }
  if (paymentMethod.value === 'wizall' && wizallTransactionId.value && !wizallOtp.value.trim()) {
    return false;
  }
  return !!firstName.value.trim() && !!lastName.value.trim() && !!phoneLocal.value.trim();
});
const displayAmount = computed(() => `${new Intl.NumberFormat('fr-FR').format(monthlyAmountXof.value)} XOF`);
const fullPhoneForWallet = computed(() => `${phoneCountry.value}${phoneLocal.value.replace(/\s+/g, '')}`);

watch(phoneCountry, () => {
  if (paymentMethod.value === 'wizall' && phoneCountry.value === '+225') paymentMethod.value = null;
  if ((paymentMethod.value === 'mtn_money' || paymentMethod.value === 'moov_money') && phoneCountry.value !== '+225') {
    paymentMethod.value = null;
  }
});

watch([paymentMethod, phoneCountry], () => {
  pendingCheckoutToken.value = '';
  walletRedirectUrl.value = '';
  wizallTransactionId.value = '';
  wizallOtp.value = '';
});

function stripCountry(phone: string, dial: '+221' | '+225'): string {
  const p = phone.replace(/\s+/g, '');
  if (p.startsWith(dial)) return p.slice(dial.length);
  if (dial === '+221' && p.startsWith('221')) return p.slice(3);
  if (dial === '+225' && p.startsWith('225')) return p.slice(3);
  return p.replace(/^\+/, '');
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitCheckoutPaid(checkoutToken: string, hadRedirectUrl: boolean): Promise<boolean> {
  const attempts = hadRedirectUrl ? 20 : 10;
  const delayMs = hadRedirectUrl ? 3000 : 1500;
  for (let i = 0; i < attempts; i++) {
    const verify = await authFetch<{ paid?: boolean }>(
      `/parent/payments/checkout/${encodeURIComponent(checkoutToken)}/status`,
    );
    if (verify?.paid) return true;
    if (i < attempts - 1) await sleep(delayMs);
  }
  return false;
}

function paydunyaErrorMessage(e: unknown): string {
  const x = e as {
    data?: { message?: string | string[]; response_text?: string };
    message?: string;
    statusMessage?: string;
  };
  const rt = x?.data?.response_text;
  if (typeof rt === 'string' && rt.trim()) return rt.trim();
  const m = x?.data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m) && m[0]) return String(m[0]);
  if (typeof x?.statusMessage === 'string' && x.statusMessage.trim()) return x.statusMessage;
  if (typeof x?.message === 'string' && x.message.trim()) return x.message;
  if (e instanceof Error && e.message.trim()) return e.message;
  return 'Enregistrement du paiement impossible.';
}

function toXof(cents: number): number {
  const n = Number(cents);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 100);
}

function periodKeyFromSchoolYear(schoolYear: string): number {
  const m = schoolYear.trim().match(/^(\d{4})-/);
  return m ? parseInt(m[1]!, 10) * 100 + 9 : 0;
}

function isPendingStatus(s: unknown): boolean {
  return String(s ?? '').toUpperCase() === 'PENDING';
}

function isMonthlyInvoiceVisible(year: number, month: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return true;
  if (year > currentYear || month > currentMonth) return false;
  const lastDay = new Date(year, month, 0).getDate();
  const thresholdDay = Math.max(1, lastDay - 9);
  return now.getDate() >= thresholdDay;
}

function resolveAmountXofFromPayments(data: {
  tuitionCharges?: TuitionRow[];
  monthlyInstallments?: MonthlyRow[];
  legacyPayments?: LegacyPaymentRow[];
  payments?: LegacyPaymentRow[];
}): number {
  const tuition = (data.tuitionCharges ?? [])
    .filter((t) => isPendingStatus(t.status) && Number(t.amountCents) > 0)
    .sort((a, b) => periodKeyFromSchoolYear(a.schoolYear) - periodKeyFromSchoolYear(b.schoolYear));
  if (tuition.length) return toXof(tuition[0]!.amountCents);

  const monthly = (data.monthlyInstallments ?? [])
    .filter((m) => isPendingStatus(m.status) && Number(m.totalAmountCents) > 0 && isMonthlyInvoiceVisible(m.year, m.month))
    .sort((a, b) => (a.year * 100 + a.month) - (b.year * 100 + b.month));
  if (monthly.length) return toXof(monthly[0]!.totalAmountCents);

  const legacy = (data.legacyPayments ?? data.payments ?? [])
    .filter((p) => isPendingStatus(p.status) && Number(p.amountCents ?? 0) > 0)
    .sort((a, b) => (a.year * 100 + a.month) - (b.year * 100 + b.month));
  if (legacy.length) return toXof(Number(legacy[0]!.amountCents ?? 0));

  return 0;
}

async function loadData() {
  loading.value = true;
  errorMsg.value = '';
  feedback.value = '';
  try {
    const [ov, me, payments] = await Promise.all([
      authFetch<OverviewChild[]>('/parent/overview'),
      authFetch<Me>('/parent/me'),
      authFetch<{
        legacyPayments?: LegacyPaymentRow[];
        tuitionCharges?: TuitionRow[];
        monthlyInstallments?: MonthlyRow[];
        payments?: LegacyPaymentRow[];
      }>('/parent/payments'),
    ]);
    overview.value = ov ?? [];
    monthlyAmountXof.value = resolveAmountXofFromPayments(payments ?? {});
    const fullName = String(me?.fullName ?? '').trim();
    if (fullName) {
      const [first, ...rest] = fullName.split(/\s+/);
      firstName.value = first ?? '';
      lastName.value = rest.join(' ');
    }
    parentEmail.value = String(me?.email ?? '').trim() || 'parent@commonwealth-school.local';
    const p = String(me?.phone ?? '').trim();
    if (p.startsWith('+225')) {
      phoneCountry.value = '+225';
      phoneLocal.value = p.slice(4).trim();
    } else if (p.startsWith('+221')) {
      phoneCountry.value = '+221';
      phoneLocal.value = p.slice(4).trim();
    } else {
      phoneCountry.value = '+221';
      phoneLocal.value = p;
    }
    selectedIds.value = rows.value.filter((r) => r.canPay).map((r) => r.childId);
  } catch {
    overview.value = [];
    errorMsg.value = 'Impossible de charger les élèves.';
  } finally {
    loading.value = false;
  }
}

async function confirmPaidOnServer(checkoutToken: string, channel: string) {
  const res = await authFetch<{ results: Array<{ ok: boolean; message?: string; kind?: string }> }>(
    '/parent/payments/complete',
    {
      method: 'POST',
      body: {
        checkoutToken,
        childIds: [...selectedIds.value],
        phone: fullPhoneForWallet.value,
        channel,
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
      },
    },
  );
  const ok = (res?.results ?? []).filter((r) => r.ok).length;
  feedback.value = ok
    ? `Paiement confirmé pour ${ok} élève${ok > 1 ? 's' : ''}.`
    : 'Paiement confirmé.';
  pendingCheckoutToken.value = '';
  walletRedirectUrl.value = '';
  wizallTransactionId.value = '';
  emit('completed');
}

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  errorMsg.value = '';
  feedback.value = '';
  try {
    const pm = paymentMethod.value;
    if (!pm || pm === 'card' || pm === 'western_union') return;

    if (monthlyAmountXof.value <= 0) {
      throw new Error('Aucune facture impayée disponible pour paiement.');
    }

    let checkoutToken = pendingCheckoutToken.value;
    let hadRedirect = Boolean(walletRedirectUrl.value);

    const shouldConfirmWizall = Boolean(checkoutToken && wizallTransactionId.value && wizallOtp.value.trim());
    const verifyOnly = Boolean(checkoutToken && !shouldConfirmWizall && !wizallTransactionId.value);

    if (!checkoutToken || shouldConfirmWizall) {
      if (!checkoutToken) {
        submitPhase.value = 'Création de la facture…';
        const checkout = await authFetch<{ token: string; amountXof?: number }>(
          '/parent/payments/checkout',
          {
            method: 'POST',
            body: {
              childIds: [...selectedIds.value],
              channel: pm,
              description: `Scolarité Commonwealth — ${displayAmount.value}`,
            },
          },
        );
        checkoutToken = String(checkout?.token ?? '').trim();
        if (!checkoutToken) throw new Error('PayDunya n’a pas renvoyé de token de paiement.');
        pendingCheckoutToken.value = checkoutToken;
        if (typeof checkout.amountXof === 'number' && checkout.amountXof > 0) {
          monthlyAmountXof.value = checkout.amountXof;
        }
      }

      submitPhase.value = 'Envoi vers Wave / Orange Money…';
      const soft = await authFetch<{
        success?: boolean;
        paid?: boolean;
        message?: string;
        redirectUrl?: string;
        wizallTransactionId?: string;
        needsWizallOtp?: boolean;
      }>('/parent/payments/softpay', {
        method: 'POST',
        body: {
          checkoutToken,
          channel: pm,
          country: phoneCountry.value,
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          email: parentEmail.value,
          phoneLocal: phoneLocal.value,
          orangeOtp: orangeMoneyCiOtp.value,
          wizallAuthorizationCode: wizallOtp.value,
          wizallTransactionId: wizallTransactionId.value,
        },
      });

      if (soft?.paid) {
        submitPhase.value = 'Enregistrement…';
        await confirmPaidOnServer(checkoutToken, pm);
        return;
      }

      if (soft?.needsWizallOtp && soft.wizallTransactionId) {
        wizallTransactionId.value = soft.wizallTransactionId;
        feedback.value = 'Un code Wizall va arriver par SMS. Saisissez-le puis cliquez sur Payer.';
        return;
      }

      const redirectUrl = String(soft?.redirectUrl ?? '').trim();
      if (redirectUrl) {
        walletRedirectUrl.value = redirectUrl;
        hadRedirect = true;
        window.open(redirectUrl, '_blank', 'noopener,noreferrer');
        feedback.value = 'Validez le paiement dans l’onglet Wave / Orange Money, puis patientez…';
      } else {
        feedback.value = String(soft?.message ?? 'Validez le paiement sur votre téléphone…');
      }
    }

    submitPhase.value = verifyOnly ? 'Vérification…' : 'Confirmation du paiement…';
    const paid = await waitCheckoutPaid(checkoutToken, hadRedirect);
    if (!paid) {
      throw new Error(
        'Le paiement n’est pas encore confirmé. Si vous avez validé sur le téléphone, cliquez sur « Vérifier le paiement ».',
      );
    }

    submitPhase.value = 'Enregistrement…';
    await confirmPaidOnServer(checkoutToken, pm);
  } catch (e: unknown) {
    errorMsg.value = paydunyaErrorMessage(e);
  } finally {
    submitting.value = false;
    submitPhase.value = 'Envoi…';
  }
}

onMounted(() => {
  void loadData();
});
</script>
