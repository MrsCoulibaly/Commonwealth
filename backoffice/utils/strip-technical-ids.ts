/** UUID techniques (Prisma, catalogues) — jamais dans un e-mail ou une notif parent. */
const TECHNICAL_ID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export function looksLikeTechnicalId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
}

export function stripTechnicalIds(value: string): string {
  if (!value) return value;
  return value.replace(TECHNICAL_ID_RE, '—');
}
