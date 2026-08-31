<template>
  <div class="-mt-3 sm:-mt-4">
    <!-- Titre page (actions globales : cloche, aide, export — dans AdminTopBar) -->
    <div class="mb-0 flex flex-wrap items-center gap-3 sm:mb-1">
      <NuxtLink to="/admin/students" class="inline-flex h-10 w-10 items-center justify-center" aria-label="Retour à la liste">
        <svg class="h-6 w-6 text-[#216EC2]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.5 5.75 8.25 12l7.25 6.25V5.75Z" />
        </svg>
      </NuxtLink>
      <h1 class="min-w-0 flex-1 text-[2rem] font-bold tracking-tight text-[#216EC2] sm:text-[2.35rem]">Profil de l'élève</h1>
    </div>

    <div v-if="profile && !pending" class="mb-4 flex flex-wrap gap-2 pl-6 sm:mb-5 sm:gap-3 sm:pl-8" role="tablist" aria-label="Sections du profil élève">
      <button
        v-for="tab in profileTabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition"
        :class="
          activeTab === tab.id
            ? 'bg-[#216EC2] text-white shadow-md shadow-[#216EC2]/20'
            : 'border-2 border-slate-200 bg-white text-slate-600 hover:border-[#216EC2]/30 hover:text-slate-800'
        "
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="h-5 w-5 shrink-0" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge != null && tab.badge > 0"
          class="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-bold text-white"
        >
          {{ tab.badge }}
        </span>
        <span
          v-if="tab.healthDot"
          class="h-2.5 w-2.5 shrink-0 rounded-full bg-[#F9994B] shadow-sm"
          aria-hidden="true"
        />
      </button>
    </div>

    <p v-if="loadError" class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>

    <div
      v-if="pending"
      class="flex min-h-[320px] items-center justify-center rounded-2xl border-2 border-[#216EC2]/15 bg-white text-slate-500 shadow-sm"
    >
      Chargement…
    </div>

    <article
      v-else-if="profile"
      class="mt-0 overflow-hidden rounded-3xl bg-transparent sm:mt-1"
    >
      <div v-show="activeTab === 'profil'" role="tabpanel" aria-label="Profil">
      <!-- Bandeau : avatar + nom + boutons, puis tuiles sur toute la largeur -->
      <div class="border-b border-slate-100 px-6 pb-4 pt-1 sm:px-8 sm:pb-5 sm:pt-2">
        <div class="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
          <button
            type="button"
            class="group relative flex h-[156px] w-[156px] shrink-0 flex-col items-center justify-center gap-1.5 self-center overflow-hidden rounded-3xl border-2 border-dashed px-2 transition sm:self-auto"
            :class="
              photoDragOver
                ? 'border-[#216EC2] bg-[#216EC2]/10'
                : 'border-[#216EC2]/40 bg-[#216EC2]/5 text-[#216EC2] hover:border-[#216EC2]/60 hover:bg-[#216EC2]/10'
            "
            aria-label="Ajouter une photo de l'élève"
            @click="openPhotoPicker"
            @dragover.prevent="photoDragOver = true"
            @dragleave.prevent="photoDragOver = false"
            @drop.prevent="onPhotoDrop"
            :disabled="uploadingPhoto"
          >
            <img
              v-if="photoPreview"
              :src="photoPreview"
              alt="Photo de l'élève"
              class="absolute inset-0 h-full w-full object-cover"
            >
            <div
              v-if="uploadingPhoto"
              class="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-bold text-[#216EC2]"
            >
              Envoi…
            </div>
            <template v-else>
              <svg class="h-14 w-14 shrink-0 opacity-80" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity="0.28" />
                <circle cx="9.2" cy="10.1" r="0.95" fill="currentColor" />
                <circle cx="14.8" cy="10.1" r="0.95" fill="currentColor" />
                <path
                  d="M8.2 14.1c.9 1.4 2.3 2.1 3.8 2.1 1.1 0 2.2-.4 3-1.2"
                  stroke="currentColor"
                  stroke-width="1.9"
                  stroke-linecap="round"
                />
                <path
                  d="M14.4 15.65c-.06.45.18.72.52.78.28.05.55-.03.62-.2"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              <span class="text-center text-xs font-bold leading-tight">Ajouter une photo</span>
              <span class="text-center text-[10px] font-medium leading-tight text-[#216EC2]/75">
                Glissez une image ou cliquez
              </span>
            </template>
          </button>
          <input
            ref="photoInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            class="hidden"
            @change="onPhotoSelect"
          >
          <div class="flex w-full min-w-0 flex-1 flex-col gap-3">
            <p v-if="photoError" class="text-center text-xs font-medium text-rose-600 sm:text-left">{{ photoError }}</p>
            <div class="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <p
                class="min-w-0 text-center text-[1.35rem] font-bold leading-tight text-[#216EC2] sm:text-left sm:text-2xl sm:leading-tight"
              >
                {{ profile.fullName }}
              </p>
              <div class="flex shrink-0 flex-wrap items-center justify-center gap-3 sm:justify-end">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100/90"
                  @click="openDeleteModal"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    <path d="m21 21-3-3" stroke-linecap="round" />
                  </svg>
                  Supprimer
                </button>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-2xl bg-[#216EC2] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#216EC2]/25 transition hover:brightness-105"
                  @click="openEditModal"
                >
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Modifier
                </button>
              </div>
            </div>
            <div class="grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <div
                v-for="(tile, i) in quickTiles"
                :key="i"
                class="flex min-h-[88px] min-w-0 flex-col justify-center rounded-3xl border-2 border-[#216EC2]/40 bg-white px-2 py-4 text-center shadow-sm sm:min-h-[96px] sm:px-3 sm:py-5"
              >
                <p class="line-clamp-2 min-h-[2.1em] text-[10px] font-semibold uppercase leading-tight tracking-wide text-[#216EC2] sm:text-xs">
                  {{ tile.label }}
                </p>
                <p
                  class="mt-1 line-clamp-2 break-words text-xs font-bold leading-tight text-slate-900 sm:mt-1.5 sm:text-sm"
                  :title="tile.value"
                >
                  {{ tile.value }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Information ≈ 4,5/12 (base 4 + moitié du passage 4→5) | droite 7,5/12 -->
      <div class="-mt-1 border-b border-slate-100 px-6 pb-4 pt-0 sm:-mt-2 sm:px-8 sm:pb-5 sm:pt-0">
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,7.5fr)] lg:items-stretch lg:gap-4">
          <section
            class="flex min-h-[240px] flex-col rounded-3xl border-2 border-[#216EC2]/30 bg-white pb-3 pl-4 pr-3 pt-1.5 shadow-sm sm:min-h-[260px] sm:pb-4 sm:pl-5 sm:pr-4 sm:pt-2 lg:min-h-0 lg:h-full"
          >
            <h2 class="mb-4 text-base font-bold text-slate-900">Information de l'élève</h2>
            <ul class="space-y-5 text-sm text-slate-800">
              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                </span>
                <div>
                  <p class="text-xs font-semibold text-[#216EC2]">Date de naissance</p>
                  <p class="mt-0.5 font-semibold text-slate-900">{{ profile.birthDisplay }}</p>
                  <p class="mt-0.5 text-sm text-slate-600">({{ profile.ageLabel }})</p>
                </div>
              </li>
              <li class="flex gap-4">
                <span
                  class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                  :class="genderFaceWrapClass"
                  aria-hidden="true"
                >
                  <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="9" r="2.5" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke-linecap="round" />
                  </svg>
                </span>
                <div>
                  <p class="text-xs font-semibold text-[#216EC2]">Genre</p>
                  <p class="mt-0.5 font-semibold text-slate-900">{{ profile.genderLabel }}</p>
                </div>
              </li>
              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <p class="text-xs font-semibold text-[#216EC2]">Adresse</p>
                  <p class="mt-0.5 font-semibold leading-relaxed text-slate-900">{{ profile.address }}</p>
                </div>
              </li>
              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                </span>
                <div>
                  <p class="text-xs font-semibold text-[#216EC2]">Matricule</p>
                  <p class="mt-0.5 font-semibold tracking-wide text-slate-900">{{ profile.matricule }}</p>
                </div>
              </li>
            </ul>
          </section>

          <div class="flex min-w-0 flex-col gap-3">
            <section
              class="flex min-h-[220px] w-full flex-col rounded-3xl border-2 border-[#216EC2]/35 bg-white py-6 pl-3 pr-5 shadow-sm sm:min-h-[240px] sm:py-7 sm:pl-4"
            >
              <h2 class="mb-4 text-base font-bold text-slate-900">Allergies &amp; Santé</h2>
              <ul
                v-if="profile.allergies.length"
                class="grid auto-cols-max grid-flow-col grid-rows-3 gap-x-4 gap-y-2 text-sm font-medium text-slate-800"
              >
                <li v-for="(a, i) in profile.allergies" :key="i" class="flex min-w-0 max-w-[14rem] items-start gap-2 sm:max-w-none">
                  <span
                    class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F9994B] text-white shadow-sm"
                    aria-hidden="true"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="break-words">{{ a }}</span>
                </li>
              </ul>
              <p v-else class="text-sm text-slate-500">Aucune allergie renseignée.</p>
            </section>

            <div class="grid gap-5 sm:grid-cols-2">
              <section class="rounded-3xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
                <div class="flex gap-4">
                  <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                    </svg>
                  </span>
                  <div>
                    <h2 class="text-base font-bold text-slate-900">Informations Diverses</h2>
                    <p class="mt-1 text-xs font-semibold text-[#216EC2]">Activité extra-scolaire</p>
                    <p class="mt-1 font-semibold text-slate-800">{{ profile.extraActivity }}</p>
                  </div>
                </div>
              </section>

              <section class="rounded-3xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 flex-1">
                    <div class="mb-2 flex items-center gap-2">
                      <span
                        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm"
                        aria-hidden="true"
                      >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                          />
                        </svg>
                      </span>
                      <h2 class="text-base font-bold text-slate-900">Numéro d'urgence</h2>
                    </div>
                    <p class="text-xs font-semibold text-[#216EC2]">À appeler en cas d'urgence</p>
                    <p class="mt-1 text-lg font-bold text-slate-900">{{ profile.emergencyPhone || '—' }}</p>
                  </div>
                  <a
                    v-if="profile.emergencyPhone"
                    :href="`tel:${emergencyRaw}`"
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#216EC2] text-white shadow-sm transition hover:brightness-105"
                    aria-label="Appeler en urgence"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                      />
                    </svg>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <!-- Parent : carte (nom + badge + actions, 3 colonnes) -->
      <section v-if="profile.parent" class="-mt-1 px-6 pb-6 pt-0 sm:-mt-1.5 sm:px-8 sm:pb-8 sm:pt-0">
        <div class="rounded-3xl border-2 border-[#216EC2]/35 bg-white p-5 shadow-sm sm:p-6">
          <h2 class="mb-5 text-base font-bold text-slate-900 sm:text-lg">Information du parent</h2>

          <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{{ profile.parent.fullName }}</p>
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                v-if="profile.parent.relationLabel"
                class="rounded-lg bg-[#F9994B] px-3 py-1.5 text-xs font-bold text-white shadow-sm"
              >
                {{ profile.parent.relationLabel }}
              </span>
              <a
                v-if="profile.parent.phone"
                :href="`tel:${parentPhoneRaw}`"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2] text-white shadow-sm transition hover:brightness-105"
                aria-label="Appeler"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                  />
                </svg>
              </a>
              <a
                v-if="profile.parent.email"
                :href="`mailto:${profile.parent.email}`"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2] text-white shadow-sm transition hover:brightness-105"
                aria-label="Envoyer un message"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </a>
            </div>
          </div>

          <ul class="grid gap-6 text-sm sm:grid-cols-3 sm:gap-5">
            <li class="flex min-w-0 gap-3">
              <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[#216EC2]">Adresse</p>
                <p class="mt-0.5 font-semibold leading-relaxed text-slate-900">{{ parentAddress }}</p>
              </div>
            </li>
            <li class="flex min-w-0 gap-3">
              <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[#216EC2]">E-mail</p>
                <p class="mt-0.5 break-all font-semibold text-slate-900">{{ profile.parent.email || '—' }}</p>
              </div>
            </li>
            <li class="flex min-w-0 gap-3">
              <span class="mt-0.5 shrink-0 text-[#216EC2]" aria-hidden="true">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"
                  />
                </svg>
              </span>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-[#216EC2]">Numéro de téléphone</p>
                <p class="mt-0.5 font-semibold text-slate-900">{{ profile.parent.phone || '—' }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
      </div>

      <AdminStudentCarnetSuivi
        v-show="activeTab === 'carnet'"
        :child-id="childId"
        @stats="onCarnetStats"
      />

      <AdminStudentFicheSante
        v-show="activeTab === 'sante'"
        :child-id="childId"
        @status="onHealthStatus"
      />
    </article>

    <Teleport to="body">
      <div
        v-if="editModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeEditModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-student-title"
          class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white px-6 pb-7 pt-6 shadow-xl sm:px-8 sm:pb-8 sm:pt-7"
          @click.stop
        >
          <div class="mb-6 flex items-start justify-between gap-4">
            <h2 id="edit-student-title" class="text-lg font-semibold text-[#216EC2] sm:text-xl">
              Modifier l'élève
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
              aria-label="Fermer"
              :disabled="editSaving"
              @click="closeEditModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div v-if="editCatalogPending" class="py-10 text-center text-sm text-slate-500">Chargement du catalogue…</div>
          <template v-else>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block min-w-0">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Noms</span>
                <input
                  v-model.trim="editForm.lastName"
                  type="text"
                  autocomplete="family-name"
                  class="w-full rounded-2xl border-2 border-[#216EC2]/35 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                />
              </label>
              <label class="block min-w-0">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Prénoms</span>
                <input
                  v-model.trim="editForm.firstName"
                  type="text"
                  autocomplete="given-name"
                  class="w-full rounded-2xl border-2 border-[#216EC2]/35 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                />
              </label>
              <div class="min-w-0 sm:col-span-1">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Niveau</span>
                <div class="relative">
                  <select
                    v-model="editForm.levelId"
                    class="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#216EC2]/35 bg-white py-3 pl-4 pr-11 text-sm font-medium text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                    @change="onEditLevelChange"
                  >
                    <option v-for="l in editCatalogLevels" :key="l.id" :value="l.id">{{ l.name }}</option>
                  </select>
                  <span
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
              <div class="min-w-0 sm:col-span-1">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Année scolaire</span>
                <div class="relative">
                  <select
                    v-model="editForm.schoolYear"
                    class="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#216EC2]/35 bg-white py-3 pl-4 pr-11 text-sm font-medium text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                    @change="onEditSchoolYearChange"
                  >
                    <option v-for="sy in editSchoolYearOptions" :key="sy" :value="sy">{{ formatSchoolYearOption(sy) }}</option>
                  </select>
                  <span
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
              <div v-if="editClassesForLevel.length" class="min-w-0 sm:col-span-2">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Classe</span>
                <div class="relative">
                  <select
                    v-model="editForm.classId"
                    class="w-full cursor-pointer appearance-none rounded-2xl border-2 border-[#216EC2]/35 bg-white py-3 pl-4 pr-11 text-sm font-medium text-slate-800 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                  >
                    <option value="">—</option>
                    <option v-for="c in editClassesForLevel" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <span
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
              <label class="block min-w-0">
                <span class="mb-1.5 block text-xs font-semibold text-[#216EC2]">Matricule</span>
                <input
                  :value="profile?.matricule ?? ''"
                  type="text"
                  readonly
                  class="w-full cursor-not-allowed rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
                />
              </label>
              <label class="block min-w-0">
                <span class="mb-1.5 block text-xs font-semibold text-emerald-600">Numéro d'urgence</span>
                <input
                  v-model.trim="editForm.emergencyPhone"
                  type="tel"
                  autocomplete="tel"
                  class="w-full rounded-2xl border-2 border-[#216EC2]/35 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                />
              </label>
            </div>

            <div class="mt-6">
              <span class="mb-2 block text-xs font-semibold text-[#216EC2]">Allergies &amp; santé</span>
              <div class="space-y-2">
                <div v-for="(_, i) in editForm.allergies" :key="i" class="flex gap-2">
                  <input
                    v-model="editForm.allergies[i]"
                    type="text"
                    class="min-w-0 flex-1 rounded-2xl border-2 border-[#216EC2]/35 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                    placeholder="Ex. allergie alimentaire…"
                  />
                  <button
                    type="button"
                    class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#216EC2]/30 text-[#216EC2] transition hover:bg-[#216EC2]/10 disabled:opacity-40"
                    :disabled="editForm.allergies.length <= 1"
                    aria-label="Retirer cette ligne"
                    @click="removeAllergyRow(i)"
                  >
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="m15 9-6 6M9 9l6 6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                type="button"
                class="mt-3 flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-[#216EC2]/40 bg-[#216EC2]/5 py-3 text-[#216EC2] transition hover:bg-[#216EC2]/10"
                @click="addAllergyRow"
              >
                <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#216EC2] text-white shadow-sm">
                  <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                  </svg>
                </span>
              </button>
            </div>

            <p v-if="editError" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
              {{ editError }}
            </p>

            <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#216EC2] bg-white py-3.5 text-sm font-bold text-[#216EC2] shadow-sm transition hover:bg-[#216EC2]/5 sm:flex-initial sm:min-w-[140px]"
                :disabled="editSaving"
                @click="closeEditModal"
              >
                Annuler
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m15 9-6 6M9 9l6 6" stroke-linecap="round" />
                </svg>
              </button>
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50 sm:flex-initial sm:min-w-[160px]"
                :disabled="editSaving || editCatalogPending || !editCatalogLevels.length"
                @click="submitEdit"
              >
                <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                {{ editSaving ? 'Enregistrement…' : 'Modifier' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="deleteModalOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeDeleteModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-title"
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <div class="mb-5 flex items-start justify-between gap-4">
            <h2 id="delete-student-title" class="pr-2 text-xl font-bold tracking-tight text-slate-900">
              Supprimer le profil de l'élève
            </h2>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#216EC2]/25 bg-[#216EC2]/10 text-[#216EC2] transition hover:bg-[#216EC2]/15"
              aria-label="Fermer"
              @click="closeDeleteModal"
            >
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Voulez-vous vraiment supprimer le profil de cet élève&nbsp;?
          </p>
          <p v-if="deleteError" class="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-800">
            {{ deleteError }}
          </p>

          <div class="flex gap-3 sm:gap-4">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50 py-3.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-100/90 disabled:opacity-50"
              :disabled="deleteLoading"
              @click="confirmDeleteStudent"
            >
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <circle cx="18" cy="18" r="3" />
                <path d="m16 16 4 4" stroke-linecap="round" />
              </svg>
              Supprimer
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#216EC2] py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50"
              :disabled="deleteLoading"
              @click="closeDeleteModal"
            >
              Annuler
              <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4" />
                <circle cx="17" cy="17" r="3" />
                <path d="m15 15 4 4M19 15l-4 4" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type ProfileTab = 'profil' | 'carnet' | 'sante'

const TabProfilIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '8', r: '4' }),
    h('path', { d: 'M6 21v-1a6 6 0 0 1 12 0v1', 'stroke-linecap': 'round' }),
  ])

const TabCarnetIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
    h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' }),
    h('path', { d: 'M8 7h8M8 11h8M8 15h5', 'stroke-linecap': 'round' }),
  ])

