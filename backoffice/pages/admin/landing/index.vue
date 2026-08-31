<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Landing page</h1>
        <p class="mt-1 text-sm text-slate-500">
          Modifiez les textes et images de la page d’accueil (FR / EN).
        </p>
        <p v-if="updatedAt" class="mt-1 text-xs text-slate-400">
          Dernière mise à jour : {{ formatDate(updatedAt) }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          :disabled="busy"
          @click="resetDefaults"
        >
          Réinitialiser
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener"
          class="rounded-xl border border-brandBlue/30 bg-white px-4 py-2 text-sm font-semibold text-brandBlue hover:bg-blue-50"
        >
          Voir le site
        </a>
        <button
          type="button"
          class="rounded-xl bg-brandOrange px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
          :disabled="busy || !content"
          @click="save"
        >
          {{ busy ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </div>

    <p v-if="errorMsg" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</p>
    <p v-if="successMsg" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ successMsg }}</p>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      Chargement…
    </div>

    <template v-else-if="content">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="loc in locales"
          :key="loc"
          type="button"
          class="rounded-full px-4 py-1.5 text-sm font-semibold transition"
          :class="locale === loc ? 'bg-brandBlue text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'"
          @click="locale = loc"
        >
          {{ loc.toUpperCase() }}
        </button>
      </div>

      <div class="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded-lg px-3 py-2 text-sm font-semibold transition"
          :class="activeTab === tab.id ? 'bg-orange-50 text-brandOrange' : 'text-slate-600 hover:bg-slate-50'"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <template v-if="activeTab === 'hero'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.hero.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Sous-titre</span><input v-model="home.hero.subtitle" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Accroche</span><input v-model="home.hero.tagline" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Bouton inscription</span><input v-model="home.hero.cta" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Bouton espace parent</span><input v-model="home.hero.parentSpace" class="field-input" type="text"></label>
        </template>

        <template v-else-if="activeTab === 'about'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.about.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 1</span><textarea v-model="home.about.p1" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 2</span><textarea v-model="home.about.p2" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 3</span><textarea v-model="home.about.p3" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 4</span><textarea v-model="home.about.p4" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 5</span><textarea v-model="home.about.p5" rows="3" class="field-input" /></label>
          <AdminImageUploadBlock
            label="Image À propos"
            :url="String(content.images.about || '')"
            :fallback="defaultAboutImg"
            @upload="uploadKeyed('about', $event)"
            @clear="content.images.about = ''"
          />
        </template>

        <template v-else-if="activeTab === 'approach'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.approach.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 1</span><textarea v-model="home.approach.p1" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 2</span><textarea v-model="home.approach.p2" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 3</span><textarea v-model="home.approach.p3" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 4</span><textarea v-model="home.approach.p4" rows="3" class="field-input" /></label>
          <AdminImageUploadBlock
            label="Image Approche"
            :url="String(content.images.approach || '')"
            :fallback="defaultApproachImg"
            @upload="uploadKeyed('approach', $event)"
            @clear="content.images.approach = ''"
          />
        </template>

        <template v-else-if="activeTab === 'values'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.values.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Introduction</span><textarea v-model="home.values.intro" rows="4" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Partage — titre</span><input v-model="home.values.shareTitle" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Partage — texte</span><textarea v-model="home.values.shareBody" rows="2" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Curiosité — titre</span><input v-model="home.values.curiosityTitle" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Curiosité — texte</span><textarea v-model="home.values.curiosityBody" rows="2" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Collaboration — titre</span><input v-model="home.values.collabTitle" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Collaboration — texte</span><textarea v-model="home.values.collabBody" rows="2" class="field-input" /></label>
        </template>

        <template v-else-if="activeTab === 'workshops'">
          <p class="text-xs text-slate-500">La liste des ateliers reste dans le module Ateliers. Ici : textes d’introduction uniquement.</p>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.workshops.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 1</span><textarea v-model="home.workshops.p1" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Paragraphe 2</span><textarea v-model="home.workshops.p2" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Bouton</span><input v-model="home.workshops.cta" class="field-input" type="text"></label>
        </template>

        <template v-else-if="activeTab === 'gallery'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.gallery.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Bouton</span><input v-model="home.gallery.cta" class="field-input" type="text"></label>
          <div class="grid gap-3 sm:grid-cols-2">
            <AdminImageUploadBlock
              v-for="(fb, i) in defaultGalleryImgs"
              :key="'g'+i"
              :label="`Photo ${i + 1}`"
              :url="gallerySlots[i] || ''"
              :fallback="fb"
              @upload="onGalleryUpload(i, $event)"
              @clear="setGallery(i, '')"
            />
          </div>
        </template>

        <template v-else-if="activeTab === 'partners'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.partners.title" class="field-input" type="text"></label>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AdminImageUploadBlock
              v-for="(fb, i) in defaultPartnerImgs"
              :key="'p'+i"
              :label="`Logo ${i + 1}`"
              :url="partnerSlots[i] || ''"
              :fallback="fb"
              contain
              @upload="onPartnerUpload(i, $event)"
              @clear="setPartner(i, '')"
            />
          </div>
        </template>

        <template v-else-if="activeTab === 'suggestions'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.suggestions.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Texte</span><textarea v-model="home.suggestions.body" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Placeholder</span><input v-model="home.suggestions.placeholder" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Bouton</span><input v-model="home.suggestions.cta" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Message succès</span><input v-model="home.suggestions.success" class="field-input" type="text"></label>
          <AdminImageUploadBlock
            label="Image suggestions"
            :url="String(content.images.suggestions || '')"
            :fallback="defaultSuggestionImg"
            @upload="uploadKeyed('suggestions', $event)"
            @clear="content.images.suggestions = ''"
          />
        </template>

        <template v-else-if="activeTab === 'rentree'">
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre (utilisez &#123;year&#125; pour l’année)</span><input v-model="home.rentree.title" class="field-input" type="text"></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Introduction</span><textarea v-model="home.rentree.intro" rows="3" class="field-input" /></label>
          <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">CTA carte</span><input v-model="home.rentree.cardCta" class="field-input" type="text"></label>
          <div v-for="key in levelKeys" :key="key" class="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p class="text-sm font-bold text-slate-800">Niveau : {{ key }}</p>
            <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Titre</span><input v-model="home.rentree.levels[key].title" class="field-input" type="text"></label>
            <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Description</span><textarea v-model="home.rentree.levels[key].body" rows="2" class="field-input" /></label>
            <label class="block"><span class="mb-1 block text-sm font-medium text-slate-700">Statut</span><input v-model="home.rentree.levels[key].status" class="field-input" type="text"></label>
            <AdminImageUploadBlock
              label="Photo de la carte"
              :url="rentreeImageUrl(key)"
              :fallback="defaultRentreeImg"
              @upload="uploadRentree(key, $event)"
              @clear="clearRentree(key)"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import defaultAboutImg from '~/assets/images/apropos.png'
import defaultApproachImg from '~/assets/images/notreapproche.png'
import defaultSuggestionImg from '~/assets/images/suggestion.png'
import photo1 from '~/assets/images/photo1.png'
import photo2 from '~/assets/images/photo2.png'
import photo3 from '~/assets/images/photo3.png'
import photo4 from '~/assets/images/photo4.png'
import bmw from '~/assets/images/bmw.png'
import sevenWolves from '~/assets/images/7wolves.png'
import domino from '~/assets/images/domino.png'
import gopro from '~/assets/images/gopro.png'
import north from '~/assets/images/north.png'
import pg from '~/assets/images/pg.png'

definePageMeta({ layout: 'admin', middleware: 'admin' })

type Locale = 'fr' | 'en'

const config = useRuntimeConfig()
const { token } = useAuth()

const defaultGalleryImgs = [photo1, photo2, photo3, photo4, defaultAboutImg]
const defaultPartnerImgs = [bmw, sevenWolves, domino, gopro, north, pg]
const defaultRentreeImg = photo1

const locales: Locale[] = ['fr', 'en']
const locale = ref<Locale>('fr')
const activeTab = ref('hero')
const loading = ref(true)
const busy = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const updatedAt = ref<string | null>(null)

const content = ref<{
  fr: Record<string, any>
  en: Record<string, any>
  images: Record<string, any>
} | null>(null)

const gallerySlots = ref<string[]>(['', '', '', '', ''])
const partnerSlots = ref<string[]>(['', '', '', '', '', ''])

const tabs = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'À propos' },
  { id: 'approach', label: 'Approche' },
  { id: 'values', label: 'Valeurs' },
  { id: 'rentree', label: 'Rentrée' },
  { id: 'workshops', label: 'Ateliers' },
  { id: 'gallery', label: 'Galerie' },
  { id: 'partners', label: 'Partenaires' },
  { id: 'suggestions', label: 'Suggestions' },
]

