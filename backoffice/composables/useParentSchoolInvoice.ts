import logoSrc from '~/assets/images/logo.png';
import {
  buildParentInvoiceHtml,
  formatXofFromCents,
  matriculeFromEnrollmentId,
  monthEndDateFr,
  schoolTrimesterFromMonth,
  stableInvoiceNumber,
  tuitionAnnualDueDateFr,
  type ParentInvoiceLine,
} from '~/utils/parentInvoiceHtml';
import {
  buildParentReceiptHtml,
  formatPaymentModeFromTransactionRef,
  parseMedicalTags,
  stableReceiptNumber,
  type ParentReceiptLine,
} from '~/utils/parentReceiptHtml';
import { resolveSchoolContact } from '~/utils/school-contact';

export type BillingContactDto = {
  fullName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  parentRelation: 'FATHER' | 'MOTHER' | null;
};

type LevelRef = { name: string };
type ChildRef = { firstName: string; lastName: string; allergies?: string | null };

export type TuitionChargeInvoiceDto = {
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
    child: ChildRef;
  };
};

export type MonthlyInstallmentInvoiceDto = {
  id: string;
  year: number;
  month: number;
  totalAmountCents: number;
  status: string;
  createdAt?: string;
  paidAt?: string | null;
  transactionRef?: string | null;
  lines?: { label: string; amountCents: number }[];
  enrollment: {
    id: string;
    schoolYear: string;
    createdAt?: string;
    level?: LevelRef | null;
    child: ChildRef;
  };
};

export type LegacyPaymentInvoiceDto = {
  id: string;
  year: number;
  month: number;
  amountCents?: number;
  status: string;
  createdAt?: string;
  paidAt?: string | null;
  transactionRef?: string | null;
  enrollment: {
    id: string;
    schoolYear: string;
    createdAt?: string;
    level?: LevelRef | null;
    child: ChildRef;
  };
};

/** Source facture (aperçu + PDF). */
export type ParentInvoiceSource =
  | { kind: 'tuition'; charge: TuitionChargeInvoiceDto; annualPackage?: boolean }
  | { kind: 'monthly'; installment: MonthlyInstallmentInvoiceDto }
  | { kind: 'legacy'; payment: LegacyPaymentInvoiceDto };

export type ParentInvoiceDocument = {
  /** Titre court pour la modale */
  title: string;
  /** Préfixe fichier sans extension */
  filenameBase: string;
  html: string;
};

/** Reçu de paiement (lignes déjà payées) — même forme que facture pour l’aperçu modale. */
export type ParentReceiptDocument = ParentInvoiceDocument;

export function isPaidParentInvoiceSource(source: ParentInvoiceSource): boolean {
  if (source.kind === 'tuition') return String(source.charge.status ?? '').toUpperCase() === 'PAID';
  if (source.kind === 'monthly') return String(source.installment.status ?? '').toUpperCase() === 'PAID';
  return String(source.payment.status ?? '').toUpperCase() === 'PAID';
}

function childName(c: ChildRef): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function billedToTitle(contact: BillingContactDto): string {
  const name = contact.fullName?.trim() || 'Parent';
  if (contact.parentRelation === 'FATHER') return `M. ${name} (Père)`;
  if (contact.parentRelation === 'MOTHER') return `Mme ${name} (Mère)`;
  return name;
}

function billedAddress(contact: BillingContactDto): string {
  return contact.address?.trim() || '—';
}

function tuitionInvoiceLines(
  charge: TuitionChargeInvoiceDto,
  levelName: string,
  annualPackage: boolean,
): ParentInvoiceLine[] {
  const stored = charge.lines ?? [];
  if (stored.length) {
    return stored.map((l) => ({
      description: l.label,
      qty: String(l.quantity ?? 1),
      unitPrice: formatXofFromCents(l.unitAmountCents ?? l.amountCents),
      amount: formatXofFromCents(l.amountCents),
    }));
  }
  return [
    {
      description: annualPackage
        ? `Scolarité + mensualités — ${levelName}`
        : `Frais de scolarité — ${levelName}`,
      qty: '1',
      unitPrice: formatXofFromCents(charge.amountCents),
      amount: formatXofFromCents(charge.amountCents),
    },
  ];
}

function parentContactLine(contact: BillingContactDto): string {
  const parts = [contact.email?.trim(), contact.phone?.trim()].filter(Boolean);
  return parts.join(' · ') || '—';
}

