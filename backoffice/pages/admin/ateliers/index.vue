<template>
  <div class="space-y-5">
    <h1 class="text-[28px] font-bold leading-tight text-[#216EC2] sm:text-[34px]">Gestion des Ateliers</h1>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ loadError }}</p>
    <p v-if="loading" class="text-sm text-slate-500">Chargement des ateliers…</p>

    <!-- Stats -->
    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-xl border-2 border-[#216EC2]/30 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 class="text-[13px] font-semibold text-slate-600">{{ card.title }}</h2>
            <p class="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">{{ card.value }}</p>
            <p class="mt-1.5 text-[11px] font-medium text-slate-400">{{ card.hint }}</p>
          </div>
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            :class="card.iconBg"
            aria-hidden="true"
            v-html="card.icon"
          />
        </div>
      </article>
    </section>

    <!-- Tabs + CTA -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition"
          :class="
            tab === 'ateliers'
              ? 'bg-[#216EC2] text-white shadow-sm'
              : 'border border-[#D0D8E8] bg-white text-[#1E2A44] hover:bg-slate-50'
          "
          @click="tab = 'ateliers'"
        >
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="4" y="11" width="16" height="9" rx="1.5" />
            <path d="M8 11V7M12 11V4M16 11V8" stroke-linecap="round" />
          </svg>
          Ateliers
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition"
          :class="
            tab === 'reservations'
              ? 'bg-[#216EC2] text-white shadow-sm'
              : 'border border-[#D0D8E8] bg-white text-[#1E2A44] hover:bg-slate-50'
          "
          @click="tab = 'reservations'"
        >
          <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 9a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2" />
            <path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
            <path d="M3 9a2 2 0 0 1 2 2 2 2 0 0 0 2 2h10a2 2 0 0 0 2-2 2 2 0 0 1 2-2" />
          </svg>
          Réservations
        </button>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white shadow-[0_1px_2px_rgba(33,110,194,0.25)] transition hover:brightness-110"
        @click="openCreateForm"
      >
        <span class="text-lg leading-none">+</span>
        Nouvel Atelier
      </button>
    </div>

    <!-- Ateliers tab — table (maquette) -->
    <section
      v-if="tab === 'ateliers'"
      class="overflow-hidden rounded-xl border-2 border-[#216EC2]/30 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div class="flex flex-col gap-3 border-b border-[#EEF2F7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative min-w-0 flex-1 sm:max-w-md">
          <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="search"
            type="search"
            class="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
            placeholder="Search"
            autocomplete="off"
          />
        </div>
        <select
          v-model="sort"
          class="h-[42px] shrink-0 rounded-xl border border-[#F9994B] bg-[#F9994B] px-4 text-sm font-bold text-white outline-none"
        >
          <option value="date_desc">Trier par</option>
          <option value="date_asc">Plus ancien</option>
          <option value="name_asc">Nom A → Z</option>
          <option value="status">Statut</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Ateliers</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Âge</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Date et Heure</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Places</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Statut</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#EEF2F7]">
            <tr v-if="!paginatedAteliers.length">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">Aucun atelier trouvé.</td>
            </tr>
            <tr
              v-for="atelier in paginatedAteliers"
              :key="atelier.id"
              class="bg-white"
              :class="atelier.published ? 'text-slate-700' : 'text-slate-400'"
            >
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <img
                    class="h-11 w-11 rounded-lg object-cover ring-1 ring-[#E2E8F0]"
                    :src="mediaUrl(atelier.image)"
                    :alt="atelier.title"
                  />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-bold" :class="atelier.published ? 'text-slate-900' : 'text-slate-500'">
                      {{ atelier.title }}
                    </p>
                    <p class="truncate text-[11px] text-slate-400">{{ atelier.description }}</p>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-3.5 text-[13px] font-medium">{{ atelier.ageLabel }}</td>
              <td class="min-w-[11rem] px-4 py-3.5 text-[13px] leading-snug">{{ atelierSessionLabel(atelier) }}</td>
              <td class="px-4 py-3.5">
                <div class="min-w-[88px]">
                  <p class="text-[13px] font-semibold text-slate-800">{{ atelier.booked }}/{{ atelier.capacity }}</p>
                  <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E8F1FB]">
                    <div
                      class="h-full rounded-full bg-[#22C55E] transition-all"
                      :style="{ width: `${placesPct(atelier)}%` }"
                    />
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold transition disabled:opacity-50"
                  :class="
                    atelier.published
                      ? 'bg-[#E8F8EF] text-[#16A34A]'
                      : 'bg-[#FEECE8] text-[#E85D4C]'
                  "
                  :title="atelier.published ? 'Dépublier' : 'Publier'"
                  :disabled="actionId === atelier.id"
                  @click="togglePublish(atelier)"
                >
                  <span
                    class="relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition"
                    :class="atelier.published ? 'bg-[#22C55E]' : 'bg-[#F97316]'"
                    aria-hidden="true"
                  >
                    <span
                      class="absolute h-3 w-3 rounded-full bg-white shadow transition"
                      :class="atelier.published ? 'right-0.5' : 'left-0.5'"
                    />
                  </span>
                  {{ atelier.published ? 'Actif' : 'Inactif' }}
                </button>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/admin/ateliers/${atelier.id}`"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#216EC2] transition hover:bg-[#DBEAFE]"
                    title="Voir"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </NuxtLink>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#216EC2] transition hover:bg-[#DBEAFE] disabled:opacity-50"
                    title="Modifier"
                    :disabled="actionId === atelier.id"
                    @click="openEditForm(atelier)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M12 20h9" stroke-linecap="round" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-50"
                    :class="
                      atelier.closed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    "
                    :title="atelier.closed ? 'Rouvrir les inscriptions' : 'Clôturer les inscriptions'"
                    :disabled="actionId === atelier.id"
                    @click="toggleClosed(atelier)"
                  >
                    <!-- Fermé : cadenas ouvert (rouvrir) / Ouvert : cadenas fermé (clôturer) -->
                    <svg
                      v-if="atelier.closed"
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M7 11V8a5 5 0 0 1 9.9-1" stroke-linecap="round" />
                    </svg>
                    <svg
                      v-else
                      class="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      aria-hidden="true"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    title="Supprimer"
                    :disabled="actionId === atelier.id"
                    @click="deleteAtelier(atelier)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M3 6h18" stroke-linecap="round" />
                      <path d="M8 6V4h8v2" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M19 6l-1 14H6L5 6" stroke-linejoin="round" />
                      <path d="M10 11v6M14 11v6" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="filteredAteliers.length"
        class="flex items-center justify-end gap-3 border-t border-[#EEF2F7] px-4 py-3 text-sm text-slate-500"
      >
        <span>{{ pageRangeLabel }}</span>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
          :disabled="atelierPage <= 1"
          aria-label="Page précédente"
          @click="atelierPage--"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
          :disabled="atelierPage >= atelierPageCount"
          aria-label="Page suivante"
          @click="atelierPage++"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </section>

    <!-- Filters (réservations) -->
    <section v-else class="space-y-5">
      <section class="rounded-xl border-2 border-[#216EC2]/30 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-4">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="relative min-w-0 flex-1">
            <span class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" stroke-linecap="round" />
              </svg>
            </span>
            <input
              v-model="search"
              type="search"
              class="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
              placeholder="Search"
              autocomplete="off"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <label class="inline-flex h-[42px] items-center overflow-hidden rounded-xl border border-[#216EC2] bg-white text-sm shadow-sm">
              <span class="inline-flex h-full items-center gap-1.5 bg-[#216EC2] px-3 font-semibold text-white">
                Du
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              <input
                v-model="dateFrom"
                type="date"
                class="h-full min-w-[9.5rem] bg-white px-3 text-sm font-medium text-slate-600 outline-none"
              />
            </label>
            <label class="inline-flex h-[42px] items-center overflow-hidden rounded-xl border border-[#216EC2] bg-white text-sm shadow-sm">
              <span class="inline-flex h-full items-center gap-1.5 bg-[#216EC2] px-3 font-semibold text-white">
                Au
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              <input
                v-model="dateTo"
                type="date"
                class="h-full min-w-[9.5rem] bg-white px-3 text-sm font-medium text-slate-600 outline-none"
              />
            </label>
            <select
              v-model="sort"
              class="h-[42px] rounded-xl border border-[#F9994B] bg-[#F9994B] px-4 text-sm font-bold text-white outline-none"
            >
              <option value="date_desc">Trier par</option>
              <option value="date_asc">Plus ancien</option>
              <option value="name_asc">Nom A → Z</option>
              <option value="status">Statut</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Réservations table -->
      <section class="overflow-hidden rounded-xl border-2 border-[#216EC2]/30 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1100px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Reservation ID</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Ateliers</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Parents / contact</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Date &amp; Heure</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Places</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Âge</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Réservé le</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Statut</th>
              <th class="px-4 py-3.5 text-[12px] font-semibold tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#EEF2F7]">
            <tr v-if="!filteredReservations.length">
              <td colspan="9" class="px-4 py-12 text-center text-slate-500">Aucune réservation.</td>
            </tr>
            <tr v-for="row in filteredReservations" :key="row.id" class="bg-white text-slate-700">
              <td class="whitespace-nowrap px-4 py-3.5">
                <span class="inline-flex rounded-md bg-[#E8F1FB] px-2.5 py-1 text-[12px] font-bold text-[#216EC2]">
                  {{ row.code }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <img class="h-11 w-11 rounded-lg object-cover ring-1 ring-[#E2E8F0]" :src="mediaUrl(row.atelierImage)" :alt="row.atelierTitle" />
                  <div class="min-w-0">
                    <p class="truncate text-[13px] font-bold text-slate-900">{{ row.atelierTitle }}</p>
                    <p class="truncate text-[11px] text-slate-400">{{ row.atelierSubtitle }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-[13px] font-bold text-slate-900">{{ row.parentName }}</p>
                <p class="text-[11px] text-slate-400">{{ row.parentPhone || '—' }}</p>
              </td>
              <td class="min-w-[10rem] px-4 py-3.5">
                <p class="text-[13px] font-medium leading-snug text-slate-800">{{ row.sessionDateLabel || row.sessionLabel }}</p>
                <p class="text-[11px] text-slate-400">{{ row.sessionTimeLabel }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-3.5 text-[13px] font-semibold text-slate-800">{{ row.places }}</td>
              <td class="whitespace-nowrap px-4 py-3.5 text-[13px] text-slate-700">{{ row.ageRange }}</td>
              <td class="whitespace-nowrap px-4 py-3.5">
                <p class="text-[13px] font-medium text-slate-800">{{ row.reservedAtDate || row.reservedAt }}</p>
                <p class="text-[11px] text-slate-400">{{ row.reservedAtTime }}</p>
              </td>
              <td class="whitespace-nowrap px-4 py-3.5">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold"
                  :class="accountKindClass(row.accountKind)"
                >
                  {{ accountKindLabel(row.accountKind) }}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <div class="relative flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#216EC2] transition hover:bg-[#DBEAFE]"
                    title="Voir"
                    @click="selectedReservation = row"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#216EC2] transition hover:bg-[#DBEAFE]"
                    title="Actions"
                    :aria-expanded="actionId === row.id"
                    @click="actionId = actionId === row.id ? null : row.id"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="12" cy="19" r="1.5" />
                    </svg>
                  </button>
                  <div
                    v-if="actionId === row.id"
                    class="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                  >
                    <button
                      type="button"
                      class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      @click="setReservationStatus(row, 'VALIDEE')"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      class="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      @click="setReservationStatus(row, 'EN_ATTENTE')"
                    >
                      En attente
                    </button>
                    <button
                      type="button"
                      class="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                      @click="setReservationStatus(row, 'ANNULEE')"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </section>
    </section>

    <!-- Popup nouvel atelier -->
    <Teleport to="body">
      <div
        v-if="addOpen"
        class="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#216EC2]/25 p-4 backdrop-blur-md supports-[backdrop-filter]:bg-[#216EC2]/20 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="atelier-form-title"
        @click.self="closeForm"
      >
        <form
          class="my-4 w-full max-w-[1100px] space-y-4 rounded-2xl border-2 border-[#216EC2]/25 bg-[#F4F8FC] p-4 shadow-2xl sm:my-8 sm:p-6"
          @submit.prevent="saveAtelier"
        >
          <div class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <!-- Informations générales -->
            <section class="rounded-xl border-2 border-[#216EC2]/30 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
              <h2 id="atelier-form-title" class="text-lg font-bold text-[#216EC2]">
                {{ editingId ? 'Modifier l’atelier' : 'Informations générale' }}
              </h2>

              <div class="mt-5 space-y-4">
                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                    Titre de l'atelier <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.title"
                    required
                    type="text"
                    placeholder="Ex: Peinture en famille"
                    class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                    Tranche d'âge <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="form.ageRange"
                    required
                    class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                  >
                    <option disabled value="">Sélectionner une tranche d'âge</option>
                    <option v-for="opt in ageRangeOptions" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                    Courte description <span class="text-red-500">*</span>
                  </label>
                  <textarea
                    v-model="form.description"
                    required
                    rows="3"
                    placeholder="Décrivez brièvement l'atelier en une ou deux phrases"
                    class="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                  />
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                    Image de l'atelier <span v-if="!editingId" class="text-red-500">*</span>
                  </label>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="sr-only"
                    @change="onImageSelected"
                  />
                  <button
                    type="button"
                    class="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#216EC2]/50 bg-[#F4F8FC] px-4 py-8 text-center transition hover:border-[#216EC2] hover:bg-[#EAF3FB]"
                    @click="imageInput?.click()"
                  >
                    <template v-if="form.imagePreview">
                      <img class="max-h-36 rounded-lg object-contain" :src="form.imagePreview" alt="Aperçu atelier" />
                      <span class="text-xs font-medium text-[#216EC2]">Cliquer pour changer l'image</span>
                    </template>
                    <template v-else>
                      <span class="flex h-12 w-12 items-center justify-center rounded-full bg-[#216EC2]/10 text-[#216EC2]" aria-hidden="true">
                        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                      <p class="text-sm font-semibold text-[#216EC2]">Cliquer pour télécharger ou glisser déposer</p>
                      <p class="text-xs text-slate-500">PNG JPG ou WEBP (Max 2MO)</p>
                    </template>
                  </button>
                  <p v-if="imageError" class="mt-2 text-xs font-medium text-red-600">{{ imageError }}</p>
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                    Informations importantes
                  </label>
                  <textarea
                    v-model="form.importantInfo"
                    rows="4"
                    placeholder="Décrivez brièvement l'atelier en une ou deux phrases"
                    class="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                  />
                </div>
              </div>
            </section>

            <div class="space-y-5">
              <!-- Informations pratiques -->
              <section class="rounded-xl border-2 border-[#216EC2]/30 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
                <h2 class="text-lg font-bold text-[#216EC2]">Informations pratiques</h2>
                <div class="mt-5 space-y-4">
                  <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                        Date de commencement <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.date"
                          required
                          type="date"
                          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                        />
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#216EC2]" aria-hidden="true">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                        Date de fin <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.endDate"
                          required
                          type="date"
                          :min="form.date || undefined"
                          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                        />
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#216EC2]" aria-hidden="true">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                        </span>
                      </div>
                      <p class="mt-1 text-xs text-slate-500">Même jour pour un atelier d’une journée, ou jusqu’à 1–2 semaines plus tard.</p>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                      Lieu <span class="text-red-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="form.location"
                        required
                        type="text"
                        placeholder="Sélectionner un lieu"
                        class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pl-10 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                      />
                      <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#216EC2]" aria-hidden="true">
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>
                      </span>
                    </div>
                  </div>

                  <div class="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                        Heure de début <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.startTime"
                          required
                          type="time"
                          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                        />
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#216EC2]" aria-hidden="true">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" stroke-linecap="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                        Heure de fin <span class="text-red-500">*</span>
                      </label>
                      <div class="relative">
                        <input
                          v-model="form.endTime"
                          required
                          type="time"
                          class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                        />
                        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#216EC2]" aria-hidden="true">
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" stroke-linecap="round" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                      Âge recommandé <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.recommendedAge"
                      required
                      class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                    >
                      <option disabled value="">Sélectionner l'âge recommandé</option>
                      <option v-for="opt in recommendedAgeOptions" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                  </div>
                </div>
              </section>

              <!-- Places et tarification -->
              <section class="rounded-xl border border-[#BFD6F0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
                <h2 class="flex items-center gap-2 text-lg font-bold text-[#216EC2]">
                  <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 9h18M8 3v4M16 3v4" stroke-linecap="round" />
                  </svg>
                  Places et tarification
                </h2>
                <div class="mt-5 space-y-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-800">
                      Nombre total de places <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="form.capacity"
                      required
                      type="number"
                      min="1"
                      placeholder="Ex: 12"
                      class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15"
                    />
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-medium text-slate-800">
                      Prix de l’atelier <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.price"
                      :required="!form.isFree"
                      :disabled="form.isFree"
                      type="text"
                      placeholder="Ex: 250 000 FCFA"
                      class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/15 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <label class="mt-3 flex cursor-pointer items-center gap-2.5 select-none">
                      <input
                        v-model="form.isFree"
                        type="checkbox"
                        class="h-4 w-4 shrink-0 rounded border-[#93C5FD] text-[#216EC2] accent-[#216EC2] focus:ring-[#216EC2]/30"
                      />
                      <span class="text-sm font-medium text-[#6B9BD1]">Cocher ici si l’atelier est gratuit</span>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-3 pt-1">
            <p v-if="formError" class="mr-auto text-sm font-medium text-red-600">{{ formError }}</p>
            <button
              type="button"
              class="rounded-xl border-2 border-[#216EC2] bg-white px-6 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5"
              :disabled="submitting"
              @click="closeForm"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
              :disabled="submitting"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 20h9" stroke-linecap="round" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke-linejoin="round" />
              </svg>
              {{ submitting ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </Teleport>

    <!-- Detail réservation -->
    <Teleport to="body">
      <div
        v-if="selectedReservation"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        @click.self="selectedReservation = null"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <h2 class="text-xl font-bold text-[#216EC2]">{{ selectedReservation.code }}</h2>
          <dl class="mt-4 space-y-3 text-sm">
            <div><dt class="text-xs font-semibold text-slate-400">Atelier</dt><dd class="font-medium">{{ selectedReservation.atelierTitle }}</dd></div>
            <div><dt class="text-xs font-semibold text-slate-400">Enfant</dt><dd>{{ selectedReservation.childName }}{{ selectedReservation.childAge ? `, ${selectedReservation.childAge} ans` : '' }}</dd></div>
            <div><dt class="text-xs font-semibold text-slate-400">Parent</dt><dd>{{ selectedReservation.parentName }} — {{ selectedReservation.parentPhone }}</dd></div>
            <div><dt class="text-xs font-semibold text-slate-400">Session</dt><dd>{{ selectedReservation.sessionLabel }}</dd></div>
            <div><dt class="text-xs font-semibold text-slate-400">Compte</dt><dd>{{ accountKindLabel(selectedReservation.accountKind) }}</dd></div>
            <div><dt class="text-xs font-semibold text-slate-400">Statut réservation</dt><dd>{{ statusLabel(selectedReservation.status) }}</dd></div>
          </dl>
          <div class="mt-6 flex justify-end">
            <button type="button" class="rounded-xl bg-[#216EC2] px-4 py-2.5 text-sm font-bold text-white" @click="selectedReservation = null">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

useHead({ title: 'Gestion des Ateliers' })

type TabKey = 'ateliers' | 'reservations'
type ReservationStatus = 'VALIDEE' | 'EN_ATTENTE' | 'ANNULEE'

type Atelier = {
  id: string
  title: string
  description: string
  importantInfo?: string
  image: string
  dateLabel: string
  dateValue: string
  endDateValue?: string
  timeLabel: string
  startTime?: string
  endTime?: string
  location?: string
  ageLabel: string
  ageRange?: string
  recommendedAge?: string
  priceLabel: string
  isFree?: boolean
  capacity: number
  booked: number
  published: boolean
  closed?: boolean
}

type Reservation = {
  id: string
  code: string
  atelierTitle: string
  atelierSubtitle: string
  atelierImage: string
  childName: string
  childAge: number
  parentName: string
  parentPhone: string
  sessionLabel: string
  sessionDate: string
  sessionEndDate?: string
  sessionDateLabel?: string
  sessionTimeLabel?: string
  places: string
  ageRange: string
  status: ReservationStatus
  accountKind?: 'PARENT' | 'VISITEUR'
  reservedAt: string
  reservedAtDate?: string
  reservedAtTime?: string
}

type OverviewDto = {
  stats: {
    total: number
    today: number
    validated: number
    pending: number
    cancelled: number
    validatedPct: number
    pendingPct: number
    cancelledPct: number
  }
  ateliers: Atelier[]
  reservations: Reservation[]
}

const { token } = useAuth()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const tab = ref<TabKey>('ateliers')
const search = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const sort = ref('date_desc')
const addOpen = ref(false)
const editingId = ref<string | null>(null)
const existingImageUrl = ref('')
const actionId = ref<string | null>(null)
const selectedReservation = ref<Reservation | null>(null)
const atelierPage = ref(1)
const atelierPageSize = 10
const imageInput = ref<HTMLInputElement | null>(null)
const imageError = ref('')
const imageFile = ref<File | null>(null)
const formError = ref<string | null>(null)
const submitting = ref(false)
const loading = ref(true)
const loadError = ref<string | null>(null)
const overview = ref<OverviewDto | null>(null)

const ageRangeOptions = ['6-18 mois', '18 mois - 3 ans', '3-4 ans', '4-6 ans', '2 à 6 ans']
const recommendedAgeOptions = ['6 mois+', '18 mois+', '2 ans+', '3 ans+', '4 ans+', 'Tous âges']

const form = reactive({
  title: '',
  ageRange: '',
  description: '',
  importantInfo: '',
  imagePreview: '' as string,
  date: '',
  endDate: '',
  location: '',
  startTime: '',
  endTime: '',
  recommendedAge: '',
  capacity: 12,
  isFree: false,
  price: '',
})

function authHeaders() {
  const t = token.value
  if (!t) throw new Error('Session expirée. Reconnectez-vous.')
  return { Authorization: `Bearer ${t}` }
}

function mediaUrl(url: string) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url
  const base = String(config.public.apiBase ?? '').replace(/\/api\/?$/, '')
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`
}

