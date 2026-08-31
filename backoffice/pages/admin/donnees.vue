<template>
  <div class="mx-auto max-w-4xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Données</h1>
      <p class="mt-1 text-sm text-slate-500">
        Réservé à l’administrateur. Les tables liées sont regroupées : en cocher une met les autres en évidence.
        Cette action est irréversible.
      </p>
    </div>

    <p v-if="errorMsg" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMsg }}</p>
    <p v-if="successMsg" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 whitespace-pre-wrap">{{ successMsg }}</p>

    <div v-if="loading" class="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
      Chargement…
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" @click="selectAll">
          Tout cocher
        </button>
        <button type="button" class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50" @click="selected = []">
          Tout décocher
        </button>
      </div>

      <section
        v-for="group in groups"
        :key="group.id"
        class="rounded-2xl border bg-white p-5 sm:p-6"
        :class="groupIsActive(group)
          ? 'border-amber-400 ring-2 ring-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]'
          : 'border-slate-200'"
      >
        <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-slate-900">{{ group.label }}</h2>
              <span
                v-if="groupIsActive(group)"
                class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
              >
                Liées
              </span>
            </div>
            <p v-if="group.hint" class="mt-1 text-[12px] text-slate-500">{{ group.hint }}</p>
          </div>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            @click="toggleGroup(group)"
          >
            {{ groupAllSelected(group) ? 'Décocher le groupe' : 'Cocher le groupe' }}
          </button>
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <label
            v-for="table in group.items"
            :key="table.key"
            class="flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors"
            :class="tableClass(group, table.key)"
          >
            <input v-model="selected" type="checkbox" :value="table.key" class="mt-1 h-4 w-4 accent-brandOrange" />
            <span>
              <span class="flex items-center gap-2">
                <span class="block text-sm font-medium text-slate-800">{{ table.label }}</span>
                <span
                  v-if="isRelatedHighlight(group, table.key)"
                  class="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900"
                >
                  Associée
                </span>
              </span>
              <span v-if="table.hint" class="mt-0.5 block text-[11px] text-slate-500">{{ table.hint }}</span>
            </span>
          </label>
        </div>
      </section>

      <div class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div class="space-y-3">
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-slate-700">Tapez VIDER pour confirmer</span>
            <input v-model.trim="confirmText" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-red-400" placeholder="VIDER" />
          </label>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="busy || !selected.length || confirmText !== 'VIDER'"
            @click="wipe"
          >
            {{ busy ? 'Suppression…' : `Vider ${selected.length} table${selected.length > 1 ? 's' : ''}` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

type WipeTable = { key: string; label: string; hint?: string; groupId?: string }
type WipeGroup = { id: string; label: string; hint?: string; items: WipeTable[] }

const config = useRuntimeConfig()
const { token } = useAuth()

const loading = ref(true)
const busy = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const groups = ref<WipeGroup[]>([])
const selected = ref<string[]>([])
const confirmText = ref('')

const allTables = computed(() => groups.value.flatMap((g) => g.items))

function authHeaders() {
  const t = token.value
  if (!t) throw new Error('Session expirée. Reconnectez-vous.')
  return { Authorization: `Bearer ${t}` }
}

function groupSelectedKeys(group: WipeGroup) {
  return group.items.map((t) => t.key).filter((k) => selected.value.includes(k))
}

function groupIsActive(group: WipeGroup) {
  return groupSelectedKeys(group).length > 0
}

function groupAllSelected(group: WipeGroup) {
  return group.items.length > 0 && group.items.every((t) => selected.value.includes(t.key))
}

function isRelatedHighlight(group: WipeGroup, key: string) {
  const checked = groupSelectedKeys(group)
  return checked.length > 0 && !checked.includes(key)
}

function tableClass(group: WipeGroup, key: string) {
  if (selected.value.includes(key)) return 'border-brandOrange/50 bg-orange-50'
  if (isRelatedHighlight(group, key)) return 'border-amber-300 bg-amber-50'
  return 'border-slate-100 hover:bg-slate-50'
}

function toggleGroup(group: WipeGroup) {
  const keys = group.items.map((t) => t.key)
  if (groupAllSelected(group)) {
    selected.value = selected.value.filter((k) => !keys.includes(k))
    return
  }
  selected.value = [...new Set([...selected.value, ...keys])]
}

function selectAll() {
  selected.value = allTables.value.map((t) => t.key)
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch<{ items: WipeTable[]; groups?: WipeGroup[] }>(
      `${config.public.apiBase}/admin/data/tables`,
      { headers: authHeaders() },
    )
    if (res.groups?.length) {
      groups.value = res.groups
    } else {
      groups.value = [{ id: 'all', label: 'Tables', items: res.items ?? [] }]
    }
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Impossible de charger les tables.'
  } finally {
    loading.value = false
  }
}

async function wipe() {
  if (!selected.value.length || confirmText.value !== 'VIDER') return
  if (!confirm(`Vider définitivement ${selected.value.length} table(s) ?`)) return
  busy.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await $fetch<{ results: { key: string; deleted: number }[] }>(
      `${config.public.apiBase}/admin/data/wipe`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: { tables: selected.value, confirm: 'VIDER' },
      },
    )
    const lines = (res.results ?? []).map((r) => {
      const label = allTables.value.find((t) => t.key === r.key)?.label ?? r.key
      return `• ${label} : ${r.deleted} ligne(s)`
    })
    successMsg.value = `Tables vidées.\n${lines.join('\n')}`
    confirmText.value = ''
  } catch (e: any) {
    errorMsg.value = e?.data?.message || e?.message || 'Échec de la suppression.'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
