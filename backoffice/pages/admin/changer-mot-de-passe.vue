<template>
  <div class="admin-login relative min-h-screen bg-white font-montserrat text-slate-900">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="admin-login__blob admin-login__blob--orange admin-login__blob--tl" />
      <div class="admin-login__blob admin-login__blob--orange admin-login__blob--tr" />
      <div class="admin-login__blob admin-login__blob--blue admin-login__blob--bl" />
    </div>

    <div class="relative z-[1] flex min-h-screen items-center justify-center px-6 py-12">
      <div class="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 class="text-center text-xl font-bold text-[#2271B1]">Nouveau mot de passe</h1>
        <p class="mt-2 text-center text-sm text-slate-500">
          Pour des raisons de sécurité, choisissez un mot de passe personnel avant d’accéder à l’application.
        </p>

        <p v-if="errorMsg" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ errorMsg }}
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="save">
          <label v-if="!forcedChange" class="block">
            <span class="mb-1 block text-sm font-semibold text-[#2271B1]">Mot de passe actuel</span>
            <input
              v-model="form.currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="w-full rounded-lg border border-[#9ec5eb] px-3.5 py-2.5 text-sm outline-none focus:border-[#2271B1] focus:ring-2 focus:ring-[#2271B1]/25"
            >
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-[#2271B1]">Nouveau mot de passe</span>
            <input
              v-model="form.newPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full rounded-lg border border-[#9ec5eb] px-3.5 py-2.5 text-sm outline-none focus:border-[#2271B1] focus:ring-2 focus:ring-[#2271B1]/25"
            >
          </label>
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-[#2271B1]">Confirmation</span>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="w-full rounded-lg border border-[#9ec5eb] px-3.5 py-2.5 text-sm outline-none focus:border-[#2271B1] focus:ring-2 focus:ring-[#2271B1]/25"
            >
          </label>
          <button
            type="submit"
            class="w-full rounded-lg bg-[#2271B1] py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Enregistrement…' : 'Enregistrer et continuer' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['admin'],
})

const auth = useAuth()
const config = useRuntimeConfig()
const forcedChange = computed(() => auth.mustChangePassword.value)

const saving = ref(false)
const errorMsg = ref<string | null>(null)
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function save() {
  errorMsg.value = null
  if (form.newPassword !== form.confirmPassword) {
    errorMsg.value = 'La confirmation ne correspond pas au nouveau mot de passe.'
    return
  }
  const t = auth.token.value
  if (!t) {
    await navigateTo('/admin/login')
    return
  }
  saving.value = true
  try {
    const body: Record<string, string> = { newPassword: form.newPassword }
    if (!forcedChange.value) {
      body.currentPassword = form.currentPassword
    }
    const res = await $fetch<{ accessToken: string }>(`${config.public.apiBase}/auth/admin/me/password`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body,
    })
    auth.setAccessToken(res.accessToken)
    await navigateTo(useAdminPermissions().adminLandingPath())
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    errorMsg.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Mise à jour impossible.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
}
.admin-login__blob {
  position: absolute;
  border-radius: 9999px;
  opacity: 0.35;
}
.admin-login__blob--orange {
  background: #f9994b;
  width: 280px;
  height: 280px;
}
.admin-login__blob--tl {
  top: -80px;
  left: -80px;
}
.admin-login__blob--tr {
  top: -60px;
  right: -100px;
}
.admin-login__blob--blue {
  background: #216ec2;
  width: 320px;
  height: 320px;
}
.admin-login__blob--bl {
  bottom: -120px;
  left: -100px;
}
</style>
