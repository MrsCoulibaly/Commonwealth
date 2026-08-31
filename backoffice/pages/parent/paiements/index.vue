<template>
  <div>
    <h1 class="mb-1 text-3xl font-bold text-brandBlue">Paiements</h1>
    <p class="mb-6 text-sm text-slate-500">
      {{
        monthlyPaymentPlanEnabled
          ? 'Échéancier mensuel : une facture de scolarité, puis une facture chaque mois (septembre à juin).'
          : 'Une seule facture annuelle : frais de scolarité + mensualités de l’année. L’administration peut activer un échéancier sur votre dossier.'
      }}
    </p>

    <section class="mb-6 rounded-3xl border border-[#bdd7ef] bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 class="text-xl font-semibold text-slate-900">Gestion financière</h2>
        <div class="flex max-w-sm flex-col items-end gap-1.5">
          <button
            type="button"
            class="inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-sm font-bold text-white shadow-sm transition"
            :class="canPayTuition ? 'bg-emerald-500 hover:bg-emerald-600' : 'cursor-not-allowed bg-slate-300'"
            :disabled="!canPayTuition"
            @click="goPaymentScreen"
          >
            Payer la scolarité
          </button>
          <p v-if="!pending && !canPayTuition" class="text-right text-xs leading-snug text-slate-500">
            {{ paymentsEmptyLabel }}
          </p>
        </div>
      </div>
      <div class="grid gap-4 lg:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-[#f6fbff] p-4 lg:col-span-1">
          <div class="mb-2 text-sm font-medium text-slate-700">Solde actuel</div>
          <div class="rounded-xl border border-[#9ec5e5] bg-[#d9ecfb] p-5 text-center">
            <p class="text-3xl font-bold text-slate-900">{{ formatXof(totalPaidCents) }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 p-4 lg:col-span-3">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">Prochaine facture à payer</h3>
          <div v-if="pending" class="text-sm text-slate-500">Chargement…</div>
          <div
            v-else-if="nextInvoiceTop"
            class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-800">{{ nextInvoiceTop.title }}</p>
              <p class="text-xs text-slate-500">{{ nextInvoiceTop.dateLabel }}</p>
              <p class="mt-1 text-xs font-semibold text-brandBlue">{{ nextInvoiceTop.amountLabel }}</p>
            </div>
            <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                @click="viewTopInvoice()"
              >
                Voir
              </button>
              <button
                type="button"
                class="rounded-lg bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-200"
                @click="downloadTopInvoice()"
              >
                Télécharger PDF
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">{{ paymentsEmptyLabel }}</p>
        </div>
      </div>
    </section>

    <div class="mb-4">
      <div class="max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <input
          v-model.trim="search"
          type="text"
          placeholder="Recherche"
          class="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        >
      </div>
    </div>

    <section class="rounded-3xl border border-[#bdd7ef] bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-semibold text-slate-900">Historique</h2>
        <div class="flex items-center gap-2">
          <div v-if="showFilters" class="flex items-center gap-2">
            <label class="rounded-lg bg-brandBlue px-2 py-1 text-xs font-semibold text-white">
              <span class="mr-1">Date</span>
              <input
                v-model="selectedMonth"
                type="month"
                class="rounded border border-white/40 bg-brandBlue px-1 py-0.5 text-[11px] font-medium text-white outline-none [color-scheme:dark]"
              >
            </label>
            <label class="rounded-lg bg-brandBlue px-2 py-1 text-xs font-semibold text-white">
              <span class="mr-1">Enfant</span>
              <select
                v-model="selectedChild"
                class="rounded border border-white/40 bg-brandBlue px-1 py-0.5 text-[11px] font-medium text-white outline-none"
              >
                <option value="">Tous les enfants</option>
                <option v-for="name in childOptions" :key="name" :value="name">{{ name }}</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            class="rounded-lg bg-brandBlue px-3 py-1.5 text-xs font-semibold text-white"
            @click="showFilters = !showFilters"
          >
            Filtre
          </button>
        </div>
      </div>

      <div v-if="pending" class="text-sm text-slate-500">Chargement…</div>
      <div v-else-if="filteredRows.length" class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="min-w-full text-sm">
          <thead class="bg-brandBlue text-left text-white">
            <tr>
              <th class="px-3 py-2 font-semibold">Facture</th>
              <th class="px-3 py-2 font-semibold">Date</th>
              <th class="px-3 py-2 font-semibold">Montant</th>
              <th class="px-3 py-2 font-semibold">Statut</th>
              <th class="px-3 py-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.key" class="border-t border-slate-100 bg-white">
              <td class="px-3 py-2 font-medium text-slate-800">{{ row.invoiceLabel }}</td>
              <td class="px-3 py-2 text-slate-600">{{ row.dateLabel }}</td>
              <td class="px-3 py-2 text-slate-800">{{ row.amountLabel }}</td>
              <td class="px-3 py-2 text-slate-600">{{ row.statusLabel }}</td>
              <td class="px-3 py-2">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="row.status === 'PENDING'"
                    type="button"
                    class="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                    @click="goPaymentScreen"
                  >
                    Payer
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    @click="viewInvoiceRow(row)"
                  >
                    Voir
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-200"
                    @click="downloadInvoiceRow(row)"
                  >
                    {{ row.status === 'PAID' ? 'Télécharger le reçu' : 'Télécharger PDF' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-sm text-slate-500">{{ paymentsEmptyLabel }}</p>
    </section>

    <Teleport to="body">
      <div
        v-if="invoicePreviewOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-preview-title"
        @click.self="closeInvoicePreview"
      >
        <div class="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <h3 id="invoice-preview-title" class="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 sm:text-base">
              {{ invoicePreviewTitle }}
            </h3>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              @click="closeInvoicePreview"
            >
              Fermer
            </button>
          </div>
          <iframe
            v-if="invoicePreviewHtml"
            class="min-h-[55vh] w-full flex-1 border-0 bg-white"
            :title="invoicePreviewIsReceipt ? 'Aperçu du reçu de paiement' : 'Aperçu de la facture'"
            :srcdoc="invoicePreviewHtml"
          />
          <div class="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 px-4 py-3 sm:px-5">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              @click="closeInvoicePreview"
            >
              Fermer
            </button>
            <button
              type="button"
              class="rounded-lg bg-brandBlue px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              @click="downloadFromPreview"
            >
              {{ invoicePreviewIsReceipt ? 'Télécharger le reçu (PDF)' : 'Télécharger PDF' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  isPaidParentInvoiceSource,
  type BillingContactDto,
  type ParentInvoiceSource,
} from '~/composables/useParentSchoolInvoice';

definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

type ChildRef = { firstName: string; lastName: string };

type LevelRef = { name: string };

type LegacyPaymentRow = {
  id: string;
  year: number;
  month: number;
  status: string;
  amountCents?: number;
  createdAt?: string;
  paidAt?: string | null;
  transactionRef?: string | null;
  enrollment: {
    id: string;
    schoolYear: string;
    createdAt?: string;
    level?: LevelRef | null;
    child: ChildRef & { allergies?: string | null };
  };
};

type TuitionRow = {
  id: string;
  schoolYear: string;
  amountCents: number;
  status: string;
  createdAt?: string;
  paidAt?: string | null;
  transactionRef?: string | null;
  lines?: Array<{
    kind?: string;
    label: string;
    quantity?: number;
    unitAmountCents?: number;
    amountCents: number;
  }>;
  enrollment: {
    id: string;
    schoolYear: string;
    createdAt?: string;
    level?: LevelRef | null;
    child: ChildRef & { allergies?: string | null };
  };
};

type MonthlyRow = {
  id: string;
  year: number;
  month: number;
  totalAmountCents: number;
  status: string;
  createdAt?: string;
  paidAt?: string | null;
  transactionRef?: string | null;
  enrollment: {
    id: string;
    schoolYear: string;
    createdAt?: string;
    level?: LevelRef | null;
    child: ChildRef & { allergies?: string | null };
  };
  lines?: { label: string; amountCents: number }[];
};

type BillingContactRow = {
  fullName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  parentRelation: 'FATHER' | 'MOTHER' | null;
};

type PaymentsEmptyReason = 'NO_ENROLLMENT' | 'NOT_APPROVED' | 'NO_TARIFF' | 'ALL_PAID' | null

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const { authFetch } = useParentAuth();
const {
  buildInvoiceDocument,
  buildReceiptDocument,
  downloadInvoiceFromSource,
  downloadReceiptFromSource,
} = useParentSchoolInvoice();

const billingContact = ref<BillingContactRow | null>(null);
const legacyPayments = ref<LegacyPaymentRow[]>([]);
const tuitionCharges = ref<TuitionRow[]>([]);
const monthlyInstallments = ref<MonthlyRow[]>([]);
const totalPaidCents = ref(0);
const monthlyPaymentPlanEnabled = ref(false);
const emptyReason = ref<PaymentsEmptyReason>(null);
const search = ref('');
const selectedMonth = ref('');
const selectedChild = ref('');
const showFilters = ref(false);
const pending = ref(true);

const invoicePreviewOpen = ref(false);
const invoicePreviewTitle = ref('');
const invoicePreviewHtml = ref('');
const invoicePreviewSource = ref<ParentInvoiceSource | null>(null);
const invoicePreviewIsReceipt = ref(false);

function centsPositive(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
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

function paymentsEmptyMessage(reason: PaymentsEmptyReason) {
  if (reason === 'NO_ENROLLMENT') return 'Aucun dossier d’inscription n’est rattaché à ce compte.'
  if (reason === 'NOT_APPROVED') {
    return 'L’inscription est en attente de validation par l’école. Les factures apparaîtront ensuite.'
  }
  if (reason === 'NO_TARIFF') {
    return 'L’inscription est validée, mais les tarifs (scolarité / mensualité) sont à 0 XOF dans le paramétrage.'
  }
  if (reason === 'ALL_PAID') return 'Toutes les factures sont réglées.'
  return 'Aucune facture à payer pour le moment.'
}

const paymentsEmptyLabel = computed(() => paymentsEmptyMessage(emptyReason.value))

const canPayTuition = computed(() => {
  const tuitionOk = tuitionCharges.value.some(
    (t) => isPendingStatus(t.status) && centsPositive(t.amountCents) > 0,
  );
  const monthlyOk = monthlyInstallments.value.some(
    (m) =>
      isPendingStatus(m.status) &&
      centsPositive(m.totalAmountCents) > 0 &&
      isMonthlyInvoiceVisible(m.year, m.month),
  );
  return tuitionOk || monthlyOk;
});

function childName(c: ChildRef) {
  return `${c.firstName} ${c.lastName}`;
}

function formatXof(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type DisplayRow = {
  key: string;
  invoiceLabel: string;
  title: string;
  childName: string;
  dateLabel: string;
  dateValue: string;
  amountLabel: string;
  status: string;
  statusLabel: string;
  sortValue: number;
  download: ParentInvoiceSource;
};

function statusLabel(s: string) {
  if (s === 'PAID') return 'Payé';
  if (s === 'PENDING') return 'Non payé';
  if (s === 'FAILED') return 'Échec';
  if (s === 'CANCELLED') return 'Annulé';
  return s;
}

const allRows = computed((): DisplayRow[] => {
  const out: DisplayRow[] = [];

  for (const t of tuitionCharges.value) {
    const startYear = Number(t.schoolYear.slice(0, 4));
    const month = 9;
    const year = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
    out.push({
      key: `tuition-${t.id}`,
      invoiceLabel: '',
      title: monthlyPaymentPlanEnabled.value
        ? `Scolarité — ${childName(t.enrollment.child)} — ${t.schoolYear}`
        : `Facture annuelle — ${childName(t.enrollment.child)} — ${t.schoolYear}`,
      childName: childName(t.enrollment.child),
      dateLabel: `${String(month).padStart(2, '0')}/${year}`,
      dateValue: `${year}-${String(month).padStart(2, '0')}`,
      amountLabel: formatXof(t.amountCents),
      status: t.status,
      statusLabel: statusLabel(t.status),
      sortValue: year * 100 + month,
      download: { kind: 'tuition', charge: t, annualPackage: !monthlyPaymentPlanEnabled.value },
    });
  }

  for (const m of monthlyInstallments.value) {
    if (!isMonthlyInvoiceVisible(m.year, m.month)) continue;
    const mo = MOIS[m.month - 1] ?? String(m.month);
    const hasService = !!m.lines?.some((l) => (l.label ?? '').toLowerCase() !== 'mensualité');
    out.push({
      key: `monthly-${m.id}`,
      invoiceLabel: hasService ? 'Cantine' : 'Mensualité',
      title: `Mensualité — ${childName(m.enrollment.child)} — ${mo} ${m.year}`,
      childName: childName(m.enrollment.child),
      dateLabel: `${String(m.month).padStart(2, '0')}/${m.year}`,
      dateValue: `${m.year}-${String(m.month).padStart(2, '0')}`,
      amountLabel: formatXof(m.totalAmountCents),
      status: m.status,
      statusLabel: statusLabel(m.status),
      sortValue: m.year * 100 + m.month,
      download: { kind: 'monthly', installment: m },
    });
  }

  for (const p of legacyPayments.value) {
    const cents = p.amountCents ?? 0;
    out.push({
      key: `legacy-${p.id}`,
      invoiceLabel: 'Scolarité',
      title: `Ancien relevé — ${childName(p.enrollment.child)} — ${MOIS[p.month - 1] ?? p.month} ${p.year}`,
      childName: childName(p.enrollment.child),
      dateLabel: `${String(p.month).padStart(2, '0')}/${p.year}`,
      dateValue: `${p.year}-${String(p.month).padStart(2, '0')}`,
      amountLabel: cents ? formatXof(cents) : '-',
      status: p.status,
      statusLabel: statusLabel(p.status),
      sortValue: p.year * 100 + p.month,
      download: { kind: 'legacy', payment: p },
    });
  }

  const kindRank = (row: DisplayRow) => {
    if (row.download.kind === 'tuition') return 0;
    if (row.download.kind === 'monthly') return 1;
    return 2;
  };

  out.sort((a, b) => a.sortValue - b.sortValue || kindRank(a) - kindRank(b) || a.key.localeCompare(b.key));

  return out.map((row, i) => {
    const kindLabel =
      row.download.kind === 'tuition'
        ? monthlyPaymentPlanEnabled.value
          ? 'Scolarité'
          : 'Annuelle'
        : row.invoiceLabel || 'Facture';
    return {
      ...row,
      invoiceLabel: `Facture N°${String(i + 1).padStart(3, '0')} ${kindLabel}`,
    };
  });
});

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return allRows.value.filter((r) => {
    const bySearch =
      !q ||
      r.invoiceLabel.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.statusLabel.toLowerCase().includes(q) ||
      r.amountLabel.toLowerCase().includes(q);
    const byDate = !selectedMonth.value || r.dateValue === selectedMonth.value;
    const byChild = !selectedChild.value || r.childName === selectedChild.value;
    return bySearch && byDate && byChild;
  });
});

const childOptions = computed(() => {
  return [...new Set(allRows.value.map((r) => r.childName))].sort((a, b) => a.localeCompare(b, 'fr'));
});

function periodKeyTuition(schoolYear: string): number {
  const m = schoolYear.trim().match(/^(\d{4})-/);
  return m ? parseInt(m[1]!, 10) * 100 + 9 : 0;
}

/** Prochaine échéance impayée (priorité chronologique), même logique que l’accueil parent. */
const nextInvoiceTop = computed((): {
  key: string;
  invoiceLabel: string;
  title: string;
  childName: string;
  statusLabel: string;
  dateLabel: string;
  amountLabel: string;
  download: ParentInvoiceSource;
} | null => {
  type Cand = {
    key: string;
    invoiceLabel: string;
    sort: number;
    title: string;
    childName: string;
    statusLabel: string;
    dateLabel: string;
    amountLabel: string;
    download: ParentInvoiceSource;
  };
  const cands: Cand[] = [];

  const anyTuitionPending = tuitionCharges.value.some(
    (t) => isPendingStatus(t.status) && centsPositive(t.amountCents) > 0,
  );

  for (const t of tuitionCharges.value) {
    if (!isPendingStatus(t.status) || centsPositive(t.amountCents) <= 0) continue;
    const startYear = Number(t.schoolYear.slice(0, 4));
    const month = 9;
    const year = Number.isFinite(startYear) ? startYear : new Date().getFullYear();
    cands.push({
      key: `tuition-${t.id}`,
      invoiceLabel: monthlyPaymentPlanEnabled.value ? 'Facture Scolarité' : 'Facture annuelle',
      sort: periodKeyTuition(t.schoolYear),
      title: monthlyPaymentPlanEnabled.value
        ? `Scolarité — ${childName(t.enrollment.child)} — ${t.schoolYear}`
        : `Facture annuelle — ${childName(t.enrollment.child)} — ${t.schoolYear}`,
      childName: childName(t.enrollment.child),
      statusLabel: statusLabel(t.status),
      dateLabel: `${String(month).padStart(2, '0')}/${year}`,
      amountLabel: formatXof(t.amountCents),
      download: { kind: 'tuition', charge: t, annualPackage: !monthlyPaymentPlanEnabled.value },
    });
  }
  if (!anyTuitionPending) {
    for (const m of monthlyInstallments.value) {
      if (!isMonthlyInvoiceVisible(m.year, m.month)) continue;
      if (!isPendingStatus(m.status) || centsPositive(m.totalAmountCents) <= 0) continue;
      const mo = MOIS[m.month - 1] ?? String(m.month);
      cands.push({
        key: `monthly-${m.id}`,
        invoiceLabel: 'Facture Mensualité',
        sort: m.year * 100 + m.month,
        title: `Mensualité — ${childName(m.enrollment.child)} — ${mo} ${m.year}`,
        childName: childName(m.enrollment.child),
        statusLabel: statusLabel(m.status),
        dateLabel: `${String(m.month).padStart(2, '0')}/${m.year}`,
        amountLabel: formatXof(m.totalAmountCents),
        download: { kind: 'monthly', installment: m },
      });
    }
    for (const p of legacyPayments.value) {
      const amt = centsPositive(p.amountCents ?? 0);
      if (!isPendingStatus(p.status) || amt <= 0) continue;
      cands.push({
        key: `legacy-${p.id}`,
        invoiceLabel: 'Ancienne facture',
        sort: p.year * 100 + p.month,
        title: `Ancien relevé — ${childName(p.enrollment.child)} — ${MOIS[p.month - 1] ?? p.month} ${p.year}`,
        childName: childName(p.enrollment.child),
        statusLabel: statusLabel(p.status),
        dateLabel: `${String(p.month).padStart(2, '0')}/${p.year}`,
        amountLabel: formatXof(amt),
        download: { kind: 'legacy', payment: p },
      });
    }
  }

  if (!cands.length) return null;
  cands.sort((a, b) => a.sort - b.sort);
  const top = cands[0]!;
  return {
    key: top.key,
    invoiceLabel: top.invoiceLabel,
    title: top.title,
    childName: top.childName,
    statusLabel: top.statusLabel,
    dateLabel: top.dateLabel,
    amountLabel: top.amountLabel,
    download: top.download,
  };
});

function billingAsDto(): BillingContactDto | null {
  return billingContact.value;
}

async function downloadInvoiceRow(row: DisplayRow) {
  try {
    if (isPaidParentInvoiceSource(row.download)) {
      await downloadReceiptFromSource(row.download, billingAsDto());
    } else {
      await downloadInvoiceFromSource(row.download, billingAsDto());
    }
  } catch (e) {
    console.error(e);
  }
}

async function downloadTopInvoice() {
  const row = nextInvoiceTop.value;
  if (!row) return;
  try {
    await downloadInvoiceFromSource(row.download, billingAsDto());
  } catch (e) {
    console.error(e);
  }
}

async function openInvoicePreview(source: ParentInvoiceSource) {
  try {
    const paid = isPaidParentInvoiceSource(source);
    invoicePreviewIsReceipt.value = paid;
    const doc = paid
      ? await buildReceiptDocument(source, billingAsDto())
      : await buildInvoiceDocument(source, billingAsDto());
    invoicePreviewTitle.value = doc.title;
    invoicePreviewHtml.value = doc.html;
    invoicePreviewSource.value = source;
    invoicePreviewOpen.value = true;
  } catch (e) {
    console.error(e);
  }
}

function closeInvoicePreview() {
  invoicePreviewOpen.value = false;
  invoicePreviewHtml.value = '';
  invoicePreviewTitle.value = '';
  invoicePreviewSource.value = null;
  invoicePreviewIsReceipt.value = false;
}

async function downloadFromPreview() {
  const src = invoicePreviewSource.value;
  if (!src) return;
  try {
    if (invoicePreviewIsReceipt.value) {
      await downloadReceiptFromSource(src, billingAsDto());
    } else {
      await downloadInvoiceFromSource(src, billingAsDto());
    }
  } catch (e) {
    console.error(e);
  }
}

function viewInvoiceRow(row: DisplayRow) {
  void openInvoicePreview(row.download);
}

function viewTopInvoice() {
  const row = nextInvoiceTop.value;
  if (!row) return;
  void openInvoicePreview(row.download);
}

async function reloadPayments(opts?: { silent?: boolean }) {
  const silent = opts?.silent === true;
  if (!silent) pending.value = true;
  try {
    const res = await authFetch<{
      billingContact?: BillingContactRow | null;
      monthlyPaymentPlanEnabled?: boolean;
      legacyPayments?: LegacyPaymentRow[];
      tuitionCharges?: TuitionRow[];
      monthlyInstallments?: MonthlyRow[];
      payments?: LegacyPaymentRow[];
      totalPaidCents?: number;
      emptyReason?: PaymentsEmptyReason;
    }>('/parent/payments');
    billingContact.value = res?.billingContact ?? null;
    monthlyPaymentPlanEnabled.value = Boolean(res?.monthlyPaymentPlanEnabled);
    legacyPayments.value = res?.legacyPayments ?? res?.payments ?? [];
    tuitionCharges.value = res?.tuitionCharges ?? [];
    monthlyInstallments.value = res?.monthlyInstallments ?? [];
    totalPaidCents.value = Number.isFinite(res?.totalPaidCents) ? Number(res?.totalPaidCents) : 0;
    emptyReason.value = res?.emptyReason ?? null;
  } catch {
    billingContact.value = null;
    monthlyPaymentPlanEnabled.value = false;
    legacyPayments.value = [];
    tuitionCharges.value = [];
    monthlyInstallments.value = [];
    totalPaidCents.value = 0;
    emptyReason.value = null;
  } finally {
    if (!silent) pending.value = false;
  }
}

function onPaymentsCompleted() {
  void reloadPayments({ silent: true });
}

function goPaymentScreen() {
  void navigateTo('/parent/paiements/payer');
}

onMounted(() => {
  void reloadPayments();
});
</script>
