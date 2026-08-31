export type EnrollmentAuthorizationKey =
  | 'photosInternal'
  | 'photosCommunication'
  | 'outings'
  | 'firstAid';

export type EnrollmentServiceSelection = {
  serviceTariffId: string;
  code: string;
  variantId?: string | null;
  label?: string;
  variantLabel?: string;
  amountXof?: number;
};

export const ENROLLMENT_AUTHORIZATIONS: Array<{
  key: EnrollmentAuthorizationKey;
  title: string;
  subtitle: string;
}> = [
  {
    key: 'photosInternal',
    title: 'Photos — usage interne',
    subtitle: 'Espace parents Commonwealth',
  },
  {
    key: 'photosCommunication',
    title: 'Photos — communication',
    subtitle: 'Supports de communication',
  },
  {
    key: 'outings',
    title: 'Sorties & activités extérieures',
    subtitle: 'Sorties organisées par l’école',
  },
  {
    key: 'firstAid',
    title: 'Soins de premiers secours',
    subtitle: 'Appel aux urgences si injoignable',
  },
];

export function authorizationLabel(key: EnrollmentAuthorizationKey): string {
  return ENROLLMENT_AUTHORIZATIONS.find((a) => a.key === key)?.title ?? key;
}

export function formatServiceSelectionLabel(
  selection: EnrollmentServiceSelection,
): string {
  const base = selection.variantLabel
    ? `${selection.label ?? selection.code} — ${selection.variantLabel}`
    : selection.label ?? selection.code;
  if (selection.amountXof != null) {
    return `${base} (${new Intl.NumberFormat('fr-FR').format(selection.amountXof)} XOF)`;
  }
  return base;
}
