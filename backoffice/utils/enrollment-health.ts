export const ENROLLMENT_BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'UNKNOWN',
] as const;

export type EnrollmentBloodGroup = (typeof ENROLLMENT_BLOOD_GROUPS)[number];

export type EnrollmentVaccinationDraft = {
  id: string;
  label: string;
  administeredAt: string;
};

export const DEFAULT_ENROLLMENT_VACCINATIONS: EnrollmentVaccinationDraft[] = [
  { id: 'bcg', label: 'BCG', administeredAt: '' },
  { id: 'dtp1', label: 'DTP (1)', administeredAt: '' },
  { id: 'ror', label: 'ROR', administeredAt: '' },
];

export function bloodGroupLabel(value: string): string {
  if (value === 'UNKNOWN') return 'Inconnu';
  return value;
}

export function vaccinationStatus(administeredAt: string): 'up-to-date' | 'missing' {
  return administeredAt.trim() ? 'up-to-date' : 'missing';
}

export function formatHealthDateFr(iso: string): string {
  if (!iso.trim()) return 'À programmer';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}

export function ensureHealthVaccinations(
  vaccinations: EnrollmentVaccinationDraft[] | undefined,
): EnrollmentVaccinationDraft[] {
  if (!vaccinations?.length) {
    return DEFAULT_ENROLLMENT_VACCINATIONS.map((v) => ({ ...v }));
  }
  const known = new Map(vaccinations.map((v) => [v.id, v]));
  return DEFAULT_ENROLLMENT_VACCINATIONS.map((def) => {
    const existing = known.get(def.id);
    return existing
      ? { id: def.id, label: def.label, administeredAt: existing.administeredAt ?? '' }
      : { ...def };
  });
}

export function healthToApiPayload(health: {
  doctorName: string;
  doctorPhone: string;
  bloodGroup: string;
  knownAllergies: string;
  ongoingTreatments: string;
  dietaryRegime: string;
  instructions: string;
  vaccinations: EnrollmentVaccinationDraft[];
}) {
  return {
    doctorName: health.doctorName,
    doctorPhone: health.doctorPhone,
    bloodGroup: health.bloodGroup,
    knownAllergies: health.knownAllergies,
    ongoingTreatments: health.ongoingTreatments,
    dietaryRegime: health.dietaryRegime,
    instructions: health.instructions,
    vaccinations: health.vaccinations.map((v) => ({
      name: v.label,
      status: v.administeredAt.trim() ? 'DONE' : 'MISSING',
      vaccinatedAt: v.administeredAt.trim() || undefined,
    })),
  };
}
