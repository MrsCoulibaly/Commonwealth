/** Coordonnées officielles de l'établissement (valeurs par défaut si non surchargées en config). */
export const SCHOOL_CONTACT_DEFAULTS = {
  displayName: 'Commonwealth Preschool of Abidjan',
  address: '19 Rue le Perce-Neige, Riviera 6, Cocody, Abidjan',
  phone: '+225 07 11 77 77 01',
  directionEmail: 'direction@commonwealth-school.com',
  paymentModes:
    "Virement bancaire · Wave · Orange Money · Espèces (caisse de l'école)",
} as const;

export type SchoolContactInfo = {
  displayName: string;
  address: string;
  phone: string;
  phoneTel: string;
  directionEmail: string;
  contactEmail: string;
  administrationEmail: string;
  emergencyPhone: string;
  paymentModes: string;
};

export function phoneToTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
}

export function emailToMailtoHref(email: string): string {
  return email.trim() ? `mailto:${email.trim()}` : '';
}

export function resolveSchoolContact(publicConfig: {
  schoolDisplayName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolPhoneTel?: string;
  schoolDirectionEmail?: string;
  schoolContactEmail?: string;
  schoolAdministrationEmail?: string;
  schoolEmergencyPhone?: string;
  schoolPaymentModes?: string;
}): SchoolContactInfo {
  const phone = publicConfig.schoolPhone?.trim() || SCHOOL_CONTACT_DEFAULTS.phone;
  const directionEmail =
    publicConfig.schoolDirectionEmail?.trim() ||
    publicConfig.schoolContactEmail?.trim() ||
    publicConfig.schoolAdministrationEmail?.trim() ||
    SCHOOL_CONTACT_DEFAULTS.directionEmail;

  return {
    displayName: publicConfig.schoolDisplayName?.trim() || SCHOOL_CONTACT_DEFAULTS.displayName,
    address: publicConfig.schoolAddress?.trim() || SCHOOL_CONTACT_DEFAULTS.address,
    phone,
    phoneTel: publicConfig.schoolPhoneTel?.trim() || phone.replace(/[^\d+]/g, ''),
    directionEmail,
    contactEmail: publicConfig.schoolContactEmail?.trim() || directionEmail,
    administrationEmail: publicConfig.schoolAdministrationEmail?.trim() || directionEmail,
    emergencyPhone: publicConfig.schoolEmergencyPhone?.trim() || phone,
    paymentModes: publicConfig.schoolPaymentModes?.trim() || SCHOOL_CONTACT_DEFAULTS.paymentModes,
  };
}