function issueDateFr(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function defaultContact(): BillingContactDto {
  return {
    fullName: null,
    email: '—',
    phone: null,
    address: null,
    parentRelation: null,
  };
}

function triggerBlobDownload(filename: string, blob: Blob): void {
  const name = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

let logoDataUriPromise: Promise<string | null> | null = null;

async function getLogoDataUri(): Promise<string | null> {
  if (!logoDataUriPromise) {
    logoDataUriPromise = (async () => {
      try {
        const r = await fetch(logoSrc as string);
        const buf = new Uint8Array(await r.arrayBuffer());
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < buf.length; i += chunk) {
          binary += String.fromCharCode.apply(null, buf.subarray(i, i + chunk) as unknown as number[]);
        }
        return `data:image/png;base64,${btoa(binary)}`;
      } catch {
        return null;
      }
    })();
  }
  return logoDataUriPromise;
}

export function useParentSchoolInvoice() {
  const config = useRuntimeConfig();
  const { authFetchBlob } = useParentAuth();

  function branding() {
    const c = resolveSchoolContact(config.public);
    return {
      schoolDisplayName: c.displayName,
      contactEmail: c.contactEmail,
      emergencyPhone: c.emergencyPhone,
      administrationEmail: c.administrationEmail,
      paymentModesLine: c.paymentModes,
    };
  }

  async function buildInvoiceDocument(
    source: ParentInvoiceSource,
    contact: BillingContactDto | null,
  ): Promise<ParentInvoiceDocument> {
    const b = branding();
    const c = contact ?? defaultContact();
    const logoDataUri = await getLogoDataUri();

    if (source.kind === 'tuition') {
      const charge = source.charge;
      const levelName = charge.enrollment.level?.name?.trim() || '—';
      const annualPackage =
        source.annualPackage === true ||
        (charge.lines ?? []).some((l) => l.kind === 'MONTHLY_BASE' || l.kind === 'SERVICE');
      const y = Number(charge.schoolYear.trim().match(/^(\d{4})/)?.[1] ?? new Date().getFullYear());
      const inv = stableInvoiceNumber(y, charge.id);
      const documentTitle = annualPackage ? 'Facture annuelle' : 'Facture de scolarité';
      const lines = tuitionInvoiceLines(charge, levelName, annualPackage);
      const html = buildParentInvoiceHtml({
        documentTitle,
        schoolDisplayName: b.schoolDisplayName,
        headerSubline: `${b.contactEmail} · Année scolaire ${charge.schoolYear}`,
        contactEmail: b.contactEmail,
        administrationEmail: b.administrationEmail,
        emergencyPhone: b.emergencyPhone,
        paymentModesLine: b.paymentModesLine,
        logoDataUri,
        invoiceNumber: inv,
        issueDateFr: issueDateFr(charge.createdAt),
        dueDateFr: tuitionAnnualDueDateFr(charge.schoolYear),
        schoolYearLine: `${charge.schoolYear} · Année complète`,
        studentNameWithLevel: `${childName(charge.enrollment.child)} — ${levelName}`,
        matriculeLine: `Matricule : ${matriculeFromEnrollmentId(charge.enrollment.id)}`,
        billedToTitle: billedToTitle(c),
        billedAddress: billedAddress(c),
        lines,
        totalAmount: formatXofFromCents(charge.amountCents),
        parentContactLine: parentContactLine(c),
        generatedDateFr: issueDateFr(),
      });
      return {
        title: `${documentTitle} — ${inv}`,
        filenameBase: `${annualPackage ? 'Facture-annuelle' : 'Facture-scolarite'}-${inv}`,
        html,
      };
    }

    if (source.kind === 'monthly') {
      const inst = source.installment;
      const levelName = inst.enrollment.level?.name?.trim() || '—';
      const inv = stableInvoiceNumber(inst.year, inst.id);
      const lines: ParentInvoiceLine[] = (inst.lines ?? []).map((l) => ({
        description: l.label,
        qty: '1',
        unitPrice: formatXofFromCents(l.amountCents),
        amount: formatXofFromCents(l.amountCents),
      }));
      if (!lines.length) {
        lines.push({
          description: `Mensualité — ${levelName}`,
          qty: '1',
          unitPrice: formatXofFromCents(inst.totalAmountCents),
          amount: formatXofFromCents(inst.totalAmountCents),
        });
      }
      const trim = schoolTrimesterFromMonth(inst.month);
      const html = buildParentInvoiceHtml({
        documentTitle: 'Facture de mensualité',
        schoolDisplayName: b.schoolDisplayName,
        headerSubline: `${b.contactEmail} · Année scolaire ${inst.enrollment.schoolYear}`,
        contactEmail: b.contactEmail,
        administrationEmail: b.administrationEmail,
        emergencyPhone: b.emergencyPhone,
        paymentModesLine: b.paymentModesLine,
        logoDataUri,
        invoiceNumber: inv,
        issueDateFr: issueDateFr(inst.createdAt),
        dueDateFr: monthEndDateFr(inst.year, inst.month),
        schoolYearLine: `${inst.enrollment.schoolYear} · Trimestre ${trim}`,
        studentNameWithLevel: `${childName(inst.enrollment.child)} — ${levelName}`,
        matriculeLine: `Matricule : ${matriculeFromEnrollmentId(inst.enrollment.id)}`,
        billedToTitle: billedToTitle(c),
        billedAddress: billedAddress(c),
        lines,
        totalAmount: formatXofFromCents(inst.totalAmountCents),
        parentContactLine: parentContactLine(c),
        generatedDateFr: issueDateFr(),
      });
      return {
        title: `Facture de mensualité — ${inv}`,
        filenameBase: `Facture-mensualite-${inv}`,
        html,
      };
    }

    const pay = source.payment;
    const levelName = pay.enrollment.level?.name?.trim() || '—';
    const cents = Number.isFinite(pay.amountCents) && pay.amountCents! > 0 ? pay.amountCents! : 0;
    const inv = stableInvoiceNumber(pay.year, pay.id);
    const lines: ParentInvoiceLine[] = [
      {
        description: `Ancienne facture mensuelle — ${levelName}`,
        qty: '1',
        unitPrice: formatXofFromCents(cents),
        amount: formatXofFromCents(cents),
      },
    ];
    const html = buildParentInvoiceHtml({
      documentTitle: 'Facture',
      schoolDisplayName: b.schoolDisplayName,
      headerSubline: `${b.contactEmail} · Année scolaire ${pay.enrollment.schoolYear}`,
      contactEmail: b.contactEmail,
      administrationEmail: b.administrationEmail,
      emergencyPhone: b.emergencyPhone,
      paymentModesLine: b.paymentModesLine,
      logoDataUri,
      invoiceNumber: inv,
      issueDateFr: issueDateFr(pay.createdAt),
      dueDateFr: monthEndDateFr(pay.year, pay.month),
      schoolYearLine: `${pay.enrollment.schoolYear} · Trimestre ${schoolTrimesterFromMonth(pay.month)}`,
      studentNameWithLevel: `${childName(pay.enrollment.child)} — ${levelName}`,
      matriculeLine: `Matricule : ${matriculeFromEnrollmentId(pay.enrollment.id)}`,
      billedToTitle: billedToTitle(c),
      billedAddress: billedAddress(c),
      lines,
      totalAmount: formatXofFromCents(cents),
      parentContactLine: parentContactLine(c),
      generatedDateFr: issueDateFr(),
    });
    return {
      title: `Facture — ${inv}`,
      filenameBase: `Facture-${inv}`,
      html,
    };
  }

  async function buildReceiptDocument(
    source: ParentInvoiceSource,
    contact: BillingContactDto | null,
  ): Promise<ParentReceiptDocument> {
    if (!isPaidParentInvoiceSource(source)) {
      throw new Error('Reçu disponible uniquement pour une ligne payée.');
    }
    const b = branding();
    const c = contact ?? defaultContact();
    const logoDataUri = await getLogoDataUri();

    if (source.kind === 'tuition') {
      const charge = source.charge;
      const levelName = charge.enrollment.level?.name?.trim() || '—';
      const annualPackage =
        source.annualPackage === true ||
        (charge.lines ?? []).some((l) => l.kind === 'MONTHLY_BASE' || l.kind === 'SERVICE');
      const y = Number(charge.schoolYear.trim().match(/^(\d{4})/)?.[1] ?? new Date().getFullYear());
      const inv = stableInvoiceNumber(y, charge.id);
      const rec = stableReceiptNumber(y, charge.id);
      const payIso = charge.paidAt ?? charge.createdAt;
      const lines: ParentReceiptLine[] = tuitionInvoiceLines(charge, levelName, annualPackage).map((l) => ({
        description: l.qty !== '1' ? `${l.description} × ${l.qty}` : l.description,
        amount: l.amount,
      }));
      const html = buildParentReceiptHtml({
        schoolDisplayName: b.schoolDisplayName,
        headerSubline: `${b.contactEmail} · Année scolaire ${charge.schoolYear}`,
        logoDataUri,
        receiptNumber: rec,
        studentNameWithLevel: `${childName(charge.enrollment.child)} — ${levelName}`,
        matriculeLine: `Matricule : ${matriculeFromEnrollmentId(charge.enrollment.id)}`,
        enrollmentDateFr: issueDateFr(charge.enrollment.createdAt),
        billedToTitle: billedToTitle(c),
        billedAddress: billedAddress(c),
        paymentDateFr: issueDateFr(payIso),
        paymentModeLine: formatPaymentModeFromTransactionRef(charge.transactionRef),
        amountHighlight: formatXofFromCents(charge.amountCents),
        settlementLine: `Montant reçu en règlement de la facture ${inv}`,
        lines,
        totalPaid: formatXofFromCents(charge.amountCents),
        administrationEmail: b.administrationEmail,
        emergencyPhone: b.emergencyPhone,
        generatedDateFr: issueDateFr(),
        medicalTags: parseMedicalTags(charge.enrollment.child.allergies),
      });
      return {
        title: `Reçu de paiement — ${rec}`,
        filenameBase: `Recu-paiement-${rec}`,
        html,
      };
    }

    if (source.kind === 'monthly') {
      const inst = source.installment;
      const levelName = inst.enrollment.level?.name?.trim() || '—';
      const inv = stableInvoiceNumber(inst.year, inst.id);
      const rec = stableReceiptNumber(inst.year, inst.id);
      const lines: ParentReceiptLine[] = (inst.lines ?? []).map((l) => ({
        description: l.label,
        amount: formatXofFromCents(l.amountCents),
      }));
      if (!lines.length) {
        lines.push({
          description: `Mensualité — ${levelName}`,
          amount: formatXofFromCents(inst.totalAmountCents),
        });
      }
      const payIso = inst.paidAt ?? inst.createdAt;
      const html = buildParentReceiptHtml({
        schoolDisplayName: b.schoolDisplayName,
        headerSubline: `${b.contactEmail} · Année scolaire ${inst.enrollment.schoolYear}`,
        logoDataUri,
        receiptNumber: rec,
        studentNameWithLevel: `${childName(inst.enrollment.child)} — ${levelName}`,
        matriculeLine: `Matricule : ${matriculeFromEnrollmentId(inst.enrollment.id)}`,
        enrollmentDateFr: issueDateFr(inst.enrollment.createdAt),
        billedToTitle: billedToTitle(c),
        billedAddress: billedAddress(c),
        paymentDateFr: issueDateFr(payIso),
        paymentModeLine: formatPaymentModeFromTransactionRef(inst.transactionRef),
        amountHighlight: formatXofFromCents(inst.totalAmountCents),
        settlementLine: `Montant reçu en règlement de la facture ${inv}`,
        lines,
        totalPaid: formatXofFromCents(inst.totalAmountCents),
        administrationEmail: b.administrationEmail,
        emergencyPhone: b.emergencyPhone,
        generatedDateFr: issueDateFr(),
        medicalTags: parseMedicalTags(inst.enrollment.child.allergies),
      });
      return {
        title: `Reçu de paiement — ${rec}`,
        filenameBase: `Recu-paiement-${rec}`,
        html,
      };
    }

    const pay = source.payment;
    const levelName = pay.enrollment.level?.name?.trim() || '—';
    const cents = Number.isFinite(pay.amountCents) && pay.amountCents! > 0 ? pay.amountCents! : 0;
    const inv = stableInvoiceNumber(pay.year, pay.id);
    const rec = stableReceiptNumber(pay.year, pay.id);
    const lines: ParentReceiptLine[] = [
      { description: `Ancienne facture mensuelle — ${levelName}`, amount: formatXofFromCents(cents) },
    ];
    const payIso = pay.paidAt ?? pay.createdAt;
    const html = buildParentReceiptHtml({
      schoolDisplayName: b.schoolDisplayName,
      headerSubline: `${b.contactEmail} · Année scolaire ${pay.enrollment.schoolYear}`,
      logoDataUri,
      receiptNumber: rec,
      studentNameWithLevel: `${childName(pay.enrollment.child)} — ${levelName}`,
      matriculeLine: `Matricule : ${matriculeFromEnrollmentId(pay.enrollment.id)}`,
      enrollmentDateFr: issueDateFr(pay.enrollment.createdAt),
      billedToTitle: billedToTitle(c),
      billedAddress: billedAddress(c),
      paymentDateFr: issueDateFr(payIso),
      paymentModeLine: formatPaymentModeFromTransactionRef(pay.transactionRef),
      amountHighlight: formatXofFromCents(cents),
      settlementLine: `Montant reçu en règlement de la facture ${inv}`,
      lines,
      totalPaid: formatXofFromCents(cents),
      administrationEmail: b.administrationEmail,
      emergencyPhone: b.emergencyPhone,
      generatedDateFr: issueDateFr(),
      medicalTags: parseMedicalTags(pay.enrollment.child.allergies),
    });
    return {
      title: `Reçu de paiement — ${rec}`,
      filenameBase: `Recu-paiement-${rec}`,
      html,
    };
  }

  async function downloadTuitionInvoice(charge: TuitionChargeInvoiceDto, _contact: BillingContactDto | null) {
    const y = Number(charge.schoolYear.trim().match(/^(\d{4})/)?.[1] ?? new Date().getFullYear());
    const inv = stableInvoiceNumber(y, charge.id);
    const fallback = `Facture-scolarite-${inv}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/invoices/tuition/${charge.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadMonthlyInvoice(inst: MonthlyInstallmentInvoiceDto, _contact: BillingContactDto | null) {
    const inv = stableInvoiceNumber(inst.year, inst.id);
    const fallback = `Facture-mensualite-${inv}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/invoices/monthly/${inst.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadLegacyInvoice(pay: LegacyPaymentInvoiceDto, _contact: BillingContactDto | null) {
    const inv = stableInvoiceNumber(pay.year, pay.id);
    const fallback = `Facture-${inv}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/invoices/legacy/${pay.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadTuitionReceipt(charge: TuitionChargeInvoiceDto, _contact: BillingContactDto | null) {
    const y = Number(charge.schoolYear.trim().match(/^(\d{4})/)?.[1] ?? new Date().getFullYear());
    const rec = stableReceiptNumber(y, charge.id);
    const fallback = `Recu-paiement-${rec}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/receipts/tuition/${charge.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadMonthlyReceipt(inst: MonthlyInstallmentInvoiceDto, _contact: BillingContactDto | null) {
    const rec = stableReceiptNumber(inst.year, inst.id);
    const fallback = `Recu-paiement-${rec}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/receipts/monthly/${inst.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadLegacyReceipt(pay: LegacyPaymentInvoiceDto, _contact: BillingContactDto | null) {
    const rec = stableReceiptNumber(pay.year, pay.id);
    const fallback = `Recu-paiement-${rec}.pdf`;
    const { blob, filename } = await authFetchBlob(`/parent/receipts/legacy/${pay.id}/pdf`);
    triggerBlobDownload(filename ?? fallback, blob);
  }

  async function downloadInvoiceFromSource(source: ParentInvoiceSource, contact: BillingContactDto | null) {
    if (source.kind === 'tuition') {
      await downloadTuitionInvoice(source.charge, contact);
    } else if (source.kind === 'monthly') {
      await downloadMonthlyInvoice(source.installment, contact);
    } else {
      await downloadLegacyInvoice(source.payment, contact);
    }
  }

  async function downloadReceiptFromSource(source: ParentInvoiceSource, contact: BillingContactDto | null) {
    if (source.kind === 'tuition') {
      await downloadTuitionReceipt(source.charge, contact);
    } else if (source.kind === 'monthly') {
      await downloadMonthlyReceipt(source.installment, contact);
    } else {
      await downloadLegacyReceipt(source.payment, contact);
    }
  }

  return {
    buildInvoiceDocument,
    buildReceiptDocument,
    isPaidParentInvoiceSource,
    downloadTuitionInvoice,
    downloadMonthlyInvoice,
    downloadLegacyInvoice,
    downloadTuitionReceipt,
    downloadMonthlyReceipt,
    downloadLegacyReceipt,
    downloadInvoiceFromSource,
    downloadReceiptFromSource,
  };
}
