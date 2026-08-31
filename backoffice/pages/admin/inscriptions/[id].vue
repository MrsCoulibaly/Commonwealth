<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center gap-3">
      <NuxtLink
        to="/admin/inscriptions"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
        aria-label="Retour à la liste"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </NuxtLink>
      <h1 class="text-2xl font-bold text-[#216EC2]">Suivi de la demande d'inscription</h1>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>
    <p v-if="actionMessage" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      {{ actionMessage }}
    </p>
    <p v-if="actionError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ actionError }}</p>

    <Teleport to="body">
      <div v-if="confirmModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
        <div
          class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="closeConfirmModal"
        />
        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="confirmModal === 'approve' ? 'confirm-approve-title' : 'confirm-reject-title'"
          class="relative w-full max-w-[480px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2
              v-if="confirmModal === 'approve'"
              id="confirm-approve-title"
              class="text-xl font-bold tracking-tight text-slate-900"
            >
              Valider la demande
            </h2>
            <h2 v-else id="confirm-reject-title" class="text-xl font-bold tracking-tight text-slate-900">
              Rejeter la demande
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
              aria-label="Fermer"
              @click="closeConfirmModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <p v-if="confirmModal === 'approve'" class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Voulez-vous vraiment valider l’inscription de
            <span class="font-semibold text-slate-800">{{ childFullName }}</span>
            <template v-if="classOrLevelName !== '—'">
              ({{ classOrLevelName }}{{ schoolYearLabel !== '—' ? ` · ${schoolYearLabel}` : '' }})
            </template>
            &nbsp;? La facturation sera générée si les barèmes sont configurés.
          </p>
          <template v-else>
            <p class="mb-4 text-center text-[15px] leading-relaxed text-slate-500">
              Voulez-vous vraiment rejeter cette demande&nbsp;?
            </p>
            <label class="mb-6 block">
              <span class="mb-1.5 block text-left text-xs font-semibold text-slate-500">Motif du refus (optionnel)</span>
              <textarea
                v-model="rejectNote"
                rows="3"
                class="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                placeholder="Précisez le motif…"
              />
            </label>
          </template>

          <div class="flex gap-3 sm:gap-4">
            <template v-if="confirmModal === 'approve'">
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
                :disabled="actionLoading"
                @click="submitApprove"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                Valider
              </button>
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3B71CA] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
                :disabled="actionLoading"
                @click="closeConfirmModal"
              >
                Annuler
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                  <line x1="17" y1="8" x2="22" y2="13" stroke-linecap="round" />
                  <line x1="22" y1="8" x2="17" y2="13" stroke-linecap="round" />
                </svg>
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FDE8E4] py-3.5 text-sm font-bold text-[#D93025] shadow-sm transition hover:opacity-90 disabled:opacity-50"
                :disabled="actionLoading"
                @click="submitReject"
              >
                Rejeter
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[#D93025] text-white">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3B71CA] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
                :disabled="actionLoading"
                @click="closeConfirmModal"
              >
                Annuler
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                  <line x1="17" y1="8" x2="22" y2="13" stroke-linecap="round" />
                  <line x1="22" y1="8" x2="17" y2="13" stroke-linecap="round" />
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Cartes statistiques (alignées liste) -->
    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border-2 border-[#216EC2]/30 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-600">{{ card.title }}</h2>
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            :class="card.iconBg"
            v-html="card.icon"
          />
        </div>
        <p class="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
          <span v-if="pending" class="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
        <p class="mt-1 text-xs font-medium text-slate-400">Total cumulé</p>
      </article>
    </section>

    <template v-if="!pending && enrollment">
      <section>
        <div class="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-xl font-bold text-[#216EC2] sm:text-2xl">
            Informations de la demande
            <span v-if="childFullName !== '—'" class="block text-base font-semibold text-slate-700 sm:inline sm:text-xl">
              <span class="hidden sm:inline"> — </span>{{ childFullName }}
            </span>
          </h2>
          <div v-if="enrollment.status === 'PENDING'" class="flex flex-wrap gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-[#216EC2]/40 bg-white px-5 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5 disabled:opacity-50"
              :disabled="actionLoading"
              @click="dossierEditOpen = true"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9" stroke-linecap="round" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Modifier le dossier
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="actionLoading"
              @click="openApproveModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Valider
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
              :disabled="actionLoading"
              @click="openRejectModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
              Rejeter
            </button>
          </div>
          <p v-else class="text-sm font-semibold text-slate-600">
            <span v-if="enrollment.status === 'APPROVED'" class="text-emerald-700">Inscription validée</span>
            <span v-else-if="enrollment.status === 'REJECTED'" class="text-red-700">Inscription rejetée</span>
          </p>
        </div>

        <div class="grid gap-4 p-5 lg:grid-cols-3">
          <!-- Élève -->
          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Informations de l'élève</h3>
            <div class="mb-4 flex items-center gap-3">
              <img
                v-if="childPhoto"
                :src="childPhoto"
                :alt="childFullName"
                class="h-14 w-14 rounded-xl object-cover ring-1 ring-[#216EC2]/20"
              />
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]"
                aria-hidden="true"
              >
                <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xl font-bold text-slate-900">{{ childFullName }}</p>
                <p class="text-xs font-medium text-slate-500">{{ classOrLevelName }}</p>
              </div>
            </div>
            <ul class="space-y-4 text-sm text-slate-700">
              <li v-for="row in studentRows" :key="row.label" class="flex gap-3">
                <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                  <p class="font-medium whitespace-pre-wrap">{{ row.value }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Parent -->
          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Information du parent inscripteur</h3>
            <div class="mb-4 flex flex-wrap items-center gap-2">
              <p class="text-xl font-bold text-slate-900">{{ parentName }}</p>
              <span
                v-if="parentRelationLabel !== '—'"
                class="rounded-full bg-[#216EC2]/10 px-2.5 py-0.5 text-xs font-semibold text-[#216EC2]"
                >{{ parentRelationLabel }}</span
              >
            </div>
            <div v-if="parentPhone || parentEmail" class="mb-4 flex gap-2">
              <a
                v-if="parentPhone"
                :href="`tel:${parentPhoneRaw}`"
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#216EC2] text-white transition hover:brightness-105"
                aria-label="Appeler"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                  />
                </svg>
              </a>
              <a
                v-if="parentEmail"
                :href="`mailto:${parentEmail}`"
                class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#216EC2] text-white transition hover:brightness-105"
                aria-label="Envoyer un message"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </a>
            </div>
            <ul class="space-y-4 text-sm text-slate-700">
              <li v-for="row in parentRows" :key="row.label" class="flex gap-3">
                <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                  <p class="font-medium break-all whitespace-pre-wrap">{{ row.value }}</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Statut -->
          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Statut de la demande</h3>
            <ol class="space-y-4">
              <li v-for="step in timelineSteps" :key="step.key" class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  :class="step.iconWrap"
                  v-html="step.iconSvg"
                />
                <div class="min-w-0 pt-1">
                  <p class="text-sm font-semibold" :class="step.textClass">{{ step.label }}</p>
                  <p v-if="step.sub" class="text-xs text-slate-500">{{ step.sub }}</p>
                </div>
              </li>
            </ol>
            <button
              type="button"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#216EC2] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
              @click="shareByEmail"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m22 2-7 20-4-9-9-4Z" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M22 2 11 13" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Partager par E-mail
            </button>
          </div>
        </div>

        <div class="grid gap-4 px-5 pb-5 lg:grid-cols-3">
          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Famille & contacts</h3>
            <ul class="space-y-4 text-sm text-slate-700">
              <li v-for="row in familyRows" :key="row.label" class="flex gap-3">
                <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                  <p class="font-medium whitespace-pre-wrap">{{ row.value }}</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Santé</h3>
            <ul class="space-y-4 text-sm text-slate-700">
              <li v-for="row in healthRows" :key="row.label" class="flex gap-3">
                <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                  <p class="font-medium whitespace-pre-wrap">{{ row.value }}</p>
                </div>
              </li>
            </ul>
            <ul v-if="vaccinationRows.length" class="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <li
                v-for="vax in vaccinationRows"
                :key="vax.name"
                class="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span class="font-medium text-slate-800">{{ vax.name }}</span>
                <span
                  class="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                  :class="vax.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'"
                >
                  {{ vax.done ? vax.dateLabel || 'À jour' : 'Manquant' }}
                </span>
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Options & autorisations</h3>
            <ul class="space-y-4 text-sm text-slate-700">
              <li v-for="row in optionsRows" :key="row.label" class="flex gap-3">
                <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                <div class="min-w-0">
                  <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                  <p class="font-medium whitespace-pre-wrap">{{ row.value }}</p>
                </div>
              </li>
            </ul>
            <div v-if="authorizationTags.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in authorizationTags"
                :key="tag.label"
                class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                :class="tag.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ tag.ok ? 'Oui' : 'Non' }} · {{ tag.label }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="engagementRows.length || engagementSignature" class="px-5 pb-5">
          <div class="rounded-2xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
            <h3 class="mb-4 text-sm font-bold text-[#216EC2]">Engagement & signature</h3>
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
              <ul class="space-y-4 text-sm text-slate-700">
                <li v-for="row in engagementRows" :key="row.label" class="flex gap-3">
                  <span class="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" v-html="row.icon" />
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-[#216EC2]">{{ row.label }}</p>
                    <p class="font-medium whitespace-pre-wrap">{{ row.value }}</p>
                  </div>
                </li>
              </ul>
              <img
                v-if="engagementSignature"
                :src="engagementSignature"
                alt="Signature du parent"
                class="max-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 object-contain p-2"
              />
            </div>
          </div>
        </div>

        <div v-if="enrollment.status === 'APPROVED'" class="border-t border-slate-100 px-5 pb-5 pt-2">
          <div class="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 to-white p-5 shadow-sm">
            <div class="mb-3 flex flex-wrap items-start gap-3">
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"
                aria-hidden="true"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </span>
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-bold text-slate-900">Facturation</h3>
                <p class="mt-1 text-sm leading-relaxed text-slate-600">
                  Supprime les lignes <strong class="text-slate-800">non payées</strong>, puis les recrée selon le
                  <strong class="text-slate-800">paramétrage actuel</strong> et le mode de paiement du parent
                  (facture annuelle par défaut, ou scolarité + mensualités si échéancier). Les paiements déjà encaissés ne sont pas modifiés.
                </p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-50 disabled:opacity-50"
              :disabled="billingLoading"
              @click="regenerateBilling"
            >
              <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M21 21v-5h-5" />
              </svg>
              {{ billingLoading ? 'Régénération…' : 'Supprimer et régénérer la facturation' }}
            </button>
          </div>
        </div>
      </section>
    </template>

    <AdminEnrollmentDossierEdit
      v-if="dossierEditOpen && enrollment && token"
      :enrollment="enrollment"
      :token="token || ''"
      @close="dossierEditOpen = false"
      @saved="onDossierSaved"
    />
  </div>
</template>

<script setup lang="ts">
import AdminEnrollmentDossierEdit from '~/components/admin/AdminEnrollmentDossierEdit.vue'
import { ENROLLMENT_AUTHORIZATIONS } from '~/utils/enrollment-options'
import { bloodGroupLabel } from '~/utils/enrollment-health'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type Stats = { total: number; pending: number; approved: number; rejected: number }

type EnrollmentDetail = {
  id: string
  status: string
  createdAt: string
  schoolYear: string
  wizardData?: Record<string, unknown> | null
  pendingParentEmail: string | null
  pendingParentFirstName: string | null
  pendingParentLastName: string | null
  pendingParentPhone: string | null
  pendingParentRelation: 'FATHER' | 'MOTHER' | null
  pendingParentAddress: string | null
  child: {
    id?: string
    firstName: string
    lastName: string
    birthDate: string | null
    gender: string
    photoUrl?: string | null
    allergies?: string | null
    parent: {
      fullName: string | null
      email: string
      phone: string | null
      parentRelation: 'FATHER' | 'MOTHER' | null
      address: string | null
    } | null
    healthRecord?: {
      bloodGroup: string | null
      doctorName: string | null
      doctorPhone: string | null
      knownAllergies: string | null
      ongoingTreatments: string | null
      dietaryRegime: string | null
      instructions: string | null
      vaccinations?: Array<{
        name: string
        status: string
        vaccinatedAt: string | null
      }>
    } | null
  }
  level: { id: string; name: string }
  class: { name: string } | null
  schedule?: { id: string; label: string; timeDescription: string | null } | null
  serviceSubscriptions?: Array<{
    serviceTariffId?: string
    variantId?: string | null
    serviceTariff: { id?: string; label: string; code: string }
    variant?: { id?: string; label: string } | null
  }>
}

type DetailDto = {
  stats: Stats
  enrollment: EnrollmentDetail
}

const route = useRoute()
const { token } = useAuth()
const config = useRuntimeConfig()

const id = computed(() => String(route.params.id ?? ''))

const detail = ref<DetailDto | null>(null)
const loadError = ref<string | null>(null)
const pending = ref(true)

const actionLoading = ref(false)
const actionError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const billingLoading = ref(false)

const confirmModal = ref<null | 'approve' | 'reject'>(null)
const rejectNote = ref('')
const dossierEditOpen = ref(false)

function closeConfirmModal() {
  confirmModal.value = null
}

function openApproveModal() {
  confirmModal.value = 'approve'
}

function openRejectModal() {
  rejectNote.value = ''
  confirmModal.value = 'reject'
}

const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const enrollment = computed(() => detail.value?.enrollment ?? null)

const statCards = computed(() => {
  const s = detail.value?.stats
  return [
    {
      key: 'total',
      title: 'Total Inscriptions',
      value: s != null ? intFr.format(s.total) : '—',
      iconBg: 'bg-[#216EC2]/10 text-[#216EC2]',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    },
    {
      key: 'pending',
      title: 'Inscriptions en cours',
      value: s != null ? intFr.format(s.pending) : '—',
      iconBg: 'bg-amber-100 text-amber-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    },
    {
      key: 'approved',
      title: 'Inscriptions retenues',
      value: s != null ? intFr.format(s.approved) : '—',
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8l3 3-6 6"/><path d="M22 11l-3-3"/></svg>`,
    },
    {
      key: 'rejected',
      title: 'Inscriptions rejetées',
      value: s != null ? intFr.format(s.rejected) : '—',
      iconBg: 'bg-red-100 text-red-600',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="17" y1="8" x2="22" y2="13" stroke-linecap="round"/><line x1="22" y1="8" x2="17" y2="13" stroke-linecap="round"/></svg>`,
    },
  ]
})

function formatSchoolYearLabel(schoolYear: string): string {
  const s = schoolYear.trim()
  if (s.includes('-') && s.length >= 9) return s.replace(/(\d{4})-(\d{4})/, '$1 - $2')
  return s
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

function ageLabelDetailed(birthDate: string | null): string {
  if (!birthDate) return '—'
  const bd = new Date(birthDate)
  if (Number.isNaN(bd.getTime())) return '—'
  const now = new Date()
  let months = (now.getFullYear() - bd.getFullYear()) * 12 + (now.getMonth() - bd.getMonth())
  if (now.getDate() < bd.getDate()) months -= 1
  if (months < 0) return '—'
  if (months < 12) {
    if (months === 0) return '< 1 mois'
    return `${months} mois`
  }
  const years = Math.floor(months / 12)
  return `${years} an${years > 1 ? 's' : ''}`
}

const schoolYearLabel = computed(() =>
  enrollment.value ? formatSchoolYearLabel(enrollment.value.schoolYear) : '—',
)

const classOrLevelName = computed(() => {
  const e = enrollment.value
  if (!e) return '—'
  return e.class?.name ?? e.level.name
})

const genderLabel = computed(() => {
  const g = enrollment.value?.child.gender
  if (g === 'FEMALE') return 'Fille'
  if (g === 'MALE') return 'Garçon'
  return '—'
})

const birthDisplay = computed(() => {
  const e = enrollment.value?.child
  if (!e?.birthDate) return ageLabelDetailed(null)
  const d = new Date(e.birthDate)
  if (Number.isNaN(d.getTime())) return '—'
  const dateStr = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
  return `${dateStr} (${ageLabelDetailed(e.birthDate)})`
})

const parentName = computed(() => {
  const e = enrollment.value
  if (!e) return '—'
  const p = e.child.parent
  if (p?.fullName?.trim()) return p.fullName.trim()
  const parts = [e.pendingParentFirstName, e.pendingParentLastName].filter(Boolean) as string[]
  if (parts.length) return parts.join(' ')
  return '—'
})

const parentRelationLabel = computed(() => {
  const e = enrollment.value
  if (!e) return '—'
  const rel = e.pendingParentRelation ?? e.child.parent?.parentRelation
  if (rel === 'FATHER') return 'Père'
  if (rel === 'MOTHER') return 'Mère'
  return '—'
})

const parentEmail = computed(() => {
  const e = enrollment.value
  if (!e) return ''
  return (e.child.parent?.email ?? e.pendingParentEmail ?? '').trim()
})

const parentPhone = computed(() => {
  const e = enrollment.value
  if (!e) return ''
  return (e.child.parent?.phone ?? e.pendingParentPhone ?? '').trim()
})

const parentPhoneRaw = computed(() => parentPhone.value.replace(/\s/g, ''))

const parentAddress = computed(() => {
  const e = enrollment.value
  if (!e) return '—'
  const fromUser = e.child.parent?.address?.trim()
  if (fromUser) return fromUser
  const pending = e.pendingParentAddress?.trim()
  return pending || '—'
})

const childFullName = computed(() => {
  const c = enrollment.value?.child
  if (!c) return '—'
  const name = `${c.firstName} ${c.lastName}`.trim()
  return name || '—'
})

type InfoRow = { label: string; value: string; icon: string }

const ICON = {
  calendar: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  school: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>`,
  bag: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  pin: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  mail: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`,
  user: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  users: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  heart: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 12.572l-7.5 7.428-7.5-7.428a5 5 0 1 1 7.5-6.566 5 5 0 0 1 7.5 6.566z"/></svg>`,
  clock: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" stroke-linecap="round"/></svg>`,
  check: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  brief: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
  flag: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  file: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
}

function dash(v: unknown): string {
  const s = String(v ?? '').trim()
  return s || '—'
}

function mediaUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

type WizardSlice = {
  childExtras?: {
    birthPlace?: string
    nationality?: string
    homeLanguages?: string
    matricule?: string
    childAddress?: string
    previousSchool?: string
  }
  parentExtras?: { profession?: string }
  guardian2?: { fullName?: string; relation?: string; phone?: string; email?: string }
  emergency?: { source?: string; fullName?: string; relation?: string; phone?: string }
  options?: {
    scheduleLabel?: string
    comment?: string
    authorizations?: {
      photosInternal?: boolean
      photosCommunication?: boolean
      outings?: boolean
      firstAid?: boolean
    }
  }
  engagement?: {
    certified?: boolean
    signedPlace?: string
    signedAt?: string
    signatureMode?: string
    parentSignatureUrl?: string
  }
}

const wizard = computed((): WizardSlice => {
  const raw = enrollment.value?.wizardData
  if (!raw || typeof raw !== 'object') return {}
  return raw as WizardSlice
})

const childPhoto = computed(() => mediaUrl(enrollment.value?.child.photoUrl))

const studentRows = computed((): InfoRow[] => {
  const e = enrollment.value
  if (!e) return []
  const extras = wizard.value.childExtras ?? {}
  return [
    { label: 'Demandé le', value: formatDate(e.createdAt), icon: ICON.calendar },
    { label: 'Date de naissance', value: birthDisplay.value, icon: ICON.calendar },
    { label: 'Lieu de naissance', value: dash(extras.birthPlace), icon: ICON.pin },
    { label: 'Nationalité', value: dash(extras.nationality), icon: ICON.flag },
    { label: 'Genre', value: genderLabel.value, icon: ICON.user },
    { label: 'Langue(s) à la maison', value: dash(extras.homeLanguages), icon: ICON.file },
    { label: 'Classe demandée', value: classOrLevelName.value, icon: ICON.school },
    { label: 'Année scolaire', value: schoolYearLabel.value, icon: ICON.bag },
    { label: 'Matricule', value: dash(extras.matricule), icon: ICON.file },
    { label: 'Adresse de l’enfant', value: dash(extras.childAddress), icon: ICON.pin },
    { label: 'École précédente', value: dash(extras.previousSchool), icon: ICON.school },
  ]
})

const parentRows = computed((): InfoRow[] => [
  { label: 'Profession', value: dash(wizard.value.parentExtras?.profession), icon: ICON.brief },
  { label: 'Adresse', value: parentAddress.value, icon: ICON.pin },
  { label: 'E-mail', value: dash(parentEmail.value), icon: ICON.mail },
  { label: 'Numéro de téléphone', value: dash(parentPhone.value), icon: ICON.phone },
])

const familyRows = computed((): InfoRow[] => {
  const g2 = wizard.value.guardian2
  const em = wizard.value.emergency
  const g2Line = [g2?.fullName, g2?.relation, g2?.phone, g2?.email].filter((x) => String(x ?? '').trim()).join('\n')
  const emLine = [em?.fullName, em?.relation, em?.phone].filter((x) => String(x ?? '').trim()).join('\n')
  return [
    { label: 'Parent / responsable 1', value: `${parentName.value}${parentRelationLabel.value !== '—' ? ` · ${parentRelationLabel.value}` : ''}`, icon: ICON.user },
    { label: 'Parent / responsable 2', value: dash(g2Line), icon: ICON.users },
    { label: 'Contact d’urgence', value: dash(emLine), icon: ICON.phone },
  ]
})

const healthRows = computed((): InfoRow[] => {
  const h = enrollment.value?.child.healthRecord
  const allergies = h?.knownAllergies?.trim() || enrollment.value?.child.allergies?.trim() || ''
  return [
    { label: 'Médecin référent', value: dash(h?.doctorName), icon: ICON.heart },
    { label: 'Téléphone du cabinet', value: dash(h?.doctorPhone), icon: ICON.phone },
    { label: 'Groupe sanguin', value: h?.bloodGroup ? bloodGroupLabel(h.bloodGroup) : '—', icon: ICON.heart },
    { label: 'Allergies', value: dash(allergies), icon: ICON.heart },
    { label: 'Traitements en cours', value: dash(h?.ongoingTreatments), icon: ICON.file },
    { label: 'Régime alimentaire', value: dash(h?.dietaryRegime), icon: ICON.file },
    { label: 'Consigne équipe', value: dash(h?.instructions), icon: ICON.file },
  ]
})

const vaccinationRows = computed(() => {
  const list = enrollment.value?.child.healthRecord?.vaccinations ?? []
  return list.map((v) => {
    const done = String(v.status ?? '').toUpperCase() === 'DONE' || Boolean(v.vaccinatedAt)
    let dateLabel = ''
    if (v.vaccinatedAt) {
      const d = new Date(v.vaccinatedAt)
      if (!Number.isNaN(d.getTime())) {
        dateLabel = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    }
    return { name: v.name, done, dateLabel }
  })
})

const optionsRows = computed((): InfoRow[] => {
  const e = enrollment.value
  const scheduleLabel =
    e?.schedule?.label ||
    wizard.value.options?.scheduleLabel ||
    ''
  const scheduleTime = e?.schedule?.timeDescription?.trim()
  const journee = [scheduleLabel, scheduleTime].filter(Boolean).join(' · ')
  const services = (e?.serviceSubscriptions ?? []).map((s) =>
    s.variant?.label ? `${s.serviceTariff.label} — ${s.variant.label}` : s.serviceTariff.label,
  )
  return [
    { label: 'Formule / journée', value: dash(journee), icon: ICON.clock },
    { label: 'Services choisis', value: services.length ? services.join('\n') : 'Aucun', icon: ICON.bag },
    { label: 'Commentaire', value: dash(wizard.value.options?.comment), icon: ICON.file },
  ]
})

const authorizationTags = computed(() => {
  const auth = wizard.value.options?.authorizations
  if (!auth) return []
  return ENROLLMENT_AUTHORIZATIONS.map((a) => ({
    label: a.title,
    ok: Boolean(auth[a.key]),
  }))
})

const engagementSignature = computed(() => mediaUrl(wizard.value.engagement?.parentSignatureUrl))

const engagementRows = computed((): InfoRow[] => {
  const eng = wizard.value.engagement
  if (!eng) return []
  const mode =
    eng.signatureMode === 'handwritten' ? 'Manuscrite' : eng.signatureMode === 'upload' ? 'Importée' : dash(eng.signatureMode)
  const signedAt = eng.signedAt ? formatDate(eng.signedAt) : '—'
  return [
    { label: 'Certifié exact', value: eng.certified ? 'Oui' : 'Non', icon: ICON.check },
    { label: 'Lieu de signature', value: dash(eng.signedPlace), icon: ICON.pin },
    { label: 'Date de signature', value: signedAt, icon: ICON.calendar },
    { label: 'Mode de signature', value: mode, icon: ICON.file },
  ]
})

const timelineSteps = computed(() => {
  const st = enrollment.value?.status
  const steps = [
    {
      key: 'process',
      label: 'Demande en cours de traitement',
      sub: '',
      done: true,
      current: false,
      tone: 'blue' as const,
    },
    {
      key: 'wait',
      label: 'Demande en attente',
      sub: '',
      done: st === 'PENDING' || st === 'APPROVED' || st === 'REJECTED',
      current: st === 'PENDING',
      tone: 'orange' as const,
    },
    {
      key: 'ok',
      label: 'Demande validée',
      sub: '',
      done: st === 'APPROVED',
      current: st === 'APPROVED',
      tone: 'green' as const,
    },
    {
      key: 'no',
      label: 'Demande rejetée',
      sub: '',
      done: st === 'REJECTED',
      current: st === 'REJECTED',
      tone: 'red' as const,
    },
  ]

  return steps.map((s) => {
    let iconWrap = 'bg-slate-100 text-slate-400'
    let textClass = 'text-slate-400'
    if (s.current) {
      if (s.tone === 'blue') {
        iconWrap = 'bg-[#216EC2]/15 text-[#216EC2]'
        textClass = 'text-[#216EC2]'
      } else if (s.tone === 'orange') {
        iconWrap = 'bg-amber-100 text-amber-700'
        textClass = 'text-amber-800'
      } else if (s.tone === 'green') {
        iconWrap = 'bg-emerald-100 text-emerald-700'
        textClass = 'text-emerald-800'
      } else {
        iconWrap = 'bg-red-100 text-red-700'
        textClass = 'text-red-800'
      }
    } else if (s.done && !s.current) {
      iconWrap = 'bg-slate-200 text-slate-600'
      textClass = 'text-slate-700'
    }

    const icons: Record<string, string> = {
      process: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
      wait: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
      ok: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>`,
      no: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    }

    return {
      key: s.key,
      label: s.label,
      sub: s.sub,
      iconWrap,
      textClass,
      iconSvg: icons[s.key] ?? '',
    }
  })
})

function shareByEmail() {
  const e = enrollment.value
  if (!e) return
  const child = `${e.child.firstName} ${e.child.lastName}`.trim()
  const subject = encodeURIComponent(`Demande d'inscription — ${child}`)
  const body = encodeURIComponent(
    [
      `Élève : ${child}`,
      `Classe : ${classOrLevelName.value}`,
      `Année : ${schoolYearLabel.value}`,
      `Statut : ${e.status}`,
      `Demandé le : ${formatDate(e.createdAt)}`,
      '',
      parentEmail.value
        ? `Parent : ${parentName.value}${parentRelationLabel.value !== '—' ? ` (${parentRelationLabel.value})` : ''} (${parentEmail.value})`
        : `Parent : ${parentName.value}${parentRelationLabel.value !== '—' ? ` (${parentRelationLabel.value})` : ''}`,
    ].join('\n'),
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

async function loadDetail() {
  pending.value = true
  loadError.value = null
  const t = token.value
  const eid = id.value
  if (!t || !eid) {
    pending.value = false
    detail.value = null
    return
  }
  try {
    detail.value = await $fetch<DetailDto>(`${config.public.apiBase}/admin/enrollments/${eid}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    loadError.value =
      err?.statusCode === 404
        ? 'Demande introuvable.'
        : typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw[0]
            : 'Impossible de charger la demande.'
    detail.value = null
  } finally {
    pending.value = false
  }
}

function onDossierSaved(payload: { message: string; enrollment: unknown; stats?: unknown }) {
  dossierEditOpen.value = false
  actionError.value = null
  actionMessage.value = payload.message
  if (detail.value && payload.enrollment) {
    detail.value = {
      stats: (payload.stats as Stats | undefined) ?? detail.value.stats,
      enrollment: payload.enrollment as EnrollmentDetail,
    }
  } else {
    void loadDetail()
  }
}

async function submitApprove() {
  actionError.value = null
  actionMessage.value = null
  actionLoading.value = true
  closeConfirmModal()
  const t = token.value
  const eid = id.value
  if (!t || !eid) {
    actionLoading.value = false
    return
  }
  try {
    await $fetch(`${config.public.apiBase}/admin/enrollments/${eid}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: {},
    })
    actionMessage.value = 'Inscription validée.'
    await loadDetail()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    actionError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'La validation a échoué.'
  } finally {
    actionLoading.value = false
  }
}

type BillingRegenerateDto = {
  deleted: { tuitionCharges: number; monthlyInstallments: number }
  tuitionCreated: boolean
  monthsGenerated: number
  warnings: string[]
}

async function regenerateBilling() {
  const e = enrollment.value
  const t = token.value
  const eid = id.value
  if (!e || e.status !== 'APPROVED' || !t || !eid) return

  const ok = window.confirm(
    'Supprimer les factures non payées (scolarité + mensualités en attente) et les recréer selon le paramétrage actuel ? Les paiements déjà encaissés seront conservés.',
  )
  if (!ok) return

  billingLoading.value = true
  actionError.value = null
  actionMessage.value = null
  try {
    const res = await $fetch<BillingRegenerateDto>(
      `${config.public.apiBase}/admin/enrollments/${eid}/billing/regenerate`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      },
    )
    const del = res.deleted
    const delMsg =
      del.tuitionCharges > 0 || del.monthlyInstallments > 0
        ? ` ${del.tuitionCharges} ligne(s) de scolarité et ${del.monthlyInstallments} mensualité(s) en attente supprimées, puis recréées.`
        : ' Aucune ligne en attente à supprimer ; barème appliqué.'
    const warnMsg =
      res.warnings?.length && res.warnings.some((w) => w.trim())
        ? ` ${res.warnings.join(' ')}`
        : ''
    actionMessage.value = `Facturation mise à jour.${delMsg}${warnMsg}`
  } catch (err: unknown) {
    const e2 = err as { data?: { message?: string | string[] } }
    const raw = e2?.data?.message
    actionError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'La régénération a échoué.'
  } finally {
    billingLoading.value = false
  }
}

async function submitReject() {
  actionError.value = null
  actionMessage.value = null
  actionLoading.value = true
  const note = rejectNote.value.trim()
  closeConfirmModal()
  const t = token.value
  const eid = id.value
  if (!t || !eid) {
    actionLoading.value = false
    return
  }
  try {
    await $fetch(`${config.public.apiBase}/admin/enrollments/${eid}/reject`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: { note: note || undefined },
    })
    actionMessage.value = 'Inscription rejetée.'
    await loadDetail()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    actionError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Le refus a échoué.'
  } finally {
    actionLoading.value = false
  }
}

function onModalEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') closeConfirmModal()
}

watch(confirmModal, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', onModalEscape)
  } else {
    window.removeEventListener('keydown', onModalEscape)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onModalEscape)
  document.body.style.overflow = ''
})

watch(
  [token, id],
  () => {
    if (token.value) void loadDetail()
  },
  { immediate: true },
)
</script>
