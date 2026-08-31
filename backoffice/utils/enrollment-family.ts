import type {
  EnrollmentEmergencyDraft,
  EnrollmentGuardian2Draft,
  EnrollmentParentDraft,
} from '~/composables/useEnrollmentWizard';

export function parentRelationLabel(relation: EnrollmentParentDraft['relation']): string {
  if (relation === 'FATHER') return 'Père';
  if (relation === 'MOTHER') return 'Mère';
  return '';
}

export function syncEmergencyFromSource(
  emergency: EnrollmentEmergencyDraft,
  parent: EnrollmentParentDraft,
  guardian2: EnrollmentGuardian2Draft,
) {
  if (emergency.source === 'GUARDIAN1') {
    emergency.fullName = parent.fullName.trim();
    emergency.relation = parentRelationLabel(parent.relation);
    emergency.phone = parent.phone.trim();
    return;
  }
  if (emergency.source === 'GUARDIAN2') {
    emergency.fullName = guardian2.fullName.trim();
    emergency.relation = guardian2.relation.trim();
    emergency.phone = guardian2.phone.trim();
  }
}

export function guardian2IsFilled(guardian2: EnrollmentGuardian2Draft): boolean {
  return Boolean(
    guardian2.fullName.trim() || guardian2.phone.trim() || guardian2.email.trim() || guardian2.relation.trim(),
  );
}