const levelKeys = ['enfants', 'petits', 'moyens', 'grands'] as const

const home = computed(() => content.value?.[locale.value] as Record<string, any>)

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('fr-FR')
  } catch {
    return iso
  }
}

function authHeaders() {
  const t = token.value
  if (!t) throw new Error('Session expirée. Reconnectez-vous.')
  return { Authorization: `Bearer ${t}` }
}

function syncSlotsFromContent() {
  const imgs = content.value?.images ?? {}
  const g = Array.isArray(imgs.gallery) ? imgs.gallery.map(String) : []
  const p = Array.isArray(imgs.partners) ? imgs.partners.map(String) : []
  gallerySlots.value = [...g, '', '', '', '', ''].slice(0, 5)
  partnerSlots.value = [...p, '', '', '', '', '', ''].slice(0, 6)
}

function syncSlotsToContent() {
  if (!content.value) return
  // Les images hero restent fixes côté code (non éditables).
  delete content.value.images.hero
  content.value.images.gallery = gallerySlots.value.filter(Boolean)
  content.value.images.partners = partnerSlots.value.filter(Boolean)
}

function setGallery(i: number, v: string) {
  const next = [...gallerySlots.value]
  next[i] = v
  gallerySlots.value = next
}
function setPartner(i: number, v: string) {
  const next = [...partnerSlots.value]
  next[i] = v
  partnerSlots.value = next
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{
      content: { fr: Record<string, any>; en: Record<string, any>; images: Record<string, any> }
      updatedAt: string
    }>(`${config.public.apiBase}/admin/landing`, { headers: authHeaders() })
    content.value = {
      fr: res.content.fr ?? {},
      en: res.content.en ?? {},
      images: res.content.images ?? {},
    }
    updatedAt.value = res.updatedAt
    syncSlotsFromContent()
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Impossible de charger le contenu.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!content.value) return
  busy.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    syncSlotsToContent()
    const res = await $fetch<{ updatedAt: string }>(`${config.public.apiBase}/admin/landing`, {
      method: 'PUT',
      headers: authHeaders(),
      body: { content: content.value },
    })
    updatedAt.value = res.updatedAt
    successMsg.value = 'Landing enregistrée.'
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Échec de l’enregistrement.'
  } finally {
    busy.value = false
  }
}

