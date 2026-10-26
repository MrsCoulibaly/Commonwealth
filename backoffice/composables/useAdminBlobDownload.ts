/** Téléchargement PDF authentifié (espace admin). */
export function useAdminBlobDownload() {
  const { token } = useAuth()
  const config = useRuntimeConfig()

  function parseFilename(cd: string | null): string | undefined {
    if (!cd) return undefined
    const mStar = cd.match(/filename\*\s*=\s*UTF-8''([^;\s]+)/i)
    if (mStar?.[1]) {
      try {
        return decodeURIComponent(mStar[1].replace(/"/g, ''))
      } catch {
        return mStar[1]
      }
    }
    const m = cd.match(/filename\s*=\s*("?)([^";\r\n]+)\1/i)
    return m?.[2]?.trim()
  }

  async function downloadAdminPdf(path: string, fallbackName: string) {
    const t = token.value
    if (!t) throw new Error('Session expirée. Reconnectez-vous.')
    const res = await fetch(`${config.public.apiBase}${path}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${t}`,
        Accept: 'application/pdf',
      },
    })
    if (!res.ok) {
      let detail = res.statusText
      try {
        const ct = res.headers.get('content-type') ?? ''
        if (ct.includes('application/json')) {
          const j = (await res.json()) as { message?: unknown }
          if (j?.message != null) {
            detail = Array.isArray(j.message) ? j.message.join(', ') : String(j.message)
          }
        } else {
          const text = await res.text()
          if (text) detail = text.slice(0, 200)
        }
      } catch {
        /* ignore */
      }
      throw new Error(detail || `HTTP ${res.status}`)
    }
    const blob = await res.blob()
    const filename = parseFilename(res.headers.get('Content-Disposition')) || fallbackName
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return { downloadAdminPdf }
}
