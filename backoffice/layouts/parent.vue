<template>
  <div class="flex min-h-screen flex-col bg-[#e8edf4]">
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white shadow-sm">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NuxtLink to="/parent" class="flex shrink-0 items-center gap-2" aria-label="Espace parent — accueil">
          <img class="h-11 w-auto object-contain" :src="logoUrl" alt="Commonwealth" />
        </NuxtLink>

        <nav class="order-3 flex w-full justify-center gap-4 text-[15px] md:order-2 md:w-auto md:justify-center md:gap-8" aria-label="Espace parent">
          <NuxtLink
            to="/parent"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isAccueil
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Accueil
          </NuxtLink>
          <NuxtLink
            to="/parent/enfants"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isEnfants
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Mes enfants
          </NuxtLink>
          <NuxtLink
            to="/parent/paiements"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isPaiements
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Paiements
          </NuxtLink>
          <NuxtLink
            to="/parent/documents"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isDocuments
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Documents
          </NuxtLink>
          <NuxtLink
            to="/parent/programme"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isProgramme
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Programme
          </NuxtLink>
          <NuxtLink
            to="/parent/ateliers"
            class="border-b-2 py-1 font-medium transition-colors"
            :class="
              isAteliers
                ? 'border-brandOrange text-brandOrange'
                : 'border-transparent text-slate-600 hover:text-brandBlue'
            "
          >
            Ateliers
          </NuxtLink>
        </nav>

        <div class="order-2 flex items-center gap-2 md:order-3 md:gap-3">
          <NuxtLink
            to="/contact"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full text-brandBlue hover:bg-slate-100"
            aria-label="Aide — contact"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" />
              <path
                d="M9.5 9.5a2.5 2.5 0 1 1 4 2c0 2-2 1.75-2 3.5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
              <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
            </svg>
          </NuxtLink>
          <button
            type="button"
            class="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-brandBlue hover:bg-slate-100"
            aria-label="Notifications"
            :aria-expanded="notifDrawerOpen"
            @click="openNotifDrawer"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7Z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linejoin="round"
              />
              <path d="M10.3 21a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
            </svg>
            <span
              v-if="notifUnreadCount > 0"
              class="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brandBlue px-1 text-[10px] font-bold text-white"
            >
              {{ notifUnreadCount > 9 ? '9+' : notifUnreadCount }}
            </span>
          </button>
          <div class="relative flex items-center gap-2" @click.stop>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-semibold text-slate-700 ring-2 ring-white"
              :aria-label="`Profil ${initials}`"
              @click="menuOpen = !menuOpen"
            >
              <img
                v-if="me?.profilePhotoUrl"
                :src="me.profilePhotoUrl"
                alt="Photo de profil"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ initials }}</span>
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 top-11 z-40 min-w-[180px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              <NuxtLink
                to="/parent/compte"
                class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                @click="menuOpen = false"
              >
                Modifier mes infos
              </NuxtLink>
              <NuxtLink
                to="/parent/mot-de-passe"
                class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                @click="menuOpen = false"
              >
                Modifier mon mot de passe
              </NuxtLink>
              <button
                type="button"
                class="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                @click="onLogout"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="me?.mustChangePassword && pathNorm !== '/parent/mot-de-passe'"
      class="border-b border-amber-200 bg-amber-50"
    >
      <p class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm text-amber-950 sm:px-6">
        <span>Un mot de passe provisoire vous a été envoyé. Pensez à le remplacer par un mot de passe personnel.</span>
        <NuxtLink to="/parent/mot-de-passe" class="font-semibold text-brandBlue hover:underline">
          Modifier maintenant
        </NuxtLink>
      </p>
    </div>

    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <slot />
    </main>

    <SiteFooter />

    <Teleport to="body">
      <Transition name="notif-fade">
        <div
          v-if="notifDrawerOpen"
          class="fixed inset-0 z-[100] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" @click="notifDrawerOpen = false" />
          <aside
            class="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 class="text-lg font-semibold text-slate-900">Notifications</h2>
              <div class="flex items-center gap-2">
                <button
                  v-if="notifUnreadCount > 0"
                  type="button"
                  class="text-xs font-medium text-brandBlue hover:underline"
                  @click="markAllNotificationsRead"
                >
                  Tout marquer comme lu
                </button>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Fermer"
                  @click="notifDrawerOpen = false"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto px-3 py-2">
              <p v-if="notifLoading" class="px-2 py-8 text-center text-sm text-slate-500">Chargement…</p>
              <ul v-else-if="notifItems.length" class="space-y-2">
                <li v-for="n in notifItems" :key="n.id">
                  <button
                    type="button"
                    class="flex w-full gap-3 rounded-xl border px-3 py-3 text-left transition hover:bg-slate-50"
                    :class="n.readAt ? 'border-slate-100 bg-white' : 'border-brandBlue/20 bg-sky-50/80'"
                    @click="onNotifClick(n)"
                  >
                    <span
                      class="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brandBlue"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M4 4h16v12H8l-4 4V4Z"
                          stroke="currentColor"
                          stroke-width="1.75"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="flex flex-wrap items-baseline justify-between gap-2">
                        <span class="font-semibold text-slate-900">{{ n.title }}</span>
                        <span class="text-xs text-slate-400">{{ formatNotifTime(n.createdAt) }}</span>
                      </span>
                      <span class="mt-1 block text-sm leading-snug text-slate-600">{{ n.body }}</span>
                    </span>
                  </button>
                </li>
              </ul>
              <p v-else class="px-2 py-12 text-center text-sm text-slate-500">Aucune notification.</p>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import logoUrl from '~/assets/images/logo.png';

type ParentNotif = {
  id: string;
  title: string;
  body: string;
  kind: string | null;
  readAt: string | null;
  createdAt: string;
  enrollmentId: string | null;
};

type NotificationsPayload = {
  items: ParentNotif[];
  unreadCount: number;
  latest: ParentNotif | null;
};

const route = useRoute();
const { authFetch, logout } = useParentAuth();

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const pathNorm = computed(() => {
  const p = route.path.replace(/\/$/, '');
  return p || '/';
});

const isAccueil = computed(() => pathNorm.value === '/parent');
const isEnfants = computed(
  () => pathNorm.value === '/parent/enfants' || pathNorm.value.startsWith('/parent/enfants/'),
);
const isPaiements = computed(() => pathNorm.value === '/parent/paiements');
const isDocuments = computed(() => pathNorm.value === '/parent/documents');
const isProgramme = computed(() => pathNorm.value === '/parent/programme');
const isAteliers = computed(
  () => pathNorm.value === '/parent/ateliers' || pathNorm.value.startsWith('/parent/ateliers/'),
);

const me = ref<{
  fullName: string | null;
  email: string;
  profilePhotoUrl: string | null;
  mustChangePassword?: boolean;
} | null>(null);
const notifUnreadCount = ref(0);
const notifDrawerOpen = ref(false);
const notifItems = ref<ParentNotif[]>([]);
const notifLoading = ref(false);
const menuOpen = ref(false);

const initials = computed(() => {
  const n = me.value?.fullName?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0];
    const b = parts[1]?.[0];
    return ((a ?? '') + (b ?? a ?? '')).toUpperCase().slice(0, 2) || '?';
  }
  const e = me.value?.email?.[0];
  return e?.toUpperCase() ?? '?';
});

