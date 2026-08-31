<template>
  <div class="rounded-3xl border-2 border-[#216EC2]/20 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-7">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <span
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#216EC2]/10 text-[#216EC2]"
            aria-hidden="true"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
              <path d="M8 7h8M8 11h8M8 15h5" stroke-linecap="round" />
            </svg>
          </span>
          <h2 class="text-xl font-bold text-slate-900 sm:text-2xl">Carnet de suivi virtuel</h2>
        </div>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          Le journal quotidien de l'enfant tenu par la maîtresse. Chaque note ajoutée est publiée immédiatement
          et visible dans l’espace parent.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#216EC2]/20 transition hover:brightness-105"
        @click="openAddForm"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Ajouter une note
      </button>
    </div>

    <p v-if="loadError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </p>

    <div v-if="pending" class="py-16 text-center text-sm text-slate-500">Chargement du carnet…</div>

    <template v-else>
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="chip in filterChips"
          :key="chip.id"
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
          :class="
            activeFilter === chip.id
              ? 'bg-[#216EC2] text-white shadow-sm'
              : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-[#216EC2]/30'
          "
          @click="activeFilter = chip.id"
        >
          <component :is="chip.icon" v-if="chip.icon" class="h-4 w-4 shrink-0" />
          {{ chip.label }}
        </button>
      </div>

      <p class="mb-6 flex flex-wrap items-center gap-2 text-sm text-emerald-600">
        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="font-semibold">{{ stats.publishedCount }} publié{{ stats.publishedCount > 1 ? 's' : '' }}</span>
        <span class="text-slate-400">—</span>
        <span class="text-slate-500">Les notes publiées apparaissent en temps réel dans l'application des parents.</span>
      </p>

      <div
        v-if="showAddForm"
        class="mb-6 rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-5 sm:p-6"
      >
        <div class="mb-4 flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.id"
            type="button"
            class="inline-flex items-center gap-2 rounded-2xl border-2 px-4 py-2.5 text-sm font-semibold transition"
            :class="
              newNote.category === cat.id
                ? 'border-[#216EC2] bg-white text-[#216EC2] shadow-sm'
                : 'border-transparent bg-white/80 text-slate-600 hover:border-slate-200'
            "
            @click="newNote.category = cat.id"
          >
            <component :is="cat.icon" class="h-4 w-4 shrink-0" />
            {{ cat.label }}
          </button>
        </div>

        <div class="mb-4">
          <p class="mb-2 text-sm font-semibold text-slate-700">Évaluation</p>
          <div class="flex items-center gap-1" role="group" aria-label="Note sur 5">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="rounded-lg p-1 transition hover:scale-110"
              :aria-label="`${star} étoile${star > 1 ? 's' : ''}`"
              @click="newNote.rating = star"
            >
              <svg
                class="h-8 w-8"
                viewBox="0 0 24 24"
                :class="star <= newNote.rating ? 'text-amber-400' : 'text-slate-300'"
                :fill="star <= newNote.rating ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  d="m12 2 2.9 5.88 6.5.95-4.7 4.58 1.1 6.42L12 17.77l-5.8 3.06 1.1-6.42-4.7-4.58 6.5-.95L12 2Z"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
            <span class="ml-2 text-sm font-semibold text-slate-600">
              {{ newNote.rating > 0 ? `${newNote.rating}/5` : 'Choisir…' }}
            </span>
          </div>
          <p class="mt-2 text-xs text-slate-500">Le commentaire est optionnel.</p>
        </div>

        <textarea
          v-model="newNote.content"
          rows="3"
          class="w-full resize-y rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
          placeholder="Commentaire optionnel…"
        />
        <p v-if="formError" class="mt-3 text-sm text-red-600">{{ formError }}</p>
        <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            :disabled="saving"
            @click="cancelAddForm"
          >
            Annuler
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
            :disabled="saving"
            @click="saveNewNote"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <div v-if="!filteredGroups.length" class="rounded-2xl border border-dashed border-slate-200 py-14 text-center">
        <p class="text-sm font-medium text-slate-600">Aucune note pour le moment.</p>
        <p class="mt-1 text-sm text-slate-400">Ajoutez une note pour commencer le carnet de suivi.</p>
      </div>

      <div v-else class="space-y-8">
        <section v-for="group in filteredGroups" :key="group.dateKey">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <h3 class="text-lg font-bold text-slate-900">{{ group.dateLabel }}</h3>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {{ group.notes.length }} note{{ group.notes.length > 1 ? 's' : '' }}
              </span>
            </div>
            <button
              v-if="group.draftCount > 0"
              type="button"
              class="inline-flex items-center justify-center rounded-2xl border-2 border-[#216EC2]/30 bg-[#216EC2]/5 px-4 py-2 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/10 disabled:opacity-50"
              :disabled="publishingDay === group.dateKey"
              @click="publishDay(group.dateKey)"
            >
              {{ publishingDay === group.dateKey ? 'Publication…' : 'Publier la journée' }}
            </button>
          </div>

          <div class="space-y-3">
            <article
              v-for="note in group.notes"
              :key="note.id"
              class="flex flex-col gap-4 rounded-3xl border-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              :class="noteCardClass(note)"
            >
              <div class="flex min-w-0 flex-1 gap-4">
                <span
                  class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  :class="categoryMeta(note.category).iconWrapClass"
                  aria-hidden="true"
                >
                  <component :is="categoryMeta(note.category).icon" class="h-5 w-5" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-bold text-slate-900">{{ categoryMeta(note.category).label }}</span>
                    <span class="text-sm font-medium text-slate-500">{{ note.timeLabel }}</span>
                    <span
                      v-if="note.rating != null"
                      class="inline-flex items-center gap-0.5 text-amber-500"
                      :aria-label="`${note.rating} sur 5`"
                    >
                      <svg
                        v-for="star in 5"
                        :key="star"
                        class="h-4 w-4"
                        viewBox="0 0 24 24"
                        :fill="star <= note.rating! ? 'currentColor' : 'none'"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <path
                          d="m12 2 2.9 5.88 6.5.95-4.7 4.58 1.1 6.42L12 17.77l-5.8 3.06 1.1-6.42-4.7-4.58 6.5-.95L12 2Z"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      class="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      :class="
                        note.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ note.status === 'PUBLISHED' ? 'Publié' : 'Brouillon' }}
                    </span>
                  </div>
                  <p v-if="note.content" class="mt-2 text-sm leading-relaxed text-slate-700">{{ note.content }}</p>
                </div>
              </div>

              <div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                <button
                  v-if="note.status === 'DRAFT'"
                  type="button"
                  class="inline-flex items-center justify-center rounded-2xl border-2 border-[#216EC2] bg-white px-4 py-2 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5 disabled:opacity-50"
                  :disabled="actionNoteId === note.id"
                  @click="publishNote(note.id)"
                >
                  Publier aux parents
                </button>
                <button
                  v-else
                  type="button"
                  class="inline-flex items-center justify-center rounded-2xl border-2 border-emerald-500 bg-white px-4 py-2 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                  :disabled="actionNoteId === note.id"
                  @click="unpublishNote(note.id)"
                >
                  Retirer la publication
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  aria-label="Supprimer la note"
                  :disabled="actionNoteId === note.id"
                  @click="deleteNote(note.id)"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M10 11v6M14 11v6" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

