import {
  authorizationLabel,
  formatServiceSelectionLabel,
  type EnrollmentAuthorizationKey,
  type EnrollmentServiceSelection,
} from '~/utils/enrollment-options';
import {
  syncEmergencyFromSource,
} from '~/utils/enrollment-family';
import {
  bloodGroupLabel,
  ensureHealthVaccinations,
  formatHealthDateFr,
  healthToApiPayload,
  type EnrollmentBloodGroup,
  type EnrollmentVaccinationDraft,
} from '~/utils/enrollment-health';

export type EnrollmentRecapRow = { label: string; value: string; full?: boolean };

export type EnrollmentGender = 'Fille' | 'Garçon';

export type EnrollmentChildDraft = {
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  gender: EnrollmentGender;
  homeLanguages: string;
  matricule: string;
  levelId: string;
  levelName: string;
  levelEmoji: string;
  levelSubtitle: string;
  childAddress: string;
  previousSchool: string;
};

export type EnrollmentParentDraft = {
  fullName: string;
  firstName: string;
  lastName: string;
  relation: '' | 'FATHER' | 'MOTHER';
  phone: string;
  email: string;
  profession: string;
  address: string;
};

export type EnrollmentGuardian2Draft = {
  fullName: string;
  relation: string;
  phone: string;
  email: string;
};

export type EnrollmentEmergencyDraft = {
  /** Reprend les coordonnées d'un responsable déjà saisi, ou saisie libre. */
  source: '' | 'GUARDIAN1' | 'GUARDIAN2' | 'OTHER';
  fullName: string;
  relation: string;
  phone: string;
};

export type EnrollmentHealthDraft = {
  doctorName: string;
  doctorPhone: string;
  bloodGroup: EnrollmentBloodGroup | '';
  knownAllergies: string;
  ongoingTreatments: string;
  dietaryRegime: string;
  instructions: string;
  vaccinations: EnrollmentVaccinationDraft[];
};

export type EnrollmentOptionsDraft = {
  scheduleId: string;
  scheduleLabel: string;
  authorizations: Record<EnrollmentAuthorizationKey, boolean>;
  serviceSelections: EnrollmentServiceSelection[];
  comment: string;
  requiresSchedule?: boolean;
};