function resetForm() {
  form.title = ''
  form.ageRange = ''
  form.description = ''
  form.importantInfo = ''
  form.imagePreview = ''
  form.date = ''
  form.endDate = ''
  form.location = ''
  form.startTime = ''
  form.endTime = ''
  form.recommendedAge = ''
  form.capacity = 12
  form.isFree = false
  form.price = ''
  imageError.value = ''
  imageFile.value = null
  formError.value = null
  editingId.value = null
  existingImageUrl.value = ''
  if (imageInput.value) imageInput.value.value = ''
}

function openCreateForm() {
  resetForm()
  addOpen.value = true
}

function openEditForm(atelier: Atelier) {
  resetForm()
  editingId.value = atelier.id
  existingImageUrl.value = atelier.image
  form.title = atelier.title
  form.ageRange = atelier.ageRange || atelier.ageLabel || ''
  form.description = atelier.description
  form.importantInfo = atelier.importantInfo || ''
  form.imagePreview = mediaUrl(atelier.image)
  form.date = atelier.dateValue
  form.endDate = atelier.endDateValue || atelier.dateValue
  form.location = atelier.location || ''
  form.startTime = atelier.startTime || ''
  form.endTime = atelier.endTime || ''
  form.recommendedAge = atelier.recommendedAge || ''
  form.capacity = atelier.capacity
  form.isFree = atelier.isFree ?? atelier.priceLabel === 'Gratuit'
  form.price = form.isFree ? '' : atelier.priceLabel === '—' ? '' : atelier.priceLabel
  addOpen.value = true
}

