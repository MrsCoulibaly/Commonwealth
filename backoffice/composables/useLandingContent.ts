export type LandingImages = {
  about?: string
  approach?: string
  suggestions?: string
  gallery?: string[]
  partners?: string[]
  rentree?: Partial<Record<'enfants' | 'petits' | 'moyens' | 'grands', string>>
}

export type LandingContentPayload = {
  fr: Record<string, unknown>
  en: Record<string, unknown>
  images: LandingImages
}

export type LandingApiResponse = {
  id: string
  content: LandingContentPayload
  updatedAt: string
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key] as Record<string, unknown>, value as Record<string, unknown>)
    } else if (value !== undefined && value !== null && value !== '') {
      out[key] = value
    }
  }
  return out
}

function resolveMediaUrl(url: string | null | undefined, fallback: string) {
  const config = useRuntimeConfig()
  const u = String(url ?? '').trim()
  if (!u) return fallback
  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${u.startsWith('/') ? u : `/${u}`}`
}

/** Charge le contenu CMS landing (clé partagée) et fusionne les textes dans i18n. */
export async function loadLandingContent() {
  const config = useRuntimeConfig()
  const { mergeLocaleMessage, getLocaleMessage } = useI18n()

  try {
    const { data, pending, error, refresh } = await useAsyncData(
      'public-landing-content',
      () => $fetch<LandingApiResponse>(`${config.public.apiBase}/public/landing`),
    )

    const content = data.value?.content
    if (content) {
      for (const loc of ['fr', 'en'] as const) {
        const override = content[loc]
        if (!override || typeof override !== 'object') continue
        const current = getLocaleMessage(loc) as Record<string, unknown>
        const currentHome = (
          current?.home && typeof current.home === 'object' ? current.home : {}
        ) as Record<string, unknown>
        mergeLocaleMessage(loc, {
          home: deepMerge(currentHome, override as Record<string, unknown>),
        })
      }
    }

    return { data, pending, error, refresh }
  } catch {
    // API indisponible → fallback i18n local
    return { data: ref(null), pending: ref(false), error: ref(null), refresh: async () => {} }
  }
}

export function useLandingImages() {
  const nuxtData = useNuxtData<LandingApiResponse>('public-landing-content')
  const images = computed<LandingImages>(() => nuxtData.data.value?.content?.images ?? {})

  function imageSrc(key: keyof LandingImages, fallback: string) {
    const val = images.value[key]
    if (typeof val === 'string') return resolveMediaUrl(val, fallback)
    return fallback
  }

  function imageList(key: 'gallery' | 'partners', fallback: string[]) {
    const val = images.value[key]
    if (Array.isArray(val) && val.length) {
      return val.map((u, i) => resolveMediaUrl(u, fallback[i] ?? fallback[0] ?? ''))
    }
    return fallback
  }

  function rentreeImage(level: 'enfants' | 'petits' | 'moyens' | 'grands', fallback: string) {
    const map = images.value.rentree
    if (map && typeof map === 'object') {
      const u = map[level]
      if (typeof u === 'string' && u.trim()) return resolveMediaUrl(u, fallback)
    }
    return fallback
  }

  return { images, imageSrc, imageList, rentreeImage, resolveMediaUrl }
}