async function resetDefaults() {
  if (!confirm('Réinitialiser tout le contenu landing aux valeurs par défaut ?')) return
  busy.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await $fetch<{
      content: { fr: Record<string, any>; en: Record<string, any>; images: Record<string, any> }
      updatedAt: string
    }>(`${config.public.apiBase}/admin/landing/reset`, {
      method: 'POST',
      headers: authHeaders(),
    })
    content.value = {
      fr: res.content.fr ?? {},
      en: res.content.en ?? {},
      images: res.content.images ?? {},
    }
    updatedAt.value = res.updatedAt
    syncSlotsFromContent()
    successMsg.value = 'Contenu réinitialisé.'
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Échec de la réinitialisation.'
  } finally {
    busy.value = false
  }
}

async function uploadFile(file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const up = await $fetch<{ path: string; url: string }>(`${config.public.apiBase}/admin/landing/upload`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  })
  return up.path || up.url
}

async function uploadKeyed(key: 'about' | 'approach' | 'suggestions', file: File) {
  if (!content.value) return
  busy.value = true
  try {
    content.value.images[key] = await uploadFile(file)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Upload échoué.'
  } finally {
    busy.value = false
  }
}

function ensureRentreeImages() {
  if (!content.value) return
  if (!content.value.images.rentree || typeof content.value.images.rentree !== 'object') {
    content.value.images.rentree = {}
  }
}

function rentreeImageUrl(key: (typeof levelKeys)[number]) {
  const map = content.value?.images?.rentree
  if (map && typeof map === 'object') return String(map[key] || '')
  return ''
}

async function uploadRentree(key: (typeof levelKeys)[number], file: File) {
  if (!content.value) return
  busy.value = true
  try {
    ensureRentreeImages()
    content.value.images.rentree[key] = await uploadFile(file)
  } catch (e: any) {
    errorMsg.value = e?.data?.message || 'Upload échoué.'
  } finally {
    busy.value = false
  }
}

function clearRentree(key: (typeof levelKeys)[number]) {
  if (!content.value) return
  ensureRentreeImages()
  content.value.images.rentree[key] = ''
}

async function onGalleryUpload(i: number, file: File) {
  busy.value = true
  try {
    setGallery(i, await uploadFile(file))
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Upload échoué.'
  } finally {
    busy.value = false
  }
}

async function onPartnerUpload(i: number, file: File) {
  busy.value = true
  try {
    setPartner(i, await uploadFile(file))
  } catch (err: any) {
    errorMsg.value = err?.data?.message || 'Upload échoué.'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.field-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.field-input:focus {
  border-color: #1e4d8c;
  box-shadow: 0 0 0 2px rgba(30, 77, 140, 0.2);
}
</style>
