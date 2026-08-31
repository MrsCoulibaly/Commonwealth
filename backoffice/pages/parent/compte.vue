<template>
  <div class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <h1 class="text-2xl font-bold text-brandBlue">Modifier mes infos</h1>
    <p class="mt-1 text-sm text-slate-500">Mettez a jour vos informations de profil.</p>

    <p v-if="errorMsg" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ errorMsg }}
    </p>
    <p v-if="okMsg" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      {{ okMsg }}
    </p>

    <form class="mt-5 space-y-4" @submit.prevent="save">
      <div class="rounded-xl border border-slate-200 p-3">
        <span class="mb-2 block text-sm font-medium text-slate-700">Photo de profil</span>
        <div class="flex items-center gap-3">
          <div class="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-300 bg-slate-50">
            <img
              v-if="photoPreview"
              :src="photoPreview"
              alt="Photo de profil"
              class="h-full w-full rounded-xl object-cover"
            >
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              class="h-10 w-10 text-slate-400"
            >
              <circle cx="12" cy="8" r="3.2" />
              <path d="M5.5 19.2c1.5-3 3.8-4.5 6.5-4.5s5 1.5 6.5 4.5" />
            </svg>
          </div>
          <div class="flex flex-col gap-1">
            <input
              ref="photoInput"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="hidden"
              :disabled="uploadingPhoto"
              @change="onPhotoChange"
            >
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="uploadingPhoto"
              @click="openPhotoPicker"
            >
              {{ uploadingPhoto ? 'Upload...' : 'Changer la photo de profil' }}
            </button>
            <p class="text-xs text-slate-500">PNG, JPG, JPEG ou WEBP (max 5 Mo)</p>
          </div>
        </div>
      </div>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Nom complet</span>
        <input
          v-model.trim="form.fullName"
          type="text"
          required
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        >
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
        <input
          :value="form.email"
          type="email"
          readonly
          class="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
        >
        <span class="mt-1 block text-xs text-slate-500">Adresse utilisée pour la connexion (non modifiable).</span>
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Telephone</span>
        <input
          v-model.trim="form.phone"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        >
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Adresse</span>
        <textarea
          v-model.trim="form.address"
          rows="3"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
        />
      </label>
      <div class="pt-2">
        <button
          type="submit"
          class="rounded-xl bg-brandBlue px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
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

const { authFetch, authHeaders } = useParentAuth();
const config = useRuntimeConfig();
const saving = ref(false);
const uploadingPhoto = ref(false);
const errorMsg = ref<string | null>(null);
const okMsg = ref<string | null>(null);
const photoPreview = ref('');
const photoInput = ref<HTMLInputElement | null>(null);
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  profilePhotoUrl: '',
});

onMounted(async () => {
  try {
    const me = await authFetch<{
      fullName: string | null
      email: string
      phone: string | null
      address: string | null
      profilePhotoUrl: string | null
    }>('/parent/me');
    form.fullName = me?.fullName ?? '';
    form.email = me?.email ?? '';
    form.phone = me?.phone ?? '';
    form.address = me?.address ?? '';
    form.profilePhotoUrl = me?.profilePhotoUrl ?? '';
    photoPreview.value = form.profilePhotoUrl;
  } catch {
    errorMsg.value = 'Impossible de charger vos informations.';
  }
});

async function onPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;
  uploadingPhoto.value = true;
  errorMsg.value = null;
  okMsg.value = null;
  try {
    const fd = new FormData();
    fd.append('file', file);
    const res = await $fetch<{ profilePhotoUrl: string }>(`${config.public.apiBase}/parent/me/photo`, {
      method: 'POST',
      headers: authHeaders(),
      body: fd,
    });
    form.profilePhotoUrl = res?.profilePhotoUrl ?? '';
    photoPreview.value = form.profilePhotoUrl;
    okMsg.value = 'Photo de profil mise a jour.';
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Upload photo impossible.';
  } finally {
    uploadingPhoto.value = false;
    if (input) input.value = '';
  }
}

async function save() {
  saving.value = true;
  errorMsg.value = null;
  okMsg.value = null;
  try {
    await authFetch('/parent/me', {
      method: 'PATCH',
      body: {
        fullName: form.fullName,
        phone: form.phone || null,
        address: form.address || null,
      },
    });
    okMsg.value = 'Informations mises a jour.';
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Mise a jour impossible.';
  } finally {
    saving.value = false;
  }
}

function openPhotoPicker() {
  photoInput.value?.click();
}
</script>