export type EnrollmentEngagementDraft = {
  certified: boolean;
  signedPlace: string;
  signedAt: string;
  signatureMode: 'handwritten' | 'upload' | '';
  signatureDataUrl: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultEngagement(): EnrollmentEngagementDraft {
  return {
    certified: false,
    signedPlace: 'Abidjan',
    signedAt: todayIsoDate(),
    signatureMode: '',
    signatureDataUrl: '',
  };
}

export const ENROLLMENT_STEPS = [
  { id: 1, label: 'Enfant' },
  { id: 2, label: 'Famille' },
  { id: 3, label: 'Santé' },
  { id: 4, label: 'Options' },
  { id: 5, label: 'Validation' },
] as const;

export type EnrollmentStepId = (typeof ENROLLMENT_STEPS)[number]['id'];

function generateMatricule(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return `MD${suffix}`;
}

export function formatSchoolYearLabel(schoolYear: string): string {
  const [start, end] = schoolYear.split('-');
  if (start && end) return `${start}–${end}`;
  return schoolYear;
}

/** Fallback calendaire si l’API année ouverte est indisponible. */
export function currentSchoolYear(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  // Année scolaire : septembre (8) → août de l’année suivante
  if (m >= 8) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

async function fetchActiveSchoolYearLabel(apiBase: string): Promise<string | null> {
  try {
    const res = await $fetch<{ active: { label: string } | null }>(
      `${apiBase}/public/catalog/school-year/active`,
    );
    const label = res.active?.label?.trim();
    return label || null;
  } catch {
    return null;
  }
}

function formatDateFr(iso: string): string {
  if (!iso.trim()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR');
}

const ENROLLMENT_DRAFT_KEY = 'cw-enrollment-draft';

type EnrollmentDraftSnapshot = {
  version: 2;
  step: EnrollmentStepId;
  schoolYear: string;
  child: EnrollmentChildDraft;
  parent: EnrollmentParentDraft;
  guardian2: EnrollmentGuardian2Draft;
  emergency: EnrollmentEmergencyDraft;
  health: EnrollmentHealthDraft;
  options: EnrollmentOptionsDraft;
  engagement?: EnrollmentEngagementDraft;
  childId?: string;
  enrollmentId?: string;
  resumeToken?: string;
  enrollmentFromParentAccount?: boolean;
};

/** Ancien format brouillon (v1). */
type EnrollmentDraftSnapshotV1 = Omit<
  EnrollmentDraftSnapshot,
  'version' | 'guardian2' | 'emergency'
> & {
  version: 1;
  childSaved?: boolean;
};

type EnrollmentResumePayload = {
  step: number;
  schoolYear: string;
  childId: string;
  enrollmentId: string;
  resumeToken?: string | null;
  child: EnrollmentChildDraft;
  parent: EnrollmentParentDraft;
  guardian2: EnrollmentGuardian2Draft;
  emergency: EnrollmentEmergencyDraft;
  health?: Partial<EnrollmentHealthDraft> & { vaccinations?: EnrollmentVaccinationDraft[] };
  options?: EnrollmentOptionsDraft;
  scheduleId?: string;
};

function normalizeOptionsDraft(raw?: Partial<EnrollmentOptionsDraft> | null): EnrollmentOptionsDraft {
  return {
    scheduleId: raw?.scheduleId ?? '',
    scheduleLabel: raw?.scheduleLabel ?? '',
    authorizations: {
      photosInternal: raw?.authorizations?.photosInternal ?? true,
      photosCommunication: raw?.authorizations?.photosCommunication ?? false,
      outings: raw?.authorizations?.outings ?? true,
      firstAid: raw?.authorizations?.firstAid ?? true,
    },
    serviceSelections: (raw?.serviceSelections ?? []).map((s) => ({ ...s })),
    comment: raw?.comment ?? '',
    requiresSchedule: raw?.requiresSchedule ?? false,
  };
}

function enrollmentParentBody(parent: EnrollmentParentDraft) {
  syncParentNamesFromFullName(parent);
  return {
    email: parent.email.trim().toLowerCase(),
    phone: parent.phone.trim(),
    firstName: parent.firstName.trim(),
    lastName: parent.lastName.trim(),
    fullName: parent.fullName.trim(),
    relation: parent.relation,
    address: parent.address.trim(),
    profession: parent.profession.trim(),
  };
}

function enrollmentChildBody(child: EnrollmentChildDraft) {
  return {
    firstName: child.firstName.trim(),
    lastName: child.lastName.trim(),
    birthDate: child.birthDate.trim() || undefined,
    birthPlace: child.birthPlace.trim(),
    nationality: child.nationality.trim(),
    gender: child.gender,
    homeLanguages: child.homeLanguages.trim(),
    matricule: child.matricule.trim(),
    levelId: child.levelId,
    levelName: child.levelName.trim(),
    childAddress: child.childAddress.trim(),
    previousSchool: child.previousSchool.trim(),
  };
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

function syncParentNamesFromFullName(parent: EnrollmentParentDraft) {
  const { firstName, lastName } = splitFullName(parent.fullName);
  parent.firstName = firstName;
  parent.lastName = lastName;
}

function trimFamilyFields(
  parent: EnrollmentParentDraft,
  guardian2: EnrollmentGuardian2Draft,
  emergency: EnrollmentEmergencyDraft,
) {
  parent.fullName = parent.fullName.trim();
  parent.phone = parent.phone.trim();
  parent.email = parent.email.trim();
  parent.profession = parent.profession.trim();
  parent.address = parent.address.trim();
  guardian2.fullName = guardian2.fullName.trim();
  guardian2.relation = guardian2.relation.trim();
  guardian2.phone = guardian2.phone.trim();
  guardian2.email = guardian2.email.trim();
  syncEmergencyFromSource(emergency, parent, guardian2);
  emergency.fullName = emergency.fullName.trim();
  emergency.relation = emergency.relation.trim();
  emergency.phone = emergency.phone.trim();
  syncParentNamesFromFullName(parent);
}

function normalizeDraft(raw: EnrollmentDraftSnapshot | EnrollmentDraftSnapshotV1): EnrollmentDraftSnapshot | null {
  if (raw.version === 2) {
    return {
      ...raw,
      health: {
        ...raw.health,
        vaccinations: ensureHealthVaccinations(raw.health.vaccinations),
      },
    };
  }
  if (raw.version !== 1) return null;
  const fullName =
    `${(raw.parent as EnrollmentParentDraft).firstName ?? ''} ${(raw.parent as EnrollmentParentDraft).lastName ?? ''}`.trim() ||
    (raw.parent as EnrollmentParentDraft).fullName ||
    '';
  return {
    version: 2,
    step: raw.step,
    schoolYear: raw.schoolYear,
    child: raw.child,
    parent: {
      fullName,
      firstName: raw.parent.firstName,
      lastName: raw.parent.lastName,
      relation: raw.parent.relation,
      phone: raw.parent.phone,
      email: raw.parent.email,
      profession: (raw.parent as EnrollmentParentDraft).profession ?? '',
      address: raw.parent.address,
    },
    guardian2: { fullName: '', relation: '', phone: '', email: '' },
    emergency: { source: '', fullName: '', relation: '', phone: '' },
    health: {
      ...raw.health,
      vaccinations: ensureHealthVaccinations(raw.health.vaccinations),
    },
    options: raw.options ? normalizeOptionsDraft(raw.options) : normalizeOptionsDraft(),
    engagement: defaultEngagement(),
  };
}

function persistEnrollmentDraft(snapshot: EnrollmentDraftSnapshot) {
  if (!import.meta.client) return;
  try {
    localStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify(snapshot));
  } catch {
    // quota / navigation privée
  }
}

function loadEnrollmentDraft(): EnrollmentDraftSnapshot | null {
  if (!import.meta.client) return null;
  try {
    const raw = localStorage.getItem(ENROLLMENT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EnrollmentDraftSnapshot | EnrollmentDraftSnapshotV1;
    return normalizeDraft(parsed);
  } catch {
    return null;
  }
}

function clearEnrollmentDraft() {
  if (!import.meta.client) return;
  localStorage.removeItem(ENROLLMENT_DRAFT_KEY);
}

export function useEnrollmentWizard() {
  const config = useRuntimeConfig();
  const route = useRoute();
  const parentAuth = useParentAuth();
  const step = ref<EnrollmentStepId>(1);
  const submitted = ref(false);
  const submitting = ref(false);
  const submitError = ref('');
  const childId = ref('');
  const enrollmentId = ref('');
  const resumeToken = ref('');
  const enrollmentFromParentAccount = ref(false);

  const activeSchoolYearLabel = ref(currentSchoolYear());
  const { data: activeYearFromApi } = useAsyncData(
    'enrollment-active-school-year',
    () => fetchActiveSchoolYearLabel(String(config.public.apiBase)),
  );
  watch(
    activeYearFromApi,
    (label) => {
      if (label?.trim()) activeSchoolYearLabel.value = label.trim();
    },
    { immediate: true },
  );

  const child = reactive<EnrollmentChildDraft>({
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    nationality: '',
    gender: 'Fille',
    homeLanguages: '',
    matricule: generateMatricule(),
    levelId: '',
    levelName: '',
    levelEmoji: '',
    levelSubtitle: '',
    childAddress: '',
    previousSchool: '',
  });

  const parent = reactive<EnrollmentParentDraft>({
    fullName: '',
    lastName: '',
    firstName: '',
    relation: '',
    phone: '',
    email: '',
    profession: '',
    address: '',
  });

  const guardian2 = reactive<EnrollmentGuardian2Draft>({
    fullName: '',
    relation: '',
    phone: '',
    email: '',
  });

  const emergency = reactive<EnrollmentEmergencyDraft>({
    source: '',
    fullName: '',
    relation: '',
    phone: '',
  });

  const health = reactive<EnrollmentHealthDraft>({
    doctorName: '',
    doctorPhone: '',
    bloodGroup: '',
    knownAllergies: '',
    ongoingTreatments: '',
    dietaryRegime: '',
    instructions: '',
    vaccinations: ensureHealthVaccinations([]),
  });

  const options = reactive<EnrollmentOptionsDraft>(normalizeOptionsDraft());
  const engagement = reactive<EnrollmentEngagementDraft>(defaultEngagement());

  function optionsApiPayload() {
    return {
      scheduleId: options.scheduleId || undefined,
      scheduleLabel: options.scheduleLabel || undefined,
      authorizations: { ...options.authorizations },
      serviceSelections: options.serviceSelections.map((s) => ({ ...s })),
      comment: options.comment.trim() || undefined,
    };
  }

  function snapshotDraft(): EnrollmentDraftSnapshot {
    return {
      version: 2,
      step: step.value,
      schoolYear: activeSchoolYearLabel.value,
      child: { ...child },
      parent: { ...parent },
      guardian2: { ...guardian2 },
      emergency: { ...emergency },
      health: {
        ...health,
        vaccinations: health.vaccinations.map((v) => ({ ...v })),
      },
      options: normalizeOptionsDraft({
        ...options,
        authorizations: { ...options.authorizations },
        serviceSelections: options.serviceSelections.map((s) => ({ ...s })),
      }),
      engagement: { ...engagement },
      childId: childId.value || undefined,
      enrollmentId: enrollmentId.value || undefined,
      resumeToken: resumeToken.value || undefined,
      enrollmentFromParentAccount: enrollmentFromParentAccount.value || undefined,
    };
  }

  function resetWizardForNewChild() {
    submitted.value = false;
    submitError.value = '';
    step.value = 1;
    childId.value = '';
    enrollmentId.value = '';
    resumeToken.value = '';
    Object.assign(child, {
      firstName: '',
      lastName: '',
      birthDate: '',
      birthPlace: '',
      nationality: '',
      gender: 'Fille' as EnrollmentGender,
      homeLanguages: '',
      matricule: generateMatricule(),
      levelId: '',
      levelName: '',
      levelEmoji: '',
      levelSubtitle: '',
      childAddress: '',
      previousSchool: '',
    });
    Object.assign(guardian2, { fullName: '', relation: '', phone: '', email: '' });
    Object.assign(emergency, { source: '', fullName: '', relation: '', phone: '' });
    Object.assign(health, {
      doctorName: '',
      doctorPhone: '',
      bloodGroup: '' as const,
      knownAllergies: '',
      ongoingTreatments: '',
      dietaryRegime: '',
      instructions: '',
      vaccinations: ensureHealthVaccinations([]),
    });
    Object.assign(options, normalizeOptionsDraft());
    Object.assign(engagement, defaultEngagement());
  }

  async function applyLoggedInParentProfile() {
    const { authFetch, isLoggedIn } = parentAuth;
    if (!isLoggedIn.value) return false;

    try {
      const me = await authFetch<{
        email: string;
        fullName: string | null;
        phone: string | null;
        address: string | null;
        parentRelation?: 'FATHER' | 'MOTHER' | null;
      }>('/parent/me');

      parent.fullName = me.fullName?.trim() || parent.fullName;
      parent.email = me.email?.trim() || parent.email;
      parent.phone = me.phone?.trim() || parent.phone;
      parent.address = me.address?.trim() || parent.address;
      if (me.parentRelation === 'FATHER' || me.parentRelation === 'MOTHER') {
        parent.relation = me.parentRelation;
      }
      syncParentNamesFromFullName(parent);
      enrollmentFromParentAccount.value = true;
      saveDraft();
      return true;
    } catch {
      return false;
    }
  }

  async function applyExistingChildForReenrollment(id: string): Promise<string | null> {
    const { authFetch } = parentAuth;
    try {
      const data = await authFetch<{
        childId: string;
        child: EnrollmentChildDraft;
        parent: EnrollmentParentDraft;
        guardian2: EnrollmentGuardian2Draft;
        emergency: EnrollmentEmergencyDraft;
        health: EnrollmentHealthDraft;
        options?: EnrollmentOptionsDraft;
      }>(`/parent/children/${id}/reenrollment-prefill`);

      childId.value = data.childId;
      enrollmentId.value = '';
      resumeToken.value = '';
      Object.assign(child, {
        firstName: data.child.firstName ?? '',
        lastName: data.child.lastName ?? '',
        birthDate: String(data.child.birthDate ?? '').slice(0, 10),
        birthPlace: data.child.birthPlace ?? '',
        nationality: data.child.nationality ?? '',
        gender: data.child.gender === 'Garçon' ? 'Garçon' : 'Fille',
        homeLanguages: data.child.homeLanguages ?? '',
        matricule: data.child.matricule || child.matricule,
        levelId: data.child.levelId ?? '',
        levelName: data.child.levelName ?? '',
        levelEmoji: data.child.levelEmoji ?? '',
        levelSubtitle: data.child.levelSubtitle ?? '',
        childAddress: data.child.childAddress ?? '',
        previousSchool: data.child.previousSchool ?? '',
      });
      Object.assign(parent, {
        fullName: data.parent.fullName ?? parent.fullName,
        firstName: data.parent.firstName ?? parent.firstName,
        lastName: data.parent.lastName ?? parent.lastName,
        relation: data.parent.relation === 'FATHER' || data.parent.relation === 'MOTHER'
          ? data.parent.relation
          : parent.relation,
        phone: data.parent.phone || parent.phone,
        email: data.parent.email || parent.email,
        profession: data.parent.profession ?? '',
        address: data.parent.address || parent.address,
      });
      syncParentNamesFromFullName(parent);
      Object.assign(guardian2, {
        fullName: data.guardian2?.fullName ?? '',
        relation: data.guardian2?.relation ?? '',
        phone: data.guardian2?.phone ?? '',
        email: data.guardian2?.email ?? '',
      });
      Object.assign(emergency, {
        source: data.emergency?.source ?? '',
        fullName: data.emergency?.fullName ?? '',
        relation: data.emergency?.relation ?? '',
        phone: data.emergency?.phone ?? '',
      });
      Object.assign(health, {
        doctorName: data.health?.doctorName ?? '',
        doctorPhone: data.health?.doctorPhone ?? '',
        bloodGroup: data.health?.bloodGroup ?? '',
        knownAllergies: data.health?.knownAllergies ?? '',
        ongoingTreatments: data.health?.ongoingTreatments ?? '',
        dietaryRegime: data.health?.dietaryRegime ?? '',
        instructions: data.health?.instructions ?? '',
        vaccinations: ensureHealthVaccinations(data.health?.vaccinations),
      });
      if (data.options) {
        Object.assign(options, normalizeOptionsDraft({
          ...data.options,
          scheduleId: '',
          scheduleLabel: '',
        }));
      }
      enrollmentFromParentAccount.value = true;
      saveDraft();
      return null;
    } catch {
      return 'Impossible de charger la fiche de cet enfant pour la réinscription.';
    }
  }

  function applyResume(data: EnrollmentResumePayload) {
    Object.assign(child, data.child);
    Object.assign(parent, data.parent);
    Object.assign(guardian2, data.guardian2);
    Object.assign(emergency, data.emergency);
    if (!emergency.source) emergency.source = '';
    if (data.health) {
      Object.assign(health, data.health);
      health.vaccinations = ensureHealthVaccinations(data.health.vaccinations);
    }
    if (data.options) {
      Object.assign(options, normalizeOptionsDraft(data.options));
    }
    if (data.engagement) {
      Object.assign(engagement, data.engagement);
    }
    if (data.scheduleId && !options.scheduleId) {
      options.scheduleId = data.scheduleId;
    }
    childId.value = data.childId;
    enrollmentId.value = data.enrollmentId;
    resumeToken.value = data.resumeToken ?? '';
    enrollmentFromParentAccount.value = false;
    if (data.step >= 1 && data.step <= 5) {
      step.value = data.step as EnrollmentStepId;
    }
    saveDraft();
  }

  function applyDraft(draft: EnrollmentDraftSnapshot) {
    if (draft.schoolYear !== activeSchoolYearLabel.value) return;
    Object.assign(child, draft.child);
    Object.assign(parent, draft.parent);
    Object.assign(guardian2, draft.guardian2);
    Object.assign(emergency, draft.emergency);
    if (!emergency.source) emergency.source = '';
    Object.assign(health, draft.health);
    health.vaccinations = ensureHealthVaccinations(draft.health.vaccinations);
    Object.assign(options, normalizeOptionsDraft(draft.options));
    Object.assign(engagement, draft.engagement ?? defaultEngagement());
    childId.value = draft.childId ?? '';
    enrollmentId.value = draft.enrollmentId ?? '';
    resumeToken.value = draft.resumeToken ?? '';
    enrollmentFromParentAccount.value = draft.enrollmentFromParentAccount ?? false;
    if (!parent.fullName.trim()) {
      parent.fullName = `${parent.firstName} ${parent.lastName}`.trim();
    }
    if (draft.step >= 1 && draft.step <= 5) {
      step.value = draft.step;
    }
  }

  function saveDraft() {
    persistEnrollmentDraft(snapshotDraft());
  }

  async function loadResumeFromToken(token: string): Promise<string | null> {
    submitting.value = true;
    try {
      const data = await $fetch<EnrollmentResumePayload>(
        `${config.public.apiBase}/public/enrollments/resume/${encodeURIComponent(token)}`,
      );
      if (data.schoolYear !== activeSchoolYearLabel.value) {
        return 'Ce dossier concerne une autre année scolaire. Veuillez contacter l’administration.';
      }
      applyResume(data);
      return null;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; message?: string };
      const m = err?.data?.message ?? err?.message;
      return Array.isArray(m)
        ? m.join(' ')
        : m || 'Impossible de charger ce dossier d’inscription.';
    } finally {
      submitting.value = false;
    }
  }

  const prefilledFor = ref('');

  watch(
    () =>
      [
        String(route.query.from ?? ''),
        typeof route.query.child === 'string' ? route.query.child.trim() : '',
        parentAuth.isLoggedIn.value,
      ] as const,
    async ([from, childQuery, loggedIn]) => {
      if (from !== 'parent' || !loggedIn) return;
      if (typeof route.query.resume === 'string' && route.query.resume.trim()) return;

      if (childQuery) {
        if (prefilledFor.value === childQuery) return;
        prefilledFor.value = childQuery;
        resetWizardForNewChild();
        await applyLoggedInParentProfile();
        const err = await applyExistingChildForReenrollment(childQuery);
        if (err) {
          prefilledFor.value = '';
          submitError.value = err;
        }
        return;
      }

      if (prefilledFor.value === '__new__') return;
      resetWizardForNewChild();
      await applyLoggedInParentProfile();
      prefilledFor.value = '__new__';
    },
    { immediate: true },
  );

  onMounted(async () => {
    if (!activeYearFromApi.value) {
      const fromApi = await fetchActiveSchoolYearLabel(String(config.public.apiBase));
      if (fromApi) activeSchoolYearLabel.value = fromApi;
    }

    const token = typeof route.query.resume === 'string' ? route.query.resume.trim() : '';
    if (token) {
      const err = await loadResumeFromToken(token);
      if (err) submitError.value = err;
      return;
    }

    if (route.query.from === 'parent') return;

    const draft = loadEnrollmentDraft();
    if (draft) applyDraft(draft);
  });

  const schoolYear = computed(() => activeSchoolYearLabel.value);
  const schoolYearLabel = computed(() => formatSchoolYearLabel(schoolYear.value));

  const childDisplayName = computed(() => {
    const name = `${child.firstName.trim()} ${child.lastName.trim()}`.trim();
    return name || 'votre enfant';
  });

  const parentDisplayName = computed(() => {
    const name = parent.fullName.trim() || `${parent.firstName.trim()} ${parent.lastName.trim()}`.trim();
    return name || 'le responsable légal';
  });

  const stepTitle = computed(() => {
    const map: Record<EnrollmentStepId, string> = {
      1: 'Informations sur l’enfant',
      2: 'Famille & contacts',
      3: 'Fiche médicale',
      4: 'Formule & services',
      5: 'Récapitulatif & signature',
    };
    return map[step.value];
  });

  const stepSubtitle = computed(() => {
    const map: Record<EnrollmentStepId, string> = {
      1: 'Identité, classe demandée et coordonnées de l’élève.',
      2: 'Responsables légaux et personne à contacter en cas d’urgence.',
      3: 'Informations de santé — usage direction et équipe Commonwealth uniquement.',
      4: 'Formule horaire, services et autorisations parentales.',
      5: 'Vérifiez les informations avant de valider le dossier d’inscription.',
    };
    return map[step.value];
  });

  const selectedServicesLabel = computed(() => {
    const parts: string[] = [];
    if (options.scheduleLabel.trim()) parts.push(`Formule : ${options.scheduleLabel}`);
    if (options.serviceSelections.length) {
      parts.push(...options.serviceSelections.map((s) => formatServiceSelectionLabel(s)));
    }
    return parts.length ? parts.join(' · ') : 'Aucun service sélectionné';
  });

  const optionsRecapRows = computed((): EnrollmentRecapRow[] => {
    const rows: EnrollmentRecapRow[] = [];
    if (options.scheduleLabel.trim()) {
      rows.push({ label: 'Formule horaire', value: options.scheduleLabel, full: true });
    }
    if (options.serviceSelections.length) {
      rows.push({
        label: 'Services',
        value: options.serviceSelections.map((s) => formatServiceSelectionLabel(s)).join(' · '),
        full: true,
      });
    } else {
      rows.push({ label: 'Services', value: 'Aucun', full: true });
    }
    const authOn = (Object.keys(options.authorizations) as EnrollmentAuthorizationKey[])
      .filter((k) => options.authorizations[k])
      .map((k) => authorizationLabel(k));
    rows.push({
      label: 'Autorisations',
      value: authOn.length ? authOn.join(' · ') : 'Aucune',
      full: true,
    });
    if (options.comment.trim()) {
      rows.push({ label: 'Commentaire', value: options.comment, full: true });
    }
    return rows;
  });

  function isStepDone(n: EnrollmentStepId): boolean {
    return submitted.value || step.value > n;
  }

  function validateStep(n: EnrollmentStepId): string | null {
    if (n === 1) {
      if (!child.firstName.trim() || !child.lastName.trim()) {
        return 'Le prénom et le nom de famille sont obligatoires.';
      }
      if (!child.birthDate.trim()) {
        return 'La date de naissance est obligatoire.';
      }
      if (!child.levelId.trim()) {
        return 'Sélectionnez une classe demandée.';
      }
    }
    if (n === 2) {
      if (!parent.fullName.trim()) {
        return 'Le prénom et le nom du responsable 1 sont obligatoires.';
      }
      if (parent.relation !== 'FATHER' && parent.relation !== 'MOTHER') {
        return 'Indiquez le lien avec l’enfant (père ou mère).';
      }
      if (!parent.email.trim()) {
        return 'L’adresse e-mail est obligatoire.';
      }
      if (!parent.phone.trim()) {
        return 'Le numéro de téléphone est obligatoire.';
      }
      if (!emergency.source) {
        return 'Choisissez le contact d’urgence.';
      }
      if (emergency.source === 'GUARDIAN2') {
        if (!guardian2.fullName.trim()) {
          return 'Renseignez le responsable 2 ou choisissez un autre contact d’urgence.';
        }
        if (!guardian2.phone.trim()) {
          return 'Le téléphone du responsable 2 est obligatoire pour le contact d’urgence.';
        }
      } else if (emergency.source === 'OTHER') {
        if (!emergency.fullName.trim()) {
          return 'Le contact d’urgence est obligatoire.';
        }
        if (!emergency.phone.trim()) {
          return 'Le téléphone du contact d’urgence est obligatoire.';
        }
      }
    }
    if (n === 3) {
      if (!health.doctorName.trim()) {
        return 'Le médecin référent est obligatoire.';
      }
      if (!health.doctorPhone.trim()) {
        return 'Le téléphone du cabinet est obligatoire.';
      }
      if (!health.bloodGroup) {
        return 'Sélectionnez le groupe sanguin.';
      }
    }
    if (n === 4) {
      if (options.requiresSchedule && !options.scheduleId.trim()) {
        return 'Sélectionnez une formule horaire.';
      }
    }
    if (n === 5) {
      if (!engagement.certified) {
        return 'Cochez la case d’engagement pour valider le dossier.';
      }
      if (!engagement.signedPlace.trim()) {
        return 'Indiquez le lieu de signature.';
      }
      if (!engagement.signedAt.trim()) {
        return 'Indiquez la date de signature.';
      }
      if (!engagement.signatureDataUrl.trim()) {
        return 'Dessinez ou importez votre signature.';
      }
    }
    return null;
  }

  function saveChildStep() {
    if (!parent.address.trim() && child.childAddress.trim()) {
      parent.address = child.childAddress.trim();
    }
    saveDraft();
  }

  async function saveFamilyStep(): Promise<string | null> {
    trimFamilyFields(parent, guardian2, emergency);

    for (const stepId of [1] as EnrollmentStepId[]) {
      const prerequisiteError = validateStep(stepId);
      if (prerequisiteError) return prerequisiteError;
    }

    submitting.value = true;
    try {
      const result = await $fetch<{
        childId: string;
        enrollmentId: string;
        resumeToken: string;
      }>(`${config.public.apiBase}/public/enrollments/family`, {
        method: 'POST',
        body: {
          parent: enrollmentParentBody(parent),
          schoolYear: schoolYear.value,
          child: enrollmentChildBody(child),
          guardian2: { ...guardian2 },
          emergency: { ...emergency },
          childId: childId.value || undefined,
          enrollmentId: enrollmentId.value || undefined,
          existingParentAccount: enrollmentFromParentAccount.value || undefined,
        },
      });
      childId.value = result.childId;
      enrollmentId.value = result.enrollmentId;
      resumeToken.value = result.resumeToken;
      saveDraft();
      return null;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; message?: string };
      const m = err?.data?.message ?? err?.message;
      return Array.isArray(m)
        ? m.join(' ')
        : m || 'Enregistrement impossible. Vérifiez que l’API est démarrée.';
    } finally {
      submitting.value = false;
    }
  }

  async function saveHealthStep(): Promise<string | null> {
    health.doctorName = health.doctorName.trim();
    health.doctorPhone = health.doctorPhone.trim();
    health.knownAllergies = health.knownAllergies.trim();
    health.ongoingTreatments = health.ongoingTreatments.trim();
    health.dietaryRegime = health.dietaryRegime.trim();
    health.instructions = health.instructions.trim();

    for (const stepId of [1, 2] as EnrollmentStepId[]) {
      const prerequisiteError = validateStep(stepId);
      if (prerequisiteError) return prerequisiteError;
    }

    syncParentNamesFromFullName(parent);

    submitting.value = true;
    try {
      const result = await $fetch<{ childId: string; enrollmentId: string }>(
        `${config.public.apiBase}/public/enrollments/health`,
        {
          method: 'POST',
          body: {
            parent: enrollmentParentBody(parent),
            schoolYear: schoolYear.value,
            child: enrollmentChildBody(child),
            health: healthToApiPayload(health),
            childId: childId.value || undefined,
            enrollmentId: enrollmentId.value || undefined,
          },
        },
      );
      childId.value = result.childId;
      enrollmentId.value = result.enrollmentId;
      saveDraft();
      return null;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; message?: string };
      const m = err?.data?.message ?? err?.message;
      return Array.isArray(m)
        ? m.join(' ')
        : m || 'Enregistrement de la fiche médicale impossible. Vérifiez que l’API est démarrée.';
    } finally {
      submitting.value = false;
    }
  }

  async function saveOptionsStep(): Promise<string | null> {
    for (const stepId of [1, 2, 3] as EnrollmentStepId[]) {
      const prerequisiteError = validateStep(stepId);
      if (prerequisiteError) return prerequisiteError;
    }

    if (!childId.value || !enrollmentId.value) {
      return 'Reprenez l’inscription depuis l’étape Famille.';
    }

    syncParentNamesFromFullName(parent);
    trimFamilyFields(parent, guardian2, emergency);

    submitting.value = true;
    try {
      const result = await $fetch<{ childId: string; enrollmentId: string }>(
        `${config.public.apiBase}/public/enrollments/options`,
        {
          method: 'POST',
          body: {
            parent: enrollmentParentBody(parent),
            schoolYear: schoolYear.value,
            child: enrollmentChildBody(child),
            guardian2: { ...guardian2 },
            emergency: { ...emergency },
            options: optionsApiPayload(),
            childId: childId.value,
            enrollmentId: enrollmentId.value,
          },
        },
      );
      childId.value = result.childId;
      enrollmentId.value = result.enrollmentId;
      saveDraft();
      return null;
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; message?: string };
      const m = err?.data?.message ?? err?.message;
      return Array.isArray(m)
        ? m.join(' ')
        : m || 'Enregistrement des horaires et options impossible.';
    } finally {
      submitting.value = false;
    }
  }

  async function next() {
    submitError.value = '';
    const err = validateStep(step.value);
    if (err) {
      submitError.value = err;
      return;
    }
    if (step.value === 1) {
      saveChildStep();
    } else if (step.value === 2) {
      const saveErr = await saveFamilyStep();
      if (saveErr) {
        submitError.value = saveErr;
        return;
      }
    } else if (step.value === 3) {
      const saveErr = await saveHealthStep();
      if (saveErr) {
        submitError.value = saveErr;
        return;
      }
    } else if (step.value === 4) {
      const saveErr = await saveOptionsStep();
      if (saveErr) {
        submitError.value = saveErr;
        return;
      }
    } else {
      saveDraft();
    }
    if (step.value < 5) {
      step.value = (step.value + 1) as EnrollmentStepId;
      saveDraft();
    }
  }

  function prev() {
    submitError.value = '';
    if (step.value > 1) {
      step.value = (step.value - 1) as EnrollmentStepId;
      saveDraft();
    }
  }

  function goToStep(target: EnrollmentStepId) {
    submitError.value = '';
    step.value = target;
    saveDraft();
  }

  async function submit() {
    submitError.value = '';
    for (let i = 1; i <= 5; i += 1) {
      const err = validateStep(i as EnrollmentStepId);
      if (err) {
        submitError.value = err;
        step.value = i as EnrollmentStepId;
        return;
      }
    }

    if (!childId.value || !enrollmentId.value) {
      submitError.value = 'Reprenez l’inscription depuis l’étape Famille.';
      step.value = 2;
      return;
    }

    syncParentNamesFromFullName(parent);
    submitting.value = true;
    try {
      await $fetch(`${config.public.apiBase}/public/enrollments/batch`, {
        method: 'POST',
        body: {
          parent: enrollmentParentBody(parent),
          schoolYear: schoolYear.value,
          children: [
            {
              ...enrollmentChildBody(child),
              enrollmentId: enrollmentId.value || undefined,
              health: healthToApiPayload(health),
              guardian2: { ...guardian2 },
              emergency: { ...emergency },
            },
          ],
          options: optionsApiPayload(),
          engagement: {
            certified: engagement.certified,
            signedPlace: engagement.signedPlace.trim(),
            signedAt: engagement.signedAt.trim(),
            signatureMode: engagement.signatureMode,
            signatureDataUrl: engagement.signatureDataUrl,
          },
          existingParentAccount: enrollmentFromParentAccount.value || undefined,
        },
      });
      submitted.value = true;
      clearEnrollmentDraft();
    } catch (e: unknown) {
      const err = e as { data?: { message?: string | string[] }; message?: string };
      const m = err?.data?.message ?? err?.message;
      submitError.value = Array.isArray(m)
        ? m.join(' ')
        : m || 'Envoi impossible. Vérifiez que l’API est démarrée et réessayez.';
    } finally {
      submitting.value = false;
    }
  }

  const childRecapRows = computed((): EnrollmentRecapRow[] => [
    { label: 'Prénom usuel', value: child.firstName },
    { label: 'Nom de famille', value: child.lastName },
    { label: 'Date de naissance', value: formatDateFr(child.birthDate) },
    { label: 'Lieu de naissance', value: child.birthPlace },
    { label: 'Nationalité', value: child.nationality },
    { label: 'Sexe', value: child.gender },
    { label: 'Langues à la maison', value: child.homeLanguages },
    { label: 'Classe demandée', value: child.levelName, full: true },
    { label: 'Adresse du domicile', value: child.childAddress, full: true },
  ]);

  const parentRecapRows = computed((): EnrollmentRecapRow[] => {
    const rows: EnrollmentRecapRow[] = [
      { label: 'Responsable 1', value: parent.fullName || `${parent.firstName} ${parent.lastName}`.trim() },
      {
        label: 'Lien avec l’enfant',
        value: parent.relation === 'FATHER' ? 'Père' : parent.relation === 'MOTHER' ? 'Mère' : '',
      },
      { label: 'Téléphone', value: parent.phone },
      { label: 'E-mail', value: parent.email },
      { label: 'Profession', value: parent.profession },
      { label: 'Adresse du domicile', value: parent.address, full: true },
    ];
    if (guardian2.fullName.trim() || guardian2.phone.trim() || guardian2.email.trim()) {
      rows.push(
        { label: 'Responsable 2', value: guardian2.fullName, full: true },
        { label: 'Lien (resp. 2)', value: guardian2.relation },
        { label: 'Téléphone (resp. 2)', value: guardian2.phone },
        { label: 'E-mail (resp. 2)', value: guardian2.email },
      );
    }
    rows.push(
      {
        label: 'Contact d’urgence',
        value:
          emergency.source === 'GUARDIAN1'
            ? `Responsable 1 — ${emergency.fullName}`
            : emergency.source === 'GUARDIAN2'
              ? `Responsable 2 — ${emergency.fullName}`
              : emergency.fullName,
        full: true,
      },
      { label: 'Lien (urgence)', value: emergency.relation },
      { label: 'Téléphone (urgence)', value: emergency.phone },
    );
    return rows;
  });

  const healthRecapRows = computed((): EnrollmentRecapRow[] => {
    const vaccineLines = health.vaccinations.map((v) => {
      const status = v.administeredAt.trim() ? 'À jour' : 'Manquant';
      return `${v.label} : ${formatHealthDateFr(v.administeredAt)} (${status})`;
    });
    return [
      { label: 'Médecin référent', value: health.doctorName },
      { label: 'Téléphone du cabinet', value: health.doctorPhone },
      { label: 'Groupe sanguin', value: health.bloodGroup ? bloodGroupLabel(health.bloodGroup) : '' },
      { label: 'Allergies', value: health.knownAllergies, full: true },
      { label: 'Traitements en cours', value: health.ongoingTreatments, full: true },
      { label: 'Vaccinations', value: vaccineLines.join(' · '), full: true },
      { label: 'Régime alimentaire', value: health.dietaryRegime, full: true },
      { label: 'Consigne équipe', value: health.instructions, full: true },
    ];
  });

  return {
    step,
    submitted,
    submitting,
    submitError,
    child,
    parent,
    guardian2,
    emergency,
    health,
    options,
    engagement,
    enrollmentFromParentAccount,
    schoolYear,
    schoolYearLabel,
    childDisplayName,
    parentDisplayName,
    stepTitle,
    stepSubtitle,
    selectedServicesLabel,
    optionsRecapRows,
    isStepDone,
    validateStep,
    next,
    prev,
    goToStep,
    submit,
    childRecapRows,
    parentRecapRows,
    healthRecapRows,
  };
}