export type FollowUpCategory = 'ACTIVITY' | 'MEAL' | 'NAP' | 'MOOD' | 'CARE'

export type FollowUpNote = {
  id: string
  category: FollowUpCategory
  content: string
  rating: number | null
  status: 'DRAFT' | 'PUBLISHED'
  noteDate: string
  timeLabel: string
  createdAt: string
  publishedAt: string | null
}

type FollowUpListDto = {
  items: FollowUpNote[]
  stats: { draftCount: number; publishedCount: number }
}

const props = defineProps<{
  childId: string
}>()

const emit = defineEmits<{
  stats: [stats: { draftCount: number; publishedCount: number }]
}>()

const { token } = useAuth()
const config = useRuntimeConfig()

const notes = ref<FollowUpNote[]>([])
const stats = ref({ draftCount: 0, publishedCount: 0 })
const pending = ref(true)
const loadError = ref<string | null>(null)
const showAddForm = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const actionNoteId = ref<string | null>(null)
const publishingDay = ref<string | null>(null)
const activeFilter = ref<'all' | FollowUpCategory>('all')

const newNote = reactive({
  category: 'ACTIVITY' as FollowUpCategory,
  rating: 0,
  content: '',
})

function iconStar() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'm12 2 2.9 5.88 6.5.95-4.7 4.58 1.1 6.42L12 17.77l-5.8 3.06 1.1-6.42-4.7-4.58 6.5-.95L12 2Z',
      'stroke-linejoin': 'round',
    }),
  ])
}