function closeForm() {
  if (submitting.value) return
  addOpen.value = false
  resetForm()
}

function onImageSelected(event: Event) {
  imageError.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
  if (!okType) {
    imageError.value = 'Format non supporté. Utilisez PNG, JPG ou WEBP.'
    imageFile.value = null
    input.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    imageError.value = 'Image trop lourde (max 2 Mo).'
    imageFile.value = null
    input.value = ''
    return
  }
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    form.imagePreview = String(reader.result ?? '')
  }
  reader.readAsDataURL(file)
}

watch(
  () => form.isFree,
  (free) => {
    if (free) form.price = ''
  },
)

async function loadOverview() {
  loadError.value = null
  loading.value = true
  try {
    const t = token.value
    if (!t) throw new Error('Session expirée. Reconnectez-vous.')
    overview.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/ateliers`, {
      headers: { Authorization: `Bearer ${t}` },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] }; message?: string }
    const msg = err?.data?.message
    loadError.value = Array.isArray(msg) ? msg.join(', ') : msg || err?.message || 'Impossible de charger les ateliers.'
  } finally {
    loading.value = false
  }
}

const ateliers = computed(() => overview.value?.ateliers ?? [])
const reservations = computed(() => overview.value?.reservations ?? [])

const stats = computed(() => {
  const s = overview.value?.stats
  return {
    total: s?.total ?? 0,
    today: s?.today ?? 0,
    validated: s?.validated ?? 0,
    pending: s?.pending ?? 0,
    cancelled: s?.cancelled ?? 0,
    pct: (n: number) => {
      const total = s?.total ?? 0
      return total ? Math.round((n / total) * 100) : 0
    },
  }
})

const statCards = computed(() => [
  {
    key: 'total',
    title: 'Réservations totales',
    value: String(stats.value.total),
    hint: 'Toutes périodes',
    iconBg: 'bg-violet-100 text-violet-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    key: 'today',
    title: "Aujourd'hui",
    value: String(stats.value.today),
    hint: 'Réservations',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14v4M10 16h4"/></svg>`,
  },
  {
    key: 'validated',
    title: 'Validées',
    value: String(stats.value.validated),
    hint: `${stats.value.pct(stats.value.validated)}% des réservations`,
    iconBg: 'bg-sky-100 text-sky-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>`,
  },
  {
    key: 'pending',
    title: 'En attentes',
    value: String(stats.value.pending),
    hint: `${stats.value.pct(stats.value.pending)}% des réservations`,
    iconBg: 'bg-orange-100 text-orange-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  },
  {
    key: 'cancelled',
    title: 'Annulées',
    value: String(stats.value.cancelled),
    hint: `${stats.value.pct(stats.value.cancelled)}% des réservations`,
    iconBg: 'bg-amber-100 text-amber-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>`,
  },
])

