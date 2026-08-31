import type { EnrollmentHealthDraft } from '~/composables/useEnrollmentWizard';
import type { HealthRecord } from '~/components/parent/child-space/types';
import {
  ENROLLMENT_BLOOD_GROUPS,
  ensureHealthVaccinations,
  type EnrollmentBloodGroup,
} from '~/utils/enrollment-health';

function normalizeBloodGroup(value: string | null | undefined): EnrollmentBloodGroup | '' {
  const raw = String(value ?? '').trim().toUpperCase();
  if (!raw) return '';
  if (raw === 'INCONNU' || raw === 'UNKNOWN') return 'UNKNOWN';
  const match = ENROLLMENT_BLOOD_GROUPS.find((g) => g === raw);
  return match ?? '';
}

function vaccinationMatchKey(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes('bcg')) return 'bcg';
  if (n.includes('dtp')) return 'dtp1';
  if (n.includes('ror')) return 'ror';
  return n;
}

export function healthRecordToEnrollmentDraft(record: HealthRecord | null): EnrollmentHealthDraft {
  const vaccinations = ensureHealthVaccinations([]);
  if (record?.vaccinations?.length) {
    const byKey = new Map(
      record.vaccinations.map((v) => [vaccinationMatchKey(v.name), v]),
    );
    for (const row of vaccinations) {
      const match = byKey.get(row.id);
      if (match?.vaccinatedAt) {
        row.administeredAt = match.vaccinatedAt.slice(0, 10);
      } else if (match?.status === 'DONE' && match.dateLabel) {
        row.administeredAt = '';
      }
    }
  }

  return {
    doctorName: record?.doctorName?.trim() ?? '',
    doctorPhone: record?.doctorPhone?.trim() ?? '',
    bloodGroup: normalizeBloodGroup(record?.bloodGroup),
    knownAllergies: record?.knownAllergies?.trim() ?? '',
    ongoingTreatments: record?.ongoingTreatments?.trim() ?? '',
    dietaryRegime: record?.dietaryRegime?.trim() ?? '',
    instructions: record?.instructions?.trim() ?? '',
    vaccinations,
  };
}
