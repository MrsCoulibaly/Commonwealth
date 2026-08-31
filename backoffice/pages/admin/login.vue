<template>
  <div class="admin-login relative min-h-screen bg-white font-montserrat text-slate-900">
    <!-- Coins sur tout l’écran : orange HG & HD, bleu BG (bas droit blanc) -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="admin-login__blob admin-login__blob--orange admin-login__blob--tl" />
      <div class="admin-login__blob admin-login__blob--orange admin-login__blob--tr" />
      <div class="admin-login__blob admin-login__blob--blue admin-login__blob--bl" />
    </div>

    <div class="relative z-[1] flex min-h-screen flex-col lg:flex-row">
      <!-- Moitié gauche : collage -->
      <div
        class="relative order-1 flex min-h-[340px] w-full shrink-0 overflow-hidden bg-transparent lg:order-none lg:min-h-screen lg:w-1/2 justify-center items-center"
      >
        <div class="flex items-center justify-center">
            <div class="animate-hero-bounce relative isolate w-full max-w-[340px]">
              <img
                class="pointer-events-none absolute -right-16 -top-16 z-0 h-40 w-40 object-cover"
                :src="image5"
                alt=""
                aria-hidden="true"
              />

              <div class="relative z-10 grid grid-cols-2 gap-3">
                <div class="overflow-hidden rounded-2xl">
                  <img class="h-full w-full object-cover" :src="image1" alt="" />
                </div>
                <div class="overflow-hidden rounded-2xl">
                  <img class="h-full w-full object-cover" :src="image2" alt="" />
                </div>
                <div class="overflow-hidden rounded-2xl">
                  <img class="h-full w-full object-cover" :src="image3" alt="" />
                </div>
                <div class="overflow-hidden rounded-2xl">
                  <img class="h-full w-full object-cover" :src="image4" alt="" />
                </div>
              </div>
            </div>
          </div>
      </div>

      <!-- Moitié droite : formulaire -->
      <div
        class="relative order-2 flex w-full flex-1 flex-col justify-center bg-transparent px-10 py-12 sm:px-14 lg:order-none lg:w-1/2 lg:flex-none lg:px-16 xl:px-24"
      >
        <div class="mx-auto w-full max-w-[400px]">
          <div class="mb-10 flex flex-col items-center text-center">
            <img
              :src="logoUrl"
              alt=""
              class="mb-3 h-[4.75rem] w-auto object-contain sm:h-[5.25rem]"
              width="120"
              height="100"
            />
            <p class="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-[#2271B1] sm:text-[1.2rem]">COMMONWEALTH</p>
            <p class="mt-2 bg-[#4CAF50] px-5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white sm:text-[11px]">
              PRESCHOOL OF ABIDJAN
            </p>
          </div>

          <h1 class="mb-8 text-center text-xl font-bold text-[#2271B1] sm:text-[1.4rem]">Connectez-vous</h1>

          <form class="grid gap-[1.35rem]" @submit.prevent="onSubmit">
            <label class="grid gap-1.5">
              <span class="text-[13px] font-semibold text-[#2271B1]">Email</span>
              <input
                v-model="email"
                class="w-full rounded-lg border border-[#9ec5eb] bg-white px-3.5 py-2.5 text-[15px] text-[#1a3d5c] outline-none transition placeholder:text-[#8eb4d9] focus:border-[#2271B1] focus:ring-2 focus:ring-[#2271B1]/25"
                type="email"
                autocomplete="email"
                placeholder="alma.lawson@example.com"
              />
            </label>

            <label class="grid gap-1.5">
              <span class="text-[13px] font-semibold text-[#2271B1]">Mot de passe</span>
              <div class="relative">
                <input
                  v-model="password"
                  class="w-full rounded-lg border border-[#9ec5eb] bg-white py-2.5 pl-3.5 pr-11 text-[15px] text-[#1a3d5c] outline-none transition focus:border-[#2271B1] focus:ring-2 focus:ring-[#2271B1]/25"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#2271B1]"
                  :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" class="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
                      stroke="currentColor"
                      stroke-width="1.75"
                      stroke-linejoin="round"
                    />
                    <circle cx="12" cy="12" r="3.25" stroke="currentColor" stroke-width="1.75" />
                  </svg>
                  <svg v-else class="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.5 10.5a3 3 0 0 0 4.2 4.2M9.2 5.5C10.4 5.2 11.7 5 13 5c7 0 11 7 11 7a19.2 19.2 0 0 1-5.1 5.4M6.2 6.2A19.1 19.1 0 0 0 1 12s4 7 12 7c1.4 0 2.8-.2 4.1-.6"
                      stroke="currentColor"
                      stroke-width="1.75"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
            </label>

            <div class="flex flex-wrap items-center justify-between gap-3 pt-0.5 text-[14px]">
              <label class="flex cursor-pointer items-center gap-2.5 select-none">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="h-[18px] w-[18px] shrink-0 rounded border-2 border-[#2271B1] focus:ring-[#2271B1]/30"
                  style="accent-color: #2271b1"
                />
                <span class="font-medium text-[#2271B1]">Se souvenir moi</span>
              </label>
              <a class="font-semibold text-[#F39233] hover:underline" href="#" @click.prevent>Mot de passe oublié?</a>
            </div>

            <button
              type="submit"
              class="mt-1 w-full rounded-lg bg-[#2271B1] py-3.5 text-[15px] font-bold text-white transition hover:opacity-[0.96] disabled:opacity-60"
              :disabled="pending"
            >
              {{ pending ? 'Connexion…' : 'Connexion' }}
            </button>

            <p v-if="error" class="text-center text-sm font-medium text-[#e65100]">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png'
