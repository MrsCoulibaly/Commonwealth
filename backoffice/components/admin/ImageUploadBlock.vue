<template>
  <div class="rounded-xl border border-dashed border-slate-200 p-3">
    <p class="mb-2 text-xs font-semibold text-slate-600">{{ label }}</p>
    <img
      v-if="displaySrc"
      :src="displaySrc"
      class="mb-2 h-28 w-full rounded-lg object-cover"
      :class="{ 'object-contain bg-slate-50': contain }"
      alt=""
    />
    <div v-else class="mb-2 flex h-28 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
      Aucune image
    </div>
    <p v-if="!url && fallback" class="mb-2 text-[11px] text-slate-400">Image actuelle du site (par défaut)</p>
    <p v-else-if="url" class="mb-2 text-[11px] text-emerald-600">Image personnalisée</p>
    <div class="flex gap-2">
      <label class="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
        Changer
        <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="onFile" />
      </label>
      <button
        v-if="url"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        @click="emit('clear')"
      >
        Revenir au défaut
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    url?: string
    fallback?: string
    contain?: boolean
  }>(),
  { url: '', fallback: '', contain: false },
)
const emit = defineEmits<{ upload: [file: File]; clear: [] }>()

const config = useRuntimeConfig()

function resolveUrl(u: string) {
  const s = String(u ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s) || s.startsWith('data:') || s.startsWith('/') || s.startsWith('blob:')) {
    // Nuxt asset imports are absolute paths or hashed URLs; /uploads need API host
    if (s.startsWith('/uploads')) {
      const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
      return `${base}${s}`
    }
    return s
  }
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${s.startsWith('/') ? s : `/${s}`}`
}

const displaySrc = computed(() => {
  const custom = resolveUrl(props.url)
  if (custom) return custom
  return props.fallback || ''
})

function onFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file)
}
</script>
