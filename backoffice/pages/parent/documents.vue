<template>
  <div>
    <h1 class="mb-2 text-3xl font-bold text-brandBlue">Documents</h1>
    <p class="mb-8 text-sm text-slate-500">
      Documents à destination de votre famille : ceux liés aux niveaux de vos enfants et les ressources générales de l’école.
    </p>

    <div class="space-y-8">
      <section class="rounded-3xl border border-[#bdd7ef] bg-white p-4 shadow-sm sm:p-6">
        <h2 class="mb-4 text-3xl font-semibold text-slate-900">Administratifs</h2>
        <div v-if="pending" class="text-sm text-slate-500">Chargement…</div>
        <template v-else>
          <ul v-if="adminDocs.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="doc in adminDocs" :key="doc.id">
              <article
                class="flex h-full flex-col rounded-2xl border border-sky-100 bg-[#d9eaf7] p-4 text-center"
              >
                <span class="mb-2 inline-flex h-10 w-10 items-center justify-center self-center rounded-lg bg-white text-brandBlue">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </span>
                <span class="flex-1 text-sm font-semibold leading-snug text-slate-900">{{ doc.title }}</span>
                <span
                  v-if="doc.requiresParentSignature"
                  class="mt-2 inline-flex self-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  :class="doc.signatureStatus === 'SIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                >
                  {{ doc.signatureStatus === 'SIGNED' ? 'Signé' : 'À signer' }}
                </span>
                <div class="mt-3 flex flex-col gap-2">
                  <a
                    :href="resolveDocumentUrl(doc.url)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold text-brandBlue hover:underline"
                  >
                    Ouvrir →
                  </a>
                  <button
                    v-if="doc.requiresParentSignature && doc.signatureStatus !== 'SIGNED'"
                    type="button"
                    class="rounded-xl bg-brandBlue px-3 py-2 text-sm font-bold text-white transition hover:brightness-105"
                    @click="openSignModal(doc)"
                  >
                    Signer
                  </button>
                  <button
                    v-else-if="doc.requiresParentSignature && doc.signatureStatus === 'SIGNED'"
                    type="button"
                    class="text-xs font-semibold text-slate-600 hover:text-brandBlue"
                    @click="openSignModal(doc)"
                  >
                    Voir ma signature
                  </button>
                </div>
              </article>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-500">Aucun document administratif pour le moment.</p>
        </template>
      </section>

      <section class="rounded-3xl border border-[#bdd7ef] bg-white p-4 shadow-sm sm:p-6">
        <h2 class="mb-4 text-3xl font-semibold text-slate-900">Scolaire</h2>
        <div v-if="pending" class="text-sm text-slate-500">Chargement…</div>
        <template v-else>
          <ul v-if="schoolDocs.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="doc in schoolDocs" :key="doc.id">
              <article
                class="flex h-full flex-col rounded-2xl border border-sky-100 bg-[#d9eaf7] p-4 text-center"
              >
                <span class="mb-2 inline-flex h-10 w-10 items-center justify-center self-center rounded-lg bg-white text-brandBlue">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                </span>
                <span class="flex-1 text-sm font-semibold leading-snug text-slate-900">{{ doc.title }}</span>
                <span
                  v-if="doc.requiresParentSignature"
                  class="mt-2 inline-flex self-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  :class="doc.signatureStatus === 'SIGNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'"
                >
                  {{ doc.signatureStatus === 'SIGNED' ? 'Signé' : 'À signer' }}
                </span>
                <div class="mt-3 flex flex-col gap-2">
                  <a
                    :href="resolveDocumentUrl(doc.url)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sm font-semibold text-brandBlue hover:underline"
                  >
                    Ouvrir →
                  </a>
                  <button
                    v-if="doc.requiresParentSignature && doc.signatureStatus !== 'SIGNED'"
                    type="button"
                    class="rounded-xl bg-brandBlue px-3 py-2 text-sm font-bold text-white transition hover:brightness-105"
                    @click="openSignModal(doc)"
                  >
                    Signer
                  </button>
                  <button
                    v-else-if="doc.requiresParentSignature && doc.signatureStatus === 'SIGNED'"
                    type="button"
                    class="text-xs font-semibold text-slate-600 hover:text-brandBlue"
                    @click="openSignModal(doc)"
                  >
                    Voir ma signature
                  </button>
                </div>
              </article>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-500">Aucun document scolaire pour le moment.</p>
        </template>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="signDoc"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="closeSignModal()"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-slate-900">{{ signDoc.title }}</h2>
              <p class="mt-1 text-sm text-slate-500">
                {{
                  signDoc.signatureStatus === 'SIGNED'
                    ? 'Votre signature a été enregistrée.'
                    : 'Lisez le document puis signez ci-dessous.'
                }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
              @click="closeSignModal()"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <a
            :href="resolveDocumentUrl(signDoc.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brandBlue/30 bg-brandBlue/5 px-4 py-3 text-sm font-bold text-brandBlue"
          >
            Ouvrir le document
          </a>

          <p v-if="signError" class="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {{ signError }}
          </p>

          <template v-if="signDoc.signatureStatus === 'SIGNED'">
            <div v-if="signDoc.signatureUrl" class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Votre signature</p>
              <img
                :src="resolveDocumentUrl(signDoc.signatureUrl)"
                alt="Signature"
                class="mx-auto max-h-40 object-contain"
              >
            </div>
          </template>
          <template v-else>
            <EnrollmentParentSignature v-model:signature-data-url="signatureDataUrl" />
            <button
              type="button"
              class="mt-4 w-full rounded-xl bg-brandBlue px-4 py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:opacity-50"
              :disabled="signing || !signatureDataUrl"
              @click="submitSignature"
            >
              {{ signing ? 'Enregistrement…' : 'Valider ma signature' }}
            </button>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

type ApiDoc = {
  id: string;
  title: string;
  url: string;
  kind?: 'SCHOOL' | 'ADMIN';
  requiresParentSignature?: boolean;
  signatureStatus?: 'NONE' | 'PENDING' | 'SIGNED';
  signatureUrl?: string | null;
  signedAt?: string | null;
};

const { authFetch } = useParentAuth();
const { resolveDocumentUrl } = useParentDocumentUrl();

const apiDocs = ref<ApiDoc[]>([]);
const pending = ref(true);

const signDoc = ref<ApiDoc | null>(null);
const signatureDataUrl = ref('');
const signing = ref(false);
const signError = ref<string | null>(null);

function rowKind(d: ApiDoc): 'SCHOOL' | 'ADMIN' {
  return d.kind === 'ADMIN' ? 'ADMIN' : 'SCHOOL';
}

const adminDocs = computed(() =>
  apiDocs.value
    .filter((d) => rowKind(d) === 'ADMIN')
    .sort((a, b) => a.title.localeCompare(b.title, 'fr')),
);
const schoolDocs = computed(() =>
  apiDocs.value
    .filter((d) => rowKind(d) === 'SCHOOL')
    .sort((a, b) => a.title.localeCompare(b.title, 'fr')),
);

function openSignModal(doc: ApiDoc) {
  signDoc.value = { ...doc };
  signatureDataUrl.value = '';
  signError.value = null;
}

function closeSignModal(force = false) {
  if (!force && signing.value) return;
  signDoc.value = null;
  signatureDataUrl.value = '';
  signError.value = null;
}

async function submitSignature() {
  if (!signDoc.value || !signatureDataUrl.value) return;
  signing.value = true;
  signError.value = null;
  try {
    const updated = await authFetch<ApiDoc>(`/parent/documents/${signDoc.value.id}/sign`, {
      method: 'POST',
      body: { signatureDataUrl: signatureDataUrl.value },
    });
    apiDocs.value = apiDocs.value.map((d) => (d.id === updated.id ? { ...d, ...updated } : d));
    signDoc.value = { ...signDoc.value, ...updated };
    signatureDataUrl.value = '';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const m = err?.data?.message;
    signError.value = Array.isArray(m) ? m.join(' ') : m || 'Signature impossible.';
  } finally {
    signing.value = false;
  }
}

async function loadDocs() {
  pending.value = true;
  try {
    apiDocs.value = await authFetch<ApiDoc[]>('/parent/documents');
  } catch {
    apiDocs.value = [];
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  void loadDocs();
});
</script>
