<template>
  <div>
    <NuxtLink
      to="/parent/ateliers"
      class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brandBlue"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      Retour aux ateliers
    </NuxtLink>

    <div class="mb-6 rounded-2xl bg-brandBlue px-6 py-5 sm:px-8 sm:py-6">
      <h1 class="text-2xl font-bold text-white sm:text-3xl">Inscription à l’atelier</h1>
    </div>
    <p class="mb-8 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base">
      Remplissez le formulaire ci-contre pour inscrire votre enfant à l’atelier de votre choix.
    </p>

    <p v-if="pending" class="text-sm text-slate-500">Chargement…</p>
    <p v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <div v-else-if="workshop" class="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      <!-- Détail atelier -->
      <div class="space-y-5">
        <h2 class="text-2xl font-bold text-brandBlue sm:text-3xl">{{ workshop.title }}</h2>

        <div class="overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <img
            class="aspect-[16/10] w-full object-cover"
            :src="mediaUrl(workshop.image)"
            :alt="workshop.title"
          >

          <div class="space-y-4 p-5 sm:p-6">
            <p v-if="workshop.description" class="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              {{ workshop.description }}
            </p>

            <div class="flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1E8] px-3 py-1.5 text-xs font-medium text-[#E87A3A]">
                <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round" />
                </svg>
                {{ workshop.date }}
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-[#E8F1FB] px-3 py-1.5 text-xs font-medium text-brandBlue">
                <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                {{ workshop.time }}
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-[#EAF8EF] px-3 py-1.5 text-xs font-medium text-brandGreen">
                <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" stroke-linecap="round" />
                </svg>
                {{ workshop.age }}
              </span>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-[#F3EBFA] px-3 py-1.5 text-xs font-medium text-brandPurple">
                <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5 shrink-0" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M12 3l2.2 2.2L20 4l-1.2 5.8L21 12l-2.2 2.2L20 20l-5.8-1.2L12 21l-2.2-2.2L4 20l1.2-5.8L3 12l2.2-2.2L4 4l5.8 1.2L12 3Z" stroke-linejoin="round" />
                </svg>
                {{ workshop.price }}
              </span>
            </div>

            <div
              v-if="importantBullets.length"
              class="rounded-2xl bg-brandBlue p-5 text-white sm:p-6"
            >
              <div class="mb-3 flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-xs font-bold" aria-hidden="true">i</span>
                <h3 class="text-sm font-bold uppercase tracking-wide">Informations importantes</h3>
              </div>
              <ul class="space-y-2 text-sm leading-relaxed text-white/95">
                <li v-for="(line, i) in importantBullets" :key="i" class="flex gap-2">
                  <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" aria-hidden="true" />
                  <span>{{ line }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire -->
      <aside class="lg:sticky lg:top-6">
        <div class="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-6">
          <h2 class="mb-5 text-lg font-bold text-slate-900">Formulaire d’inscription</h2>

          <p v-if="registerError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {{ registerError }}
          </p>
          <p v-if="registerSuccess" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {{ registerSuccess }}
          </p>

          <form class="space-y-5" @submit.prevent="submitRegister">
            <section>
              <div class="mb-3 flex items-center gap-2 text-brandBlue">
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5s5.3 1.5 6.5 4.5" stroke-linecap="round" />
                </svg>
                <h3 class="text-sm font-bold">Informations sur le parent / tuteur</h3>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="block sm:col-span-1">
                  <span class="mb-1.5 block text-sm font-semibold text-brandBlue">
                    Noms &amp; Prénoms <span class="text-red-500">*</span>
                  </span>
                  <input
                    v-model="form.fullName"
                    type="text"
                    required
                    readonly
                    class="w-full rounded-lg border border-brandBlue/35 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
                  >
                </label>
                <label class="block sm:col-span-1">
                  <span class="mb-1.5 block text-sm font-semibold text-brandBlue">
                    Téléphone <span class="text-red-500">*</span>
                  </span>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    readonly
                    class="w-full rounded-lg border border-brandBlue/35 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
                  >
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1.5 block text-sm font-semibold text-brandBlue">
                    E-mail <span class="text-red-500">*</span>
                  </span>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    readonly
                    class="w-full rounded-lg border border-brandBlue/35 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none"
                  >
                </label>
              </div>
            </section>

            <div class="border-t border-dashed border-slate-200" />

            <section>
              <div class="mb-3 flex items-center gap-2 text-brandBlue">
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="16" cy="9" r="2.5" />
                  <path d="M3.5 19c1-2.8 3-4.2 5.5-4.2S13.5 16.2 14.5 19M13 19c.6-1.8 1.8-2.8 3.5-2.8S19.4 17.2 20 19" stroke-linecap="round" />
                </svg>
                <h3 class="text-sm font-bold">Enfants à inscrire</h3>
              </div>
              <p class="mb-2 text-sm font-semibold text-brandBlue">
                Enfant(s) <span class="text-red-500">*</span>
              </p>
              <p v-if="childrenPending" class="text-sm text-slate-500">Chargement des enfants…</p>
              <p v-else-if="!children.length" class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Aucun enfant trouvé sur votre compte.
              </p>
              <ul v-else class="space-y-2">
                <li v-for="c in children" :key="c.id">
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-lg border border-brandBlue/35 bg-white px-3 py-2.5 text-sm text-slate-800 transition hover:border-brandBlue/60"
                    :class="form.childIds.includes(c.id) ? 'border-brandBlue bg-brandBlue/5' : ''"
                  >
                    <input
                      v-model="form.childIds"
                      type="checkbox"
                      :value="c.id"
                      class="h-4 w-4 rounded border-brandBlue text-brandBlue focus:ring-brandBlue/30"
                      :disabled="!!registerSuccess"
                    >
                    <span class="font-medium">{{ c.firstName }} {{ c.lastName }}</span>
                  </label>
                </li>
              </ul>
            </section>

            <div class="border-t border-dashed border-slate-200" />

            <section>
              <div class="mb-3 flex items-center gap-2 text-brandBlue">
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Z" />
                  <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke-linecap="round" />
                </svg>
                <h3 class="text-sm font-bold">Nombre de places</h3>
              </div>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-brandBlue">
                  Nombre de places <span class="text-red-500">*</span>
                </span>
                <div class="relative">
                  <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 10h14v8H5v-8Z" />
                      <path d="M9 10V8a3 3 0 0 1 6 0v2" stroke-linecap="round" />
                    </svg>
                  </span>
                  <select
                    v-model.number="form.places"
                    required
                    class="w-full appearance-none rounded-lg border border-brandBlue/35 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/15"
                    :disabled="!!registerSuccess || maxPlaces < 1"
                  >
                    <option v-for="n in placeOptions" :key="n" :value="n">{{ n }}</option>
                  </select>
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
                <p v-if="workshop.placesRemaining != null" class="mt-1.5 text-xs text-slate-500">
                  {{ workshop.placesRemaining }} place{{ workshop.placesRemaining > 1 ? 's' : '' }} restante{{ workshop.placesRemaining > 1 ? 's' : '' }}
                </p>
              </label>
            </section>

            <button
              v-if="!registerSuccess"
              type="submit"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brandOrange text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="registering || !form.childIds.length || maxPlaces < 1"
            >
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4 20-7Z" stroke-linejoin="round" />
                <path d="M22 2 11 13" stroke-linecap="round" />
              </svg>
              {{ registering ? 'Envoi…' : 'Confirmer mon inscription' }}
            </button>

            <p class="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
              <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" />
              </svg>
              Vos informations sont sécurisées et confidentielles.
            </p>
          </form>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
})

const route = useRoute()
const workshopId = computed(() => String(route.params.id ?? ''))

type WorkshopDetail = {
  id: string
  title: string
  description: string
  importantInfo: string
  image: string
  date: string
  time: string
  age: string
  price: string
  capacity: number
  placesRemaining: number
}

type ChildRow = { id: string; firstName: string; lastName: string }

const { authFetch } = useParentAuth()
const config = useRuntimeConfig()

const workshop = ref<WorkshopDetail | null>(null)

useHead({
  title: computed(() => (workshop.value ? `Inscription — ${workshop.value.title}` : 'Inscription à l’atelier')),
})
const children = ref<ChildRow[]>([])
const pending = ref(true)
const childrenPending = ref(false)
const loadError = ref<string | null>(null)

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  childIds: [] as string[],
  places: 1,
})