const TabSanteIcon = () =>
  h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'stroke-linejoin': 'round' }),
    h('path', { d: 'm9 12 2 2 4-4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  ])

const activeTab = ref<ProfileTab>('profil')
const carnetStats = ref({ draftCount: 0, publishedCount: 0 })
const healthPendingSignature = ref(true)

function onCarnetStats(stats: { draftCount: number; publishedCount: number }) {
  carnetStats.value = stats
}

function onHealthStatus(payload: { pendingSignature: boolean }) {
  healthPendingSignature.value = payload.pendingSignature
}

const profileTabs = computed(() => [
  { id: 'profil' as const, label: 'Profil', icon: TabProfilIcon },
  {
    id: 'carnet' as const,
    label: 'Carnet de suivi',
    icon: TabCarnetIcon,
    badge: carnetStats.value.draftCount > 0 ? carnetStats.value.draftCount : undefined,
  },
  {
    id: 'sante' as const,
    label: 'Fiche santé',
    icon: TabSanteIcon,
    healthDot: healthPendingSignature.value,
  },
])

const photoInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref('')
const photoDragOver = ref(false)
const uploadingPhoto = ref(false)
const photoError = ref<string | null>(null)

function openPhotoPicker() {
  if (uploadingPhoto.value) return
  photoInput.value?.click()
}

async function uploadStudentPhoto(file: File | undefined) {
  if (!file || !file.type.startsWith('image/')) return
  const t = token.value
  const id = childId.value
  if (!t || !id) return
  uploadingPhoto.value = true
  photoError.value = null
  const previous = photoPreview.value
  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = String(reader.result ?? '')
  }
  reader.readAsDataURL(file)
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ photoUrl: string | null }>(`${config.public.apiBase}/admin/students/${id}/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: fd,
    })
    const url = res?.photoUrl ?? ''
    photoPreview.value = url
    if (profile.value) profile.value.photoUrl = url
  } catch (e: unknown) {
    photoPreview.value = previous
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    photoError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible d’enregistrer la photo.'
  } finally {
    uploadingPhoto.value = false
  }
}

function onPhotoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  void uploadStudentPhoto(input.files?.[0])
  input.value = ''
}

function onPhotoDrop(e: DragEvent) {
  photoDragOver.value = false
  void uploadStudentPhoto(e.dataTransfer?.files?.[0])
}

type ProfileDto = {
  childId: string
  firstName: string
  lastName: string
  fullName: string
  photoUrl: string | null
  matricule: string
  ageLabel: string
  birthDisplay: string
  gender: string
  genderLabel: string
  address: string
  allergies: string[]
  extraActivity: string
  emergencyPhone: string | null
  enrollment: {
    id: string
    levelId: string
    classId: string | null
    className: string
    schoolYear: string
    schoolYearRaw: string
    enrollmentDate: string
  }
  parent: {
    fullName: string
    email: string | null
    phone: string | null
    address: string | null
    relationLabel: 'Père' | 'Mère' | null
  } | null
}

type CatalogLevel = {
  id: string
  name: string
  order: number | null
  classes: { id: string; name: string }[]
}

type CatalogDto = {
  schoolYear: string
  levels: CatalogLevel[]
}

const route = useRoute()
const { token } = useAuth()
const config = useRuntimeConfig()

const childId = computed(() => String(route.params.id ?? ''))
const profile = ref<ProfileDto | null>(null)
const loadError = ref<string | null>(null)
const pending = ref(true)

const deleteModalOpen = ref(false)
const deleteLoading = ref(false)
const deleteError = ref<string | null>(null)

const editModalOpen = ref(false)
const editSaving = ref(false)
const editError = ref<string | null>(null)
const editCatalog = ref<CatalogDto | null>(null)
const editCatalogPending = ref(false)
const schoolYearsFromApi = ref<string[]>([])

const editForm = reactive({
  lastName: '',
  firstName: '',
  levelId: '',
  classId: '',
  schoolYear: '',
  emergencyPhone: '',
  allergies: [] as string[],
})

const editSchoolYearOptions = computed(() => {
  const s = new Set(schoolYearsFromApi.value)
  const raw = profile.value?.enrollment.schoolYearRaw
  if (raw) s.add(raw)
  return [...s].sort((a, b) => b.localeCompare(a, 'fr'))
})

const editCatalogLevels = computed(() => editCatalog.value?.levels ?? [])

const editClassesForLevel = computed(() => {
  const lvl = editCatalogLevels.value.find((l) => l.id === editForm.levelId)
  return lvl?.classes ?? []
})

function formatSchoolYearOption(sy: string): string {
  const s = sy.trim()
  if (s.includes('-') && s.length >= 9) return s.replace(/(\d{4})-(\d{4})/, '$1 - $2')
  return s
}

async function loadSchoolYearsList() {
  const t = token.value
  if (!t) return
  try {
    const res = await $fetch<{ schoolYears: string[] }>(`${config.public.apiBase}/admin/students/school-years`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    schoolYearsFromApi.value = res.schoolYears ?? []
  } catch {
    schoolYearsFromApi.value = []
  }
}

async function loadEditCatalog(schoolYear: string) {
  const t = token.value
  if (!t) return
  const sy = schoolYear.trim()
  if (!sy) {
    editCatalog.value = null
    return
  }
  editCatalogPending.value = true
  try {
    editCatalog.value = await $fetch<CatalogDto>(`${config.public.apiBase}/admin/settings/catalog`, {
      headers: { Authorization: `Bearer ${t}` },
      query: { schoolYear: sy },
    })
  } catch {
    editCatalog.value = null
  } finally {
    editCatalogPending.value = false
  }
}

function syncEditLevelClass() {
  const levels = editCatalogLevels.value
  if (!levels.length) return
  if (!levels.some((l) => l.id === editForm.levelId)) {
    editForm.levelId = levels[0].id
  }
  const cls = editClassesForLevel.value
  const ids = cls.map((c) => c.id)
  if (editForm.classId && !ids.includes(editForm.classId)) {
    editForm.classId = ids[0] ?? ''
  }
}

async function openEditModal() {
  const p = profile.value
  if (!p) return
  editError.value = null
  editForm.lastName = p.lastName
  editForm.firstName = p.firstName
  editForm.levelId = p.enrollment.levelId
  editForm.classId = p.enrollment.classId ?? ''
  editForm.schoolYear = p.enrollment.schoolYearRaw
  editForm.emergencyPhone = p.emergencyPhone ?? ''
  editForm.allergies = p.allergies.length ? [...p.allergies] : ['']
  await loadSchoolYearsList()
  await loadEditCatalog(editForm.schoolYear)
  if (!editCatalog.value?.levels?.length) {
    editError.value =
      'Aucun niveau n’est disponible pour cette année scolaire. Vérifiez le paramétrage (niveaux et tarifs).'
  }
  syncEditLevelClass()
  editModalOpen.value = true
}

function closeEditModal() {
  if (editSaving.value) return
  editModalOpen.value = false
}

function onEditLevelChange() {
  const cls = editClassesForLevel.value
  const ids = cls.map((c) => c.id)
  if (!editForm.classId || !ids.includes(editForm.classId)) {
    editForm.classId = ids[0] ?? ''
  }
}

async function onEditSchoolYearChange() {
  editError.value = null
  await loadEditCatalog(editForm.schoolYear)
  if (!editCatalog.value?.levels?.length) {
    editError.value =
      'Aucun niveau n’est disponible pour cette année scolaire. Vérifiez le paramétrage (niveaux et tarifs).'
  }
  syncEditLevelClass()
}

function addAllergyRow() {
  editForm.allergies.push('')
}

function removeAllergyRow(i: number) {
  if (editForm.allergies.length <= 1) {
    editForm.allergies[0] = ''
    return
  }
  editForm.allergies.splice(i, 1)
}

async function submitEdit() {
  const t = token.value
  const id = childId.value
  if (!t || !id) return
  editSaving.value = true
  editError.value = null
  try {
    const allergies = editForm.allergies.map((a) => a.trim()).filter(Boolean)
    const updated = await $fetch<ProfileDto>(`${config.public.apiBase}/admin/students/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        levelId: editForm.levelId,
        schoolYear: editForm.schoolYear.trim(),
        classId: editForm.classId || null,
        allergies,
        emergencyPhone: editForm.emergencyPhone.trim() || null,
      },
    })
    profile.value = updated
    editModalOpen.value = false
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    editError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Enregistrement impossible.'
  } finally {
    editSaving.value = false
  }
}

