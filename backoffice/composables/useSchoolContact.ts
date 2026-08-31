import { resolveSchoolContact } from '~/utils/school-contact';

export function useSchoolContact() {
  const config = useRuntimeConfig();
  return computed(() => resolveSchoolContact(config.public));
}
