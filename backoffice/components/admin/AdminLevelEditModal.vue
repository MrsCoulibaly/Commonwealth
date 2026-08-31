<template>
  <div
    class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-slate-900">Modifier le niveau</h3>
      <p class="mt-1 text-sm text-slate-500">
        Nom, ordre d'affichage et horaires avec leurs tarifs pour {{ schoolYearLabel }}.
        Les frais de scolarité (une fois) et la mensualité s’appliquent toujours.
        Sans échéancier : une facture annuelle = scolarité + mensualité × 10 mois.
        Avec échéancier : une facture de scolarité + une facture par mois.
      </p>

      <div class="mt-5 space-y-5">
        <div class="grid gap-4 sm:grid-cols-[1fr_6rem]">
          <label class="block">
            <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Nom du niveau</span>
            <input
              v-model.trim="levelName"
              type="text"
              required
              class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="Ex. Crèche, CP…"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Ordre</span>
            <input
              v-model.number="levelOrder"
              type="number"
              step="1"
              class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              placeholder="1"
            />
          </label>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Horaires & tarifs</p>
            <p class="text-xs text-slate-400">{{ rows.length }} horaire{{ rows.length > 1 ? 's' : '' }}</p>
          </div>

          <div
            v-for="(row, index) in rows"
            :key="index"
            class="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Horaire {{ index + 1 }}</p>
              <button
                v-if="rows.length > 1"
                type="button"
                class="text-xs font-semibold text-red-600 hover:underline"
                @click="removeRow(index)"
              >
                Retirer
              </button>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-xs font-semibold text-slate-600">Libellé</span>
                <input
                  v-model.trim="row.label"
                  type="text"
                  required
                  class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Temps plein"
                />
              </label>
              <label class="block sm:col-span-2">
                <span class="mb-1 block text-xs font-semibold text-slate-600">Plage horaire</span>
                <input
                  v-model.trim="row.timeDescription"
                  type="text"
                  class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="8h00 – 17h00"
                />
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-slate-600">Frais de scolarité (XOF)</span>
                <input v-model.number="row.annualXof" type="number" min="0" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-semibold text-slate-600">Mensualité (XOF)</span>
                <input v-model.number="row.monthlyXof" type="number" min="0" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </label>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-[#216EC2] hover:bg-[#216EC2]/5"
            @click="addRow"
          >
            + Ajouter un horaire
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="$emit('close')"
        >
          Annuler
        </button>
        <button
          type="button"
          class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ScheduleRowDraft = {
  label: string;
  timeDescription: string;
  annualXof: number;
  monthlyXof: number;
  order: number;
};

export type LevelEditPayload = {
  name: string;
  order: number | null;
  schedules: ScheduleRowDraft[];
};

const props = defineProps<{
  initialName: string;
  initialOrder: number | null;
  schoolYearLabel: string;
  initialRows: ScheduleRowDraft[];
  saving?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: LevelEditPayload];
}>();

const levelName = ref('');
const levelOrder = ref<number | null>(null);
const rows = ref<ScheduleRowDraft[]>([]);

watch(
  () => [props.initialName, props.initialOrder, props.initialRows] as const,
  ([name, order, value]) => {
    levelName.value = name;
    levelOrder.value = order;
    rows.value = value.length
      ? value.map((r, i) => ({ ...r, order: r.order || i + 1 }))
      : [{ label: '', timeDescription: '', annualXof: 0, monthlyXof: 0, order: 1 }];
  },
  { immediate: true },
);

function addRow() {
  rows.value.push({
    label: '',
    timeDescription: '',
    annualXof: 0,
    monthlyXof: 0,
    order: rows.value.length + 1,
  });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
}

function save() {
  const name = levelName.value.trim();
  if (!name) return;

  const schedules = rows.value
    .map((r, i) => ({
      label: r.label.trim(),
      timeDescription: r.timeDescription.trim(),
      annualXof: Number(r.annualXof) || 0,
      monthlyXof: Number(r.monthlyXof) || 0,
      order: i + 1,
    }))
    .filter((r) => r.label);

  if (!schedules.length) return;

  const order =
    levelOrder.value === null || levelOrder.value === undefined || Number.isNaN(Number(levelOrder.value))
      ? null
      : Number(levelOrder.value);

  emit('save', { name, order, schedules });
}
</script>
