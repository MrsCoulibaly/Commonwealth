<template>
  <div class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <h1 class="text-2xl font-bold text-brandBlue">Modifier mon mot de passe</h1>
    <p class="mt-1 text-sm text-slate-500">
      Choisissez un nouveau mot de passe sécurisé (8 caractères minimum).
    </p>
    <p v-if="mustChange" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      Après une réinitialisation, le mot de passe actuel n’est pas demandé : définissez simplement votre
      nouveau mot de passe.
    </p>

    <p v-if="errorMsg" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ errorMsg }}
    </p>
    <p v-if="okMsg" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {{ okMsg }}
    </p>

    <form class="mt-5 space-y-4" @submit.prevent="save">
      <label v-if="!mustChange" class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Mot de passe actuel</span>
        <input
          v-model="form.currentPassword"
          type="password"
          required
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        >
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</span>
        <input
          v-model="form.newPassword"
          type="password"
          required
          minlength="8"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        >
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Confirmation</span>
        <input
          v-model="form.confirmPassword"
          type="password"
          required
          minlength="8"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        >
      </label>
      <div class="pt-2">
        <button
          type="submit"
          class="rounded-xl bg-brandBlue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Enregistrement...' : 'Mettre à jour le mot de passe' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

const { authFetch } = useParentAuth();
const saving = ref(false);
const errorMsg = ref<string | null>(null);
const okMsg = ref<string | null>(null);
const mustChange = ref(false);
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

onMounted(async () => {
  try {
    const me = await authFetch<{ mustChangePassword?: boolean }>('/parent/me');
    mustChange.value = Boolean(me?.mustChangePassword);
  } catch {
    mustChange.value = false;
  }
});

async function save() {
  errorMsg.value = null;
  okMsg.value = null;
  if (form.newPassword !== form.confirmPassword) {
    errorMsg.value = 'La confirmation du mot de passe ne correspond pas.';
    return;
  }
  saving.value = true;
  try {
    await authFetch('/parent/me/password', {
      method: 'PATCH',
      body: {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      },
    });
    okMsg.value = 'Mot de passe mis à jour.';
    mustChange.value = false;
    form.currentPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Mise à jour impossible.';
  } finally {
    saving.value = false;
  }
}
</script>