function openDeleteModal() {
  deleteError.value = null
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (deleteLoading.value) return
  deleteModalOpen.value = false
}

async function confirmDeleteStudent() {
  const t = token.value
  const id = childId.value
  if (!t || !id) return
  deleteLoading.value = true
  deleteError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${t}` },
    })
    deleteModalOpen.value = false
    await navigateTo('/admin/students')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    deleteError.value =
      err?.statusCode === 404
        ? 'Élève introuvable ou non éligible.'
        : typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw[0]
            : 'La suppression a échoué.'
  } finally {
    deleteLoading.value = false
  }
}

const genderFaceWrapClass = computed(() => {
  const g = profile.value?.gender
  if (g === 'FEMALE') return 'bg-pink-500 shadow-inner'
  if (g === 'MALE') return 'bg-[#216EC2] shadow-inner'
  return 'bg-slate-400 shadow-inner'
})

const quickTiles = computed(() => {
  const p = profile.value
  if (!p) return []
  return [
    { label: 'Âge', value: p.ageLabel },
    { label: 'Classe', value: p.enrollment.className },
    { label: 'Année scolaire', value: p.enrollment.schoolYear },
    { label: "Date d'inscription", value: formatDate(p.enrollment.enrollmentDate) },
  ]
})

const parentPhoneRaw = computed(() => (profile.value?.parent?.phone ?? '').replace(/\s/g, ''))
const emergencyRaw = computed(() => (profile.value?.emergencyPhone ?? '').replace(/\s/g, ''))
const parentAddress = computed(() => {
  const a = profile.value?.address?.trim()
  if (a && a !== '—') return a
  return profile.value?.parent?.address?.trim() || '—'
})

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

async function loadProfile() {
  pending.value = true
  loadError.value = null
  const t = token.value
  const id = childId.value
  if (!t || !id) {
    pending.value = false
    profile.value = null
    return
  }
  try {
    profile.value = await $fetch<ProfileDto>(`${config.public.apiBase}/admin/students/${id}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
    photoPreview.value = profile.value?.photoUrl ?? ''
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; statusCode?: number }
    const raw = err?.data?.message
    loadError.value =
      err?.statusCode === 404
        ? 'Élève introuvable ou non éligible.'
        : typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
            ? raw[0]
            : 'Impossible de charger le profil.'
    profile.value = null
    photoPreview.value = ''
  } finally {
    pending.value = false
  }
}

watch(
  [token, childId],
  () => {
    if (token.value) void loadProfile()
  },
  { immediate: true },
)
</script>