import image1 from '~/assets/images/image1.png';
import image2 from '~/assets/images/image2.png';
import image3 from '~/assets/images/image3.png';
import image4 from '~/assets/images/image4.png';
import image5 from '~/assets/images/image5.jpg';

definePageMeta({
  layout: false,
  middleware: ['admin-guest'],
})

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap',
    },
  ],
})

const auth = useAuth()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const error = ref<string | null>(null)
const pending = ref(false)

async function onSubmit() {
  error.value = null
  if (pending.value) return
  pending.value = true
  try {
    const result = await auth.login(email.value, password.value, rememberMe.value)
    if (!result.ok) {
      error.value = result.message
      return
    }
    if (result.mustChangePassword) {
      await navigateTo('/admin/changer-mot-de-passe')
      return
    }
    await navigateTo(useAdminPermissions().adminLandingPath())
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', ui-sans-serif, system-ui, sans-serif;
}

/* Bordure bleue fine sur les visuels */
.admin-login__frame {
  border: 2px solid #2271b1;
}
.admin-login__frame--rect {
  border-radius: 1.25rem;
}
.admin-login__frame--circle {
  border-radius: 9999px;
}

/* ~6 × 10 points bleus entre les deux cercles */
.admin-login__dots-6x10 {
  width: calc(6 * 9px);
  height: calc(10 * 9px);
  background-image: radial-gradient(circle, #2271b1 1.35px, transparent 1.35px);
  background-size: 9px 9px;
  background-position: 0 0;
  opacity: 0.85;
}

/* Coins : deux grands oranges en haut, grand bleu en bas à gauche */
.admin-login__blob {
  position: absolute;
  border-radius: 48% 52% 45% 55% / 52% 48% 55% 45%;
}
.admin-login__blob--orange {
  background: #f9994b;
}
.admin-login__blob--blue {
  background: #216ec2;
}
.admin-login__blob--tl {
  width: clamp(140px, 26vmin, 220px);
  height: clamp(140px, 26vmin, 220px);
  left: -7%;
  top: -6%;
  transform: rotate(-11deg);
}
.admin-login__blob--tr {
  width: clamp(140px, 26vmin, 220px);
  height: clamp(140px, 26vmin, 220px);
  right: -6%;
  top: -6%;
  transform: rotate(14deg);
}
.admin-login__blob--bl {
  width: clamp(140px, 26vmin, 220px);
  height: clamp(140px, 26vmin, 220px);
  left: -8%;
  bottom: -7%;
  transform: rotate(7deg);
}
</style>
