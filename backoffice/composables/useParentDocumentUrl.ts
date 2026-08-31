/** URL absolue pour ouvrir un fichier (upload `/uploads/...` ou lien externe). */
export function useParentDocumentUrl() {
  const config = useRuntimeConfig()

  function resolveDocumentUrl(url: string) {
    if (!url) return '#'
    if (/^https?:\/\//i.test(url)) return url
    const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`
  }

  return { resolveDocumentUrl }
}
