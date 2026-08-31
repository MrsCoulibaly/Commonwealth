/** Génération / téléchargement d’un fichier iCalendar (.ics) pour le programme. */

export type ProgrammeIcsEvent = {
  id?: string
  title: string
  description?: string
  eventDate: string
  endDate?: string | null
  location?: string
  categoryLabel?: string
  statusLabel?: string
  levelLabels?: string[]
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Date UTC au format iCal : YYYYMMDDTHHMMSSZ */
function toIcsUtc(d: Date) {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  )
}

/** Jour calendaire local au format iCal DATE : YYYYMMDD */
function toIcsDateLocal(d: Date) {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function parseLocalDay(iso: string): Date | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, days: number) {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

function foldLine(line: string) {
  const max = 75
  if (line.length <= max) return line
  const parts: string[] = []
  let rest = line
  parts.push(rest.slice(0, max))
  rest = rest.slice(max)
  while (rest.length > 0) {
    parts.push(` ${rest.slice(0, max - 1)}`)
    rest = rest.slice(max - 1)
  }
  return parts.join('\r\n')
}

function escapeIcsText(value: string) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\n|\r/g, '\\n')
}

function eventUid(event: ProgrammeIcsEvent, index: number) {
  const base = event.id || `${event.title}-${event.eventDate}-${index}`
  const safe = base.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 48) || `evt${index}`
  return `${safe}@commonwealth-programme`
}

function eventDescription(event: ProgrammeIcsEvent) {
  const bits = [
    event.categoryLabel ? `Catégorie : ${event.categoryLabel}` : '',
    event.statusLabel ? `Statut : ${event.statusLabel}` : '',
    event.levelLabels?.length ? `Public : ${event.levelLabels.join(', ')}` : '',
    event.description || '',
  ].filter(Boolean)
  return bits.join('\n')
}

export function buildProgrammeIcs(opts: {
  schoolYear: string
  events: ProgrammeIcsEvent[]
  calendarName?: string
}) {
  const now = toIcsUtc(new Date())
  const calName = opts.calendarName || `Programme ${opts.schoolYear}`
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Commonwealth Preschool//Programme//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calName)}`,
    `X-WR-TIMEZONE:Africa/Abidjan`,
  ]

  opts.events.forEach((event, index) => {
    const start = parseLocalDay(event.eventDate)
    if (!start) return
    const endInclusive = event.endDate ? parseLocalDay(event.endDate) ?? start : start
    // DTEND for all-day events is exclusive
    const endExclusive = addDays(endInclusive, 1)

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${eventUid(event, index)}`)
    lines.push(`DTSTAMP:${now}`)
    lines.push(`DTSTART;VALUE=DATE:${toIcsDateLocal(start)}`)
    lines.push(`DTEND;VALUE=DATE:${toIcsDateLocal(endExclusive)}`)
    lines.push(`SUMMARY:${escapeIcsText(event.title)}`)
    const desc = eventDescription(event)
    if (desc) lines.push(`DESCRIPTION:${escapeIcsText(desc)}`)
    if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

export function downloadProgrammeIcs(opts: {
  schoolYear: string
  events: ProgrammeIcsEvent[]
  filename?: string
}) {
  const ics = buildProgrammeIcs(opts)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const yearSlug = opts.schoolYear.replace(/[^\w.-]+/g, '-')
  a.href = url
  a.download = opts.filename || `programme-${yearSlug}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