function iconMeal() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M8 3v8a4 4 0 0 0 8 0V3', 'stroke-linecap': 'round' }),
    h('path', { d: 'M12 11v10', 'stroke-linecap': 'round' }),
    h('path', { d: 'M18 7v14', 'stroke-linecap': 'round' }),
  ])
}

function iconMoon() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M21 14.5A8.5 8.5 0 1 1 9.5 3 6.5 6.5 0 0 0 21 14.5Z', 'stroke-linejoin': 'round' }),
  ])
}

function iconMood() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '9' }),
    h('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2', 'stroke-linecap': 'round' }),
    h('circle', { cx: '9', cy: '10', r: '0.75', fill: 'currentColor', stroke: 'none' }),
    h('circle', { cx: '15', cy: '10', r: '0.75', fill: 'currentColor', stroke: 'none' }),
  ])
}

function iconHeart() {
  return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', {
      d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z',
      'stroke-linejoin': 'round',
    }),
  ])
}

const categories = [
  { id: 'ACTIVITY' as const, label: 'Activité', icon: iconStar },
  { id: 'MEAL' as const, label: 'Repas', icon: iconMeal },
  { id: 'NAP' as const, label: 'Sieste', icon: iconMoon },
  { id: 'MOOD' as const, label: 'Humeur', icon: iconMood },
  { id: 'CARE' as const, label: 'Soin', icon: iconHeart },
]

const filterChips = computed(() => [
  { id: 'all' as const, label: 'Toutes les catégories', icon: null },
  ...categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
])

function categoryMeta(category: FollowUpCategory) {
  const map: Record<
    FollowUpCategory,
    { label: string; icon: () => ReturnType<typeof h>; iconWrapClass: string; publishedBg: string }
  > = {
    ACTIVITY: {
      label: 'Activité',
      icon: iconStar,
      iconWrapClass: 'bg-[#216EC2]/10 text-[#216EC2]',
      publishedBg: 'border-[#216EC2]/15 bg-[#216EC2]/5',
    },
    MEAL: {
      label: 'Repas',
      icon: iconMeal,
      iconWrapClass: 'bg-emerald-100 text-emerald-600',
      publishedBg: 'border-emerald-200 bg-emerald-50/80',
    },
    NAP: {
      label: 'Sieste',
      icon: iconMoon,
      iconWrapClass: 'bg-violet-100 text-violet-600',
      publishedBg: 'border-violet-200 bg-violet-50/80',
    },
    MOOD: {
      label: 'Humeur',
      icon: iconMood,
      iconWrapClass: 'bg-amber-100 text-amber-600',
      publishedBg: 'border-amber-200 bg-amber-50/80',
    },
    CARE: {
      label: 'Soin',
      icon: iconHeart,
      iconWrapClass: 'bg-rose-100 text-rose-600',
      publishedBg: 'border-rose-200 bg-rose-50/80',
    },
  }
  return map[category]
}

