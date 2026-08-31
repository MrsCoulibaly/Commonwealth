<template>
  <div class="w-full bg-white">
    <section class="w-full bg-white py-14">
      <RevealSection extra-class="mx-auto w-full max-w-[980px] px-6">
        <div class="text-center">
          <h1 class="text-[28px] font-extrabold tracking-tight text-brandBlue">Contactez {{ school.displayName }}</h1>
          <p class="mx-auto mt-4 max-w-[760px] text-sm leading-6 text-slate-500">
            Une question sur l'inscription, la scolarité ou la vie de l'école&nbsp;? Écrivez-nous ou contactez
            directement la direction.
          </p>
        </div>

        <div class="mt-10 rounded-3xl bg-brandBlue p-10 shadow-[0_22px_60px_rgba(2,6,23,0.16)]">
          <div class="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr]">
            <div class="text-white">
              <div class="text-xl font-extrabold">Contactez-nous</div>
              <p class="mt-2 text-xs leading-5 text-white/80">
                Notre équipe vous répond dans les meilleurs délais pour toute demande d'information ou de rendez-vous.
              </p>

              <ul class="mt-6 space-y-4 text-sm text-white/95">
                <li class="flex gap-3">
                  <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
                      <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z" stroke="currentColor" stroke-width="2" />
                      <path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </span>
                  <span>{{ school.address }}</span>
                </li>
                <li class="flex gap-3">
                  <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
                      <path d="M6.5 3h3l1.2 5-2 1.6c1.2 2.4 3.1 4.3 5.5 5.5l1.6-2 5 1.2v3c0 1.1-.9 2-2 2C10.6 20.5 3.5 13.4 3.5 4.8c0-1 .9-1.8 2-1.8Z" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </span>
                  <a :href="phoneTel" class="font-semibold hover:underline">{{ school.phone }}</a>
                </li>
                <li class="flex gap-3">
                  <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
                      <path d="M4 6h16v12H4V6Z" stroke="currentColor" stroke-width="2" />
                      <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2" />
                    </svg>
                  </span>
                  <a :href="mailto" class="font-semibold hover:underline">{{ school.directionEmail }}</a>
                </li>
              </ul>

              <form class="mt-7 space-y-4" @submit.prevent="onSubmit">
                <div>
                  <label class="mb-2 block text-[11px] font-semibold text-white/90">Noms &amp; Prénoms</label>
                  <input
                    v-model.trim="form.fullName"
                    class="h-10 w-full rounded-lg border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50"
                    type="text"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-[11px] font-semibold text-white/90">E-mail</label>
                  <input
                    v-model.trim="form.email"
                    class="h-10 w-full rounded-lg border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50"
                    type="email"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-[11px] font-semibold text-white/90">Numéro de téléphone</label>
                  <input
                    v-model.trim="form.phone"
                    class="h-10 w-full rounded-lg border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50"
                    type="tel"
                  />
                </div>

                <div>
                  <label class="mb-2 block text-[11px] font-semibold text-white/90">Message</label>
                  <textarea
                    v-model.trim="form.message"
                    class="min-h-[96px] w-full resize-none rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/50"
                    placeholder="Votre message ici"
                  />
                </div>

                <button
                  class="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-brandOrange px-6 text-[12px] font-semibold text-white hover:brightness-95"
                  type="submit"
                >
                  <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
                    <path d="M22 2 11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                  </svg>
                  Envoyer le message
                </button>
              </form>
            </div>

            <div class="relative min-h-[420px] overflow-hidden rounded-2xl bg-white/10">
              <img class="absolute inset-0 h-full w-full object-cover" src="/assets/images/contact.png" alt="Contact" loading="lazy" />
            </div>
          </div>
        </div>
      </RevealSection>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSchoolContact } from '~/composables/useSchoolContact';
import { emailToMailtoHref, phoneToTelHref } from '~/utils/school-contact';

definePageMeta({
  layout: 'marketing',
});

useHead({
  title: 'Contact',
});

const school = useSchoolContact();
const phoneTel = computed(() => phoneToTelHref(school.value.phone));
const mailto = computed(() => emailToMailtoHref(school.value.directionEmail));

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  message: '',
});

const onSubmit = () => {
  // Placeholder: later we will POST to backend
  // eslint-disable-next-line no-console
  console.log('contact_submit', JSON.parse(JSON.stringify(form)));
};
</script>
