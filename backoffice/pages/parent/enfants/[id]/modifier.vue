<template>
  <div class="mx-auto max-w-3xl">
    <h1 class="text-3xl font-bold leading-tight text-brandBlue sm:text-[2rem]">Modifier les informations</h1>
    <p class="mb-8 mt-3 text-[15px] leading-relaxed text-slate-500">
      Complétez ou corrigez les renseignements ci-dessous. Les champs marqués comme obligatoires doivent rester
      renseignés pour que la fiche reste à jour auprès de l’école.
    </p>

    <div v-if="pending" class="rounded-2xl bg-white/80 px-6 py-12 text-center text-slate-500 shadow-sm">
      Chargement…
    </div>
    <div v-else-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {{ loadError }}
    </div>

    <div
      v-else
      class="overflow-hidden rounded-2xl border-2 border-brandBlue bg-white shadow-[0_6px_32px_rgba(33,110,194,0.08)]"
    >
      <div class="border-b border-slate-100 px-6 py-5 sm:px-10 sm:py-6">
        <h2 class="text-lg font-bold text-slate-900 sm:text-xl">
          Modification
          <span v-if="childNumber != null" class="font-bold text-slate-800">
            (enfant n°{{ childNumber }})
          </span>
        </h2>
      </div>

      <form class="px-6 py-8 sm:px-10 sm:py-10" @submit.prevent="onSubmit">
        <div class="mx-auto grid max-w-xl gap-6">
          <label class="grid gap-2.5">
            <span class="text-[15px] font-bold text-[#2c3e50]">Nom de l’enfant</span>
            <input
              v-model="form.lastName"
              class="modifier-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-900 caret-brandBlue outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-4 focus:ring-brandBlue/15"
              type="text"
              autocomplete="family-name"
              required
            />
          </label>
          <label class="grid gap-2.5">
            <span class="text-[15px] font-bold text-[#2c3e50]">Prénom de l’enfant</span>
            <input
              v-model="form.firstName"
              class="modifier-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-900 caret-brandBlue outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-4 focus:ring-brandBlue/15"
              type="text"
              autocomplete="given-name"
              required
            />
          </label>
          <label class="grid gap-2.5">
            <span class="text-[15px] font-bold text-[#2c3e50]">Date de naissance</span>
            <input
              v-model="form.birthDate"
              class="modifier-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-900 caret-brandBlue outline-none transition focus:border-brandBlue focus:ring-4 focus:ring-brandBlue/15"
              type="date"
            />
          </label>
          <label class="grid gap-2.5">
            <span class="text-[15px] font-bold text-[#2c3e50]">Genre</span>
            <div class="relative">
              <select
                v-model="form.gender"
                class="modifier-input w-full appearance-none rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 text-[15px] text-slate-900 outline-none transition focus:border-brandBlue focus:ring-4 focus:ring-brandBlue/15"
              >
                <option value="FEMALE">Fille</option>
                <option value="MALE">Garçon</option>
                <option value="UNSPECIFIED">Non précisé</option>
              </select>
              <span
                class="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-slate-300"
                aria-hidden="true"
              >
                ▾
              </span>
              <span
                class="pointer-events-none absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-brandBlue"
                aria-hidden="true"
              >
                <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </label>
          <label class="grid gap-2.5">
            <span class="text-[15px] font-bold text-[#2c3e50]">Allergie</span>
            <input
              v-model="form.allergies"
              class="modifier-input w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-[15px] text-slate-900 caret-brandBlue outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-4 focus:ring-brandBlue/15"
              type="text"
              placeholder="Ex. Aucune, arachides…"
            />
          </label>
        </div>

        <p v-if="submitError" class="mx-auto mt-6 max-w-xl text-sm text-red-600">{{ submitError }}</p>
        <p v-if="submitOk" class="mx-auto mt-6 max-w-xl text-sm font-medium text-emerald-700">
          Modifications enregistrées.
        </p>

        <div class="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="submit"
            class="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-brandOrange px-5 text-base font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50 sm:order-1"
            :disabled="submitting"
          >
            Modifier
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-red-500 px-5 text-base font-bold text-white shadow-md transition hover:bg-red-600 active:scale-[0.99] sm:order-2"
            @click="onCancel"
          >
            Annuler
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

type Gender = 'FEMALE' | 'MALE' | 'UNSPECIFIED';

definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

const route = useRoute();
const childId = computed(() => String(route.params.id ?? ''));

const { authFetch } = useParentAuth();

type ChildPayload = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: Gender;
  allergies: string | null;
  childNumber: number | null;
};

const pending = ref(true);
const loadError = ref<string | null>(null);
const childNumber = ref<number | null>(null);
const submitting = ref(false);
const submitError = ref<string | null>(null);
const submitOk = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: 'UNSPECIFIED' as Gender,
  allergies: '',
});

function birthToInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function load() {
  if (!childId.value) return;
  pending.value = true;
  loadError.value = null;
  try {
    const c = await authFetch<ChildPayload>(`/parent/children/${childId.value}`);
    childNumber.value = c.childNumber;
    form.firstName = c.firstName;
    form.lastName = c.lastName;
    form.birthDate = birthToInput(c.birthDate);
    form.gender = c.gender;
    form.allergies = c.allergies?.trim() ?? '';
  } catch {
    loadError.value = 'Enfant introuvable ou accès refusé.';
  } finally {
    pending.value = false;
  }
}

async function onSubmit() {
  submitError.value = null;
  submitOk.value = false;
  submitting.value = true;
  try {
    await authFetch(`/parent/children/${childId.value}`, {
      method: 'PATCH',
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        birthDate: form.birthDate || null,
        gender: form.gender,
        allergies: form.allergies.trim() || null,
      },
    });
    submitOk.value = true;
    window.setTimeout(() => {
      submitOk.value = false;
    }, 4000);
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const m = err?.data?.message;
    submitError.value = Array.isArray(m) ? m.join(' ') : m || 'Enregistrement impossible.';
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  return navigateTo('/parent/enfants');
}

watch(childId, () => load(), { immediate: true });
</script>

<style scoped>
/* Calendrier natif : icône discrète à droite comme sur la maquette */
.modifier-input[type='date']::-webkit-calendar-picker-indicator {
  opacity: 0.55;
  cursor: pointer;
  filter: hue-rotate(15deg);
}
</style>