async function refreshShell() {
  try {
    me.value = await authFetch<{
      fullName: string | null;
      email: string;
      profilePhotoUrl: string | null;
      mustChangePassword?: boolean;
    }>('/parent/me');
  } catch {
    me.value = null;
  }
  try {
    const payload = await authFetch<NotificationsPayload>('/parent/notifications');
    notifUnreadCount.value = typeof payload?.unreadCount === 'number' ? payload.unreadCount : 0;
    notifItems.value = Array.isArray(payload?.items) ? payload.items : [];
  } catch {
    notifUnreadCount.value = 0;
    notifItems.value = [];
  }
}

async function openNotifDrawer() {
  notifDrawerOpen.value = true;
  notifLoading.value = true;
  try {
    const payload = await authFetch<NotificationsPayload>('/parent/notifications');
    notifUnreadCount.value = typeof payload?.unreadCount === 'number' ? payload.unreadCount : 0;
    notifItems.value = Array.isArray(payload?.items) ? payload.items : [];
  } catch {
    notifItems.value = [];
  } finally {
    notifLoading.value = false;
  }
}

async function onNotifClick(n: ParentNotif) {
  if (n.readAt) return;
  try {
    await authFetch(`/parent/notifications/${n.id}/read`, { method: 'PATCH' });
    const idx = notifItems.value.findIndex((x) => x.id === n.id);
    if (idx >= 0) {
      notifItems.value[idx] = { ...notifItems.value[idx]!, readAt: new Date().toISOString() };
    }
    notifUnreadCount.value = Math.max(0, notifUnreadCount.value - 1);
  } catch {
    /* ignore */
  }
}

async function markAllNotificationsRead() {
  try {
    await authFetch('/parent/notifications/read-all', { method: 'PATCH' });
    notifItems.value = notifItems.value.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }));
    notifUnreadCount.value = 0;
  } catch {
    /* ignore */
  }
}

function formatNotifTime(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Date.now() - t;
  if (diff < 90_000) return 'Maintenant';
  if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function onLogout() {
  menuOpen.value = false;
  logout();
  return navigateTo('/parent/login');
}

function onDocClick() {
  menuOpen.value = false;
}

onMounted(() => {
  void refreshShell();
  document.addEventListener('click', onDocClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocClick);
});

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
    void refreshShell();
  },
);

watch(notifDrawerOpen, (open) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = open ? 'hidden' : '';
});
</script>

<style scoped>
.notif-fade-enter-active,
.notif-fade-leave-active {
  transition: opacity 0.2s ease;
}
.notif-fade-enter-active aside,
.notif-fade-leave-active aside {
  transition: transform 0.22s ease;
}
.notif-fade-enter-from,
.notif-fade-leave-to {
  opacity: 0;
}
.notif-fade-enter-from aside,
.notif-fade-leave-to aside {
  transform: translateX(100%);
}
</style>
