<template>
  <div class="mx-auto max-w-lg pb-10 pt-4">
    <header class="mb-8 text-center sm:mb-10">
      <h1 class="font-serif text-[1.65rem] font-semibold leading-tight tracking-tight text-[#2c3e50] sm:text-[1.85rem]">
        Connexion à votre espace parents
      </h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
        Accédez au suivi des inscriptions de vos enfants avec l’adresse e-mail et le mot de passe
        communiqués après votre pré-inscription.
      </p>
    </header>

    <div
      class="w-full rounded-2xl border border-slate-200/80 bg-white px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:px-10 sm:py-9"
    >
      <form class="grid gap-5" @submit.prevent="onSubmit">
        <label class="grid gap-2">
          <span class="text-[15px] font-semibold text-[#2c3e50]">Adresse Email</span>
          <input
            v-model="email"
            class="w-full rounded-lg border border-[#c5d3e3] bg-white px-3.5 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
            type="email"
            autocomplete="email"
            placeholder="jessica.hanson@example.com"
            required
          />
        </label>

        <label class="grid gap-2">
          <span class="text-[15px] font-semibold text-[#2c3e50]">Mot de passe</span>
          <div class="relative">
            <input
              v-model="password"
              class="w-full rounded-lg border border-[#c5d3e3] bg-white py-3 pl-3.5 pr-11 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-brandBlue hover:bg-slate-100"
              :aria-pressed="showPassword"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75" />
              </svg>
              <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-4.1 5.3M6.1 6.1C3.8 8 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4-1"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </label>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-0.5">
          <label class="flex cursor-pointer items-center gap-2.5 select-none">
            <input
              v-model="rememberMe"
              class="parent-login-checkbox h-[18px] w-[18px] cursor-pointer rounded-full border-2 border-brandBlue accent-brandBlue"
              type="checkbox"
            />
            <span class="text-sm text-slate-500">Se souvenir de moi</span>
          </label>
          <button
            type="button"
            class="text-sm font-medium text-brandBlue hover:underline"
            @click="openForgot"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          type="submit"
          class="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-brandOrange text-[15px] font-bold uppercase tracking-wide text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Connexion…' : 'Connexion' }}
        </button>

        <p v-if="error" class="text-center text-sm text-red-600">{{ error }}</p>
      </form>
    </div>

    <Teleport to="body">
      <div
        v-if="forgotOpen"
        class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[1px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-title"
        @click.self="closeForgot"
      >
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <h2 id="forgot-title" class="text-lg font-semibold text-[#2c3e50]">Mot de passe oublié</h2>
          <p class="mt-2 text-sm leading-relaxed text-slate-500">
            Saisissez l’adresse e-mail de votre espace parent. Nous vous enverrons un mot de passe
            provisoire. Vous pourrez le modifier une fois connecté.
          </p>

          <form class="mt-5 grid gap-4" @submit.prevent="onForgotSubmit">
            <label class="grid gap-2">
              <span class="text-sm font-semibold text-[#2c3e50]">Adresse Email</span>
              <input
                v-model="forgotEmail"
                class="w-full rounded-lg border border-[#c5d3e3] bg-white px-3.5 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/20"
                type="email"
                autocomplete="email"
                required
              />
            </label>
            <p v-if="forgotError" class="text-sm text-red-600">{{ forgotError }}</p>
            <p v-if="forgotOk" class="text-sm text-emerald-700">{{ forgotOk }}</p>
            <div class="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                @click="closeForgot"
              >
                Fermer
              </button>
              <button
                type="submit"
                class="rounded-lg bg-brandOrange px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
                :disabled="forgotLoading"
              >
                {{ forgotLoading ? 'Envoi…' : 'Envoyer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
});

useHead({
  title: 'Espace parent',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const { isLoggedIn, login, requestPasswordReset } = useParentAuth();
const email = ref('');
const password = ref('');
const rememberMe = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const forgotOpen = ref(false);
const forgotEmail = ref('');
const forgotLoading = ref(false);
const forgotError = ref<string | null>(null);
const forgotOk = ref<string | null>(null);

onMounted(() => {
  if (isLoggedIn.value) {
    void navigateTo('/parent');
  }
});

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    await login(email.value.trim().toLowerCase(), password.value.trim(), rememberMe.value);
    await navigateTo('/parent');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    const m = err?.data?.message ?? err?.message;
    error.value = typeof m === 'string' ? m : 'Connexion impossible. Vérifiez vos identifiants.';
  } finally {
    loading.value = false;
  }
}

function openForgot() {
  forgotOpen.value = true;
  forgotError.value = null;
  forgotOk.value = null;
  forgotEmail.value = email.value.trim();
}

function closeForgot() {
  forgotOpen.value = false;
  forgotLoading.value = false;
}

async function onForgotSubmit() {
  forgotError.value = null;
  forgotOk.value = null;
  forgotLoading.value = true;
  try {
    const res = await requestPasswordReset(forgotEmail.value.trim().toLowerCase());
    forgotOk.value =
      res.message ||
      'Si un compte existe, un mot de passe provisoire a été envoyé. Vérifiez aussi les indésirables.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string };
    const m = err?.data?.message ?? err?.message;
    forgotError.value = typeof m === 'string' ? m : 'Envoi impossible. Réessayez plus tard.';
  } finally {
    forgotLoading.value = false;
  }
}
</script>

<style scoped>
/* Ronde type « radio » coché tout en restant une case à cocher (proche de la maquette) */
.parent-login-checkbox {
  appearance: none;
  border-radius: 9999px;
  background: white;
}
.parent-login-checkbox:checked {
  background-color: #216ec2;
  border-color: #216ec2;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 10'%3E%3Cpath fill='none' stroke='white' stroke-width='2' d='M1 5l3.5 3.5L11 1'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 10px 8px;
}
</style>