function matchesSearch(text: string) {
  const q = search.value.trim().toLowerCase()
  if (!q) return true
  return text.toLowerCase().includes(q)
}

function inDateRange(start: string, end = start) {
  const from = dateFrom.value
  const to = dateTo.value
  if (from && end < from) return false
  if (to && start > to) return false
  return true
}

const filteredAteliers = computed(() => {
  let list = ateliers.value.filter(
    (a) =>
      matchesSearch(`${a.title} ${a.description}`) &&
      inDateRange(a.dateValue, a.endDateValue || a.dateValue),
  )
  if (sort.value === 'name_asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'fr'))
  else if (sort.value === 'date_asc') list = [...list].sort((a, b) => a.dateValue.localeCompare(b.dateValue))
  else if (sort.value === 'status')
    list = [...list].sort((a, b) => Number(b.published) - Number(a.published) || a.title.localeCompare(b.title, 'fr'))
  else list = [...list].sort((a, b) => b.dateValue.localeCompare(a.dateValue))
  return list
})

const atelierPageCount = computed(() => Math.max(1, Math.ceil(filteredAteliers.value.length / atelierPageSize)))

const paginatedAteliers = computed(() => {
  const start = (atelierPage.value - 1) * atelierPageSize
  return filteredAteliers.value.slice(start, start + atelierPageSize)
})

const pageRangeLabel = computed(() => {
  const total = filteredAteliers.value.length
  if (!total) return '0 pour 0'
  const start = (atelierPage.value - 1) * atelierPageSize + 1
  const end = Math.min(atelierPage.value * atelierPageSize, total)
  return `${start}–${end} pour ${total}`
})

watch([search, sort, dateFrom, dateTo], () => {
  atelierPage.value = 1
})

watch(
  () => form.date,
  (d) => {
    if (d && (!form.endDate || form.endDate < d)) form.endDate = d
  },
)

watch(atelierPageCount, (count) => {
  if (atelierPage.value > count) atelierPage.value = count
})

function placesPct(atelier: Atelier) {
  if (!atelier.capacity) return 0
  return Math.min(100, Math.round((atelier.booked / atelier.capacity) * 100))
}

function atelierSessionLabel(atelier: Atelier) {
  const datePart = atelier.dateLabel
  const start = atelier.startTime || '—'
  const end = atelier.endTime || '—'
  return `${datePart}, ${start} - ${end}`
}

const filteredReservations = computed(() => {
  let list = reservations.value.filter(
    (r) =>
      matchesSearch(`${r.code} ${r.atelierTitle} ${r.childName} ${r.parentName}`) &&
      inDateRange(r.sessionDate, r.sessionEndDate || r.sessionDate),
  )
  if (sort.value === 'name_asc') list = [...list].sort((a, b) => a.atelierTitle.localeCompare(b.atelierTitle, 'fr'))
  else if (sort.value === 'date_asc') list = [...list].sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
  else if (sort.value === 'status') list = [...list].sort((a, b) => a.status.localeCompare(b.status))
  else list = [...list].sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
  return list
})

function statusLabel(status: ReservationStatus) {
  if (status === 'VALIDEE') return 'Validée'
  if (status === 'EN_ATTENTE') return 'En attente'
  return 'Annulée'
}

function statusClass(status: ReservationStatus) {
  if (status === 'VALIDEE') return 'bg-emerald-50 text-emerald-700'
  if (status === 'EN_ATTENTE') return 'bg-orange-50 text-orange-700'
  return 'bg-slate-100 text-slate-600'
}

function accountKindLabel(kind?: 'PARENT' | 'VISITEUR') {
  return kind === 'VISITEUR' ? 'Visiteur' : 'Parent'
}

function accountKindClass(kind?: 'PARENT' | 'VISITEUR') {
  if (kind === 'VISITEUR') return 'border border-[#216EC2] bg-white text-[#216EC2]'
  return 'bg-emerald-50 text-emerald-700'
}

async function setReservationStatus(row: Reservation, status: ReservationStatus) {
  actionId.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/reservations/${row.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { status },
    })
    row.status = status
    if (selectedReservation.value?.id === row.id) {
      selectedReservation.value = { ...selectedReservation.value, status }
    }
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, 'Impossible de mettre à jour le statut.')
  }
}

