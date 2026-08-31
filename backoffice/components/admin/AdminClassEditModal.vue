<template>
  <div
    class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-slate-900">Modifier la classe</h3>
      <p class="mt-1 text-sm text-slate-500">
        Nom, enseignant et effectif maximum pour {{ schoolYearLabel }}.
      </p>

      <form class="mt-5 space-y-4" @submit.prevent="save">
        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Niveau</span>
          <input
            :value="initialLevelName"
            type="text"
            readonly
            class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Nom de la classe</span>
          <input
            v-model.trim="className"
            type="text"
            required
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Ex. Crèche A"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Enseignant principal</span>
          <select v-model="headTeacher" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="">— Sélectionner —</option>
            <option v-for="s in staffOptions" :key="s.id" :value="s.label">{{ s.label }}</option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Effectif maximum</span>
          <input
            v-model.number="capacity"
            type="number"
            :min="Math.max(1, initialStudentCount)"
            required
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
          <span v-if="initialStudentCount > 0" class="mt-1 block text-xs text-slate-500">
            {{ initialStudentCount }} élève{{ initialStudentCount > 1 ? 's' : '' }} inscrit{{ initialStudentCount > 1 ? 's' : '' }} — l'effectif ne peut pas être inférieur.
          </span>
        </label>

        <p v-if="validationError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ validationError }}
        </p>
        <p v-if="serverError" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ serverError }}
        </p>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            @click="$emit('close')"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ClassEditPayload = {
  name: string;
  headTeacher: string;
  capacity: number;
};

type StaffOption = { id: string; label: string };

const props = defineProps<{
  initialLevelName: string;
  initialName: string;
  initialHeadTeacher: string;
  initialCapacity: number;
  initialStudentCount: number;
  schoolYearLabel: string;
  staffOptions: StaffOption[];
  saving?: boolean;
  serverError?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: ClassEditPayload];
}>();

const className = ref('');
const headTeacher = ref('');
const capacity = ref(22);
const validationError = ref('');

function resetFromProps() {
  className.value = props.initialName;
  headTeacher.value = props.initialHeadTeacher;
  capacity.value = props.initialCapacity;
  validationError.value = '';
}

watch(() => props.initialName, resetFromProps, { immediate: true });

function save() {
  validationError.value = '';

  const name = className.value.trim();
  if (!name) {
    validationError.value = 'Le nom de la classe est obligatoire.';
    return;
  }

  const nextCapacity = Number(capacity.value);
  if (!Number.isInteger(nextCapacity) || nextCapacity < 1) {
    validationError.value = "L'effectif maximum doit être un entier positif.";
    return;
  }

  if (nextCapacity < props.initialStudentCount) {
    validationError.value = `L'effectif ne peut pas être inférieur au nombre d'élèves inscrits (${props.initialStudentCount}).`;
    return;
  }

  emit('save', {
    name,
    headTeacher: headTeacher.value.trim(),
    capacity: nextCapacity,
  });
}
</script>