function noteCardClass(note: FollowUpNote) {
  if (note.status === 'PUBLISHED') {
    return categoryMeta(note.category).publishedBg
  }
  return 'border-slate-200 bg-white'
}

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(dt)
}

const filteredNotes = computed(() => {
  if (activeFilter.value === 'all') return notes.value
  return notes.value.filter((n) => n.category === activeFilter.value)
})

const filteredGroups = computed(() => {
  const map = new Map<string, FollowUpNote[]>()
  for (const note of filteredNotes.value) {
    const list = map.get(note.noteDate) ?? []
    list.push(note)
    map.set(note.noteDate, list)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dayNotes]) => ({
      dateKey,
      dateLabel: formatDateLabel(dateKey),
      notes: dayNotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      draftCount: dayNotes.filter((n) => n.status === 'DRAFT').length,
    }))
})

function applyList(data: FollowUpListDto) {
  notes.value = data.items ?? []
  stats.value = data.stats ?? { draftCount: 0, publishedCount: 0 }
  emit('stats', stats.value)
}

async function loadNotes() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  pending.value = true
  loadError.value = null
  try {
    const data = await $fetch<FollowUpListDto>(
      `${config.public.apiBase}/admin/students/${id}/follow-up-notes`,
      { headers: { Authorization: `Bearer ${t}` } },
    )
    applyList(data)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger le carnet.'
    notes.value = []
    stats.value = { draftCount: 0, publishedCount: 0 }
    emit('stats', stats.value)
  } finally {
    pending.value = false
  }
}

function openAddForm() {
  formError.value = null
  newNote.category = 'ACTIVITY'
  newNote.rating = 0
  newNote.content = ''
  showAddForm.value = true
}

function cancelAddForm() {
  if (saving.value) return
  showAddForm.value = false
  formError.value = null
}

async function saveNewNote() {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  if (newNote.rating < 1 || newNote.rating > 5) {
    formError.value = 'Choisissez une note entre 1 et 5 étoiles.'
    return
  }
  const content = newNote.content.trim()
  saving.value = true
  formError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/students/${id}/follow-up-notes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: { category: newNote.category, rating: newNote.rating, content },
    })
    showAddForm.value = false
    newNote.content = ''
    newNote.rating = 0
    await loadNotes()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    formError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Enregistrement impossible.'
  } finally {
    saving.value = false
  }
}

async function publishNote(noteId: string) {
  await patchNoteStatus(noteId, 'PUBLISHED')
}

async function unpublishNote(noteId: string) {
  await patchNoteStatus(noteId, 'DRAFT')
}

async function patchNoteStatus(noteId: string, status: 'DRAFT' | 'PUBLISHED') {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  actionNoteId.value = noteId
  try {
    await $fetch(`${config.public.apiBase}/admin/students/${id}/follow-up-notes/${noteId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: { status },
    })
    await loadNotes()
  } catch {
    loadError.value = 'Action impossible sur cette note.'
  } finally {
    actionNoteId.value = null
  }
}

async function deleteNote(noteId: string) {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  if (!import.meta.client || !window.confirm('Supprimer cette note ?')) return
  actionNoteId.value = noteId
  try {
    await $fetch(`${config.public.apiBase}/admin/students/${id}/follow-up-notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${t}` },
    })
    await loadNotes()
  } catch {
    loadError.value = 'Suppression impossible.'
  } finally {
    actionNoteId.value = null
  }
}

async function publishDay(dateKey: string) {
  const t = token.value
  const id = props.childId
  if (!t || !id) return
  publishingDay.value = dateKey
  try {
    const data = await $fetch<FollowUpListDto>(
      `${config.public.apiBase}/admin/students/${id}/follow-up-notes/publish-day`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        body: { noteDate: dateKey },
      },
    )
    applyList(data)
  } catch {
    loadError.value = 'Publication de la journée impossible.'
  } finally {
    publishingDay.value = null
  }
}

watch(
  () => [props.childId, token.value] as const,
  () => {
    if (token.value && props.childId) void loadNotes()
  },
  { immediate: true },
)
</script>