function apiErrorMessage(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string | string[] }; message?: string }
  const msg = err?.data?.message
  if (Array.isArray(msg)) return msg.join(', ')
  return msg || err?.message || fallback
}

async function saveAtelier() {
  formError.value = null
  imageError.value = ''
  const hasImage = Boolean(imageFile.value || existingImageUrl.value || form.imagePreview)
  if (!hasImage) {
    imageError.value = "L'image de l'atelier est obligatoire."
    return
  }
  if (!form.title.trim() || !form.description.trim()) {
    formError.value = 'Complétez le titre et la description.'
    return
  }
  if (!form.date || !form.endDate || !form.startTime || !form.endTime || !form.location.trim()) {
    formError.value = 'Complétez les dates, les horaires et le lieu.'
    return
  }
  if (form.endDate < form.date) {
    formError.value = 'La date de fin doit être postérieure ou égale à la date de commencement.'
    return
  }
  if (!form.ageRange || !form.recommendedAge) {
    formError.value = "Sélectionnez la tranche d'âge et l'âge recommandé."
    return
  }
  if (!form.isFree && !form.price.trim()) {
    formError.value = "Indiquez le prix de l'atelier."
    return
  }

  submitting.value = true
  try {
    let imageUrl = existingImageUrl.value
    if (imageFile.value) {
      const fd = new FormData()
      fd.append('file', imageFile.value)
      const up = await $fetch<{ url: string }>(`${config.public.apiBase}/admin/ateliers/upload`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
      imageUrl = up.url
    }
    if (!imageUrl) {
      imageError.value = "L'image de l'atelier est obligatoire."
      return
    }

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      importantInfo: form.importantInfo.trim() || undefined,
      imageUrl,
      date: form.date,
      endDate: form.endDate,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      ageRange: form.ageRange,
      recommendedAge: form.recommendedAge,
      capacity: Number(form.capacity) || 1,
      isFree: form.isFree,
      price: form.isFree ? undefined : form.price.trim(),
      published: editingId.value ? undefined : true,
    }

    if (editingId.value) {
      await $fetch(`${config.public.apiBase}/admin/ateliers/${editingId.value}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body,
      })
    } else {
      await $fetch(`${config.public.apiBase}/admin/ateliers`, {
        method: 'POST',
        headers: authHeaders(),
        body: { ...body, published: true },
      })
    }

    submitting.value = false
    closeForm()
    tab.value = 'ateliers'
    await loadOverview()
  } catch (e: unknown) {
    formError.value = apiErrorMessage(e, "Impossible d'enregistrer l'atelier.")
  } finally {
    submitting.value = false
  }
}

async function togglePublish(atelier: Atelier) {
  actionId.value = atelier.id
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/${atelier.id}/publish`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { published: !atelier.published },
    })
    await loadOverview()
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, "Impossible de mettre à jour la publication.")
  } finally {
    actionId.value = null
  }
}

async function toggleClosed(atelier: Atelier) {
  const nextClosed = !atelier.closed
  if (
    nextClosed &&
    !confirm(
      `Clôturer l’atelier « ${atelier.title} » ? Il restera visible, mais le bouton Inscription sera grisé (plus de réservation).`,
    )
  ) {
    return
  }
  actionId.value = atelier.id
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/${atelier.id}/close`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { closed: nextClosed },
    })
    await loadOverview()
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, "Impossible de mettre à jour la clôture.")
  } finally {
    actionId.value = null
  }
}

async function deleteAtelier(atelier: Atelier) {
  if (!confirm(`Supprimer l'atelier « ${atelier.title} » ? Cette action est irréversible.`)) return
  actionId.value = atelier.id
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/ateliers/${atelier.id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    await loadOverview()
  } catch (e: unknown) {
    loadError.value = apiErrorMessage(e, "Impossible de supprimer l'atelier.")
  } finally {
    actionId.value = null
  }
}

onMounted(async () => {
  await loadOverview()
  const editId = String(route.query.edit || '')
  if (editId) {
    const found = ateliers.value.find((a) => a.id === editId)
    if (found) openEditForm(found)
    await router.replace({ path: '/admin/ateliers', query: {} })
  }
})
</script>
