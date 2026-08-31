<template>
  <header class="sticky top-0 z-30 flex flex-col gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:px-8">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <button
        type="button"
        class="relative z-[60] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden"
        :aria-expanded="menuOpen"
        :aria-label="menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
        </svg>
        <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
      <button
        type="button"
        class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#216EC2] transition hover:bg-slate-50"
        aria-label="Notifications"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div
        class="flex items-center gap-2 rounded-full border border-[#216EC2] bg-[#216EC2] py-1 pl-1 pr-3 text-white shadow-sm"
      >
        <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20 text-xs font-bold">
          {{ initials }}
        </span>
        <span class="max-w-[140px] truncate text-sm font-semibold">{{ userLabel }}</span>
        <svg class="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m6 9 6 6 6-6" stroke-linecap="round" />
        </svg>
      </div>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-[#216EC2] transition hover:bg-slate-50"
        aria-label="Aide"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const menuOpen = useState('admin_menu_open', () => false)
const { token } = useAuth()

const userLabel = computed(() => {
  const t = token.value
  if (!t) return 'Administrateur'
  try {
    const json = JSON.parse(atob(t.split('.')[1])) as { email?: string }
    const em = json.email
    if (!em) return 'Administrateur'
    const local = em.split('@')[0] ?? ''
    const words = local.split(/[._-]+/).filter(Boolean)
    if (words.length === 0) return 'Administrateur'
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  } catch {
    return 'Administrateur'
  }
})

const initials = computed(() => {
  const parts = userLabel.value.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0]![0] + parts[1]![0]).toUpperCase()
  }
  return (parts[0]?.slice(0, 2) ?? 'AD').toUpperCase()
})
</script>