const registering = ref(false)
const registerError = ref<string | null>(null)
const registerSuccess = ref<string | null>(null)

const importantBullets = computed(() => {
  const raw = workshop.value?.importantInfo?.trim() || ''
  if (!raw) return []
  return raw
    .split(/\r?\n|•|;/)
    .map((s) => s.replace(/^[-–•*\d.)\s]+/, '').trim())
    .filter(Boolean)
})

const maxPlaces = computed(() => Math.max(0, workshop.value?.placesRemaining ?? 0))

const placeOptions = computed(() => {
  const max = Math.min(Math.max(maxPlaces.value, 1), 10)
  return Array.from({ length: max }, (_, i) => i + 1)
})

function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

async function loadWorkshop() {
  pending.value = true
  loadError.value = null
  try {
    workshop.value = await authFetch<WorkshopDetail>(`/parent/ateliers/${workshopId.value}`)
    if (form.places > maxPlaces.value && maxPlaces.value >= 1) {
      form.places = 1
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger cet atelier.'
    workshop.value = null
  } finally {
    pending.value = false
  }
}

async function loadParentAndChildren() {
  childrenPending.value = true
  try {
    const [me, rows] = await Promise.all([
      authFetch<{ fullName: string | null; email: string; phone: string | null }>('/parent/me'),
      authFetch<ChildRow[]>('/parent/overview'),
    ])
    form.fullName = me.fullName?.trim() || ''
    form.email = me.email || ''
    form.phone = me.phone?.trim() || ''
    children.value = (rows ?? []).map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
    }))
  } catch {
    children.value = []
  } finally {
    childrenPending.value = false
  }
}

async function submitRegister() {
  if (!workshop.value || !form.childIds.length) return
  registering.value = true
  registerError.value = null
  registerSuccess.value = null
  try {
    const res = await authFetch<{ code: string }>(`/parent/ateliers/${workshop.value.id}/register`, {
      method: 'POST',
      body: {
        childIds: form.childIds,
        places: form.places,
      },
    })
    registerSuccess.value = `Inscription enregistrée (${res.code}). Elle est en attente de validation.`
    await loadWorkshop()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    registerError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Inscription impossible.'
  } finally {
    registering.value = false
  }
}

onMounted(() => {
  void loadWorkshop()
  void loadParentAndChildren()
})

watch(workshopId, () => {
  registerSuccess.value = null
  registerError.value = null
  void loadWorkshop()
})
</script>
