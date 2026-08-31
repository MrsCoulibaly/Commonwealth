<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Paramétrage</h1>
      <p class="mt-1 max-w-3xl text-sm text-slate-500">
        Gérez les années scolaires, les niveaux et leurs horaires, les classes et les options.
      </p>
    </div>

    <p
      id="parametrage-feedback"
      v-if="loadError"
      class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >{{ loadError }}</p>
    <p v-if="actionNotice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ actionNotice }}</p>

    <div class="flex flex-wrap gap-2 border-b border-slate-200">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="relative px-4 py-2.5 text-sm font-semibold transition"
        :class="
          activeTab === t.id
            ? 'text-[#216EC2] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[#216EC2]'
            : 'text-slate-500 hover:text-slate-800'
        "
        @click="activeTab = t.id"
      >
        {{ t.label }} ({{ tabCounts[t.id] }})
      </button>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border-2 border-[#216EC2]/20 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-700">{{ card.title }}</h2>
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="card.iconBg" aria-hidden="true">
            <span v-html="card.icon" />
          </span>
        </div>
        <p class="text-3xl font-bold tracking-tight text-slate-900">
          <span v-if="catalogPending && card.key !== 'options'" class="inline-block h-9 w-16 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
      </article>
    </section>

    <!-- Niveaux & tarifs -->
    <div v-show="activeTab === 'levels'" class="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
      <!-- Années scolaires -->
      <aside class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <div>
            <h2 class="text-base font-bold text-slate-900">Années scolaires</h2>
            <p class="mt-0.5 text-xs leading-relaxed text-slate-500">Ouvrez, clôturez, consultez ou supprimez les années passées.</p>
          </div>
        </div>
        <button
          type="button"
          class="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#216EC2] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
          @click="openCreateYearModal"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          Ouvrir une année
        </button>
        <div v-if="yearsPending" class="text-sm text-slate-500">Chargement…</div>
        <ol v-else class="relative space-y-0 border-l-2 border-slate-200 pl-5">
          <li
            v-for="y in schoolYears"
            :key="y.id"
            class="relative pb-6 last:pb-0"
          >
            <span
              class="absolute -left-[1.35rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-white"
              :class="y.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-300'"
            />
            <button
              type="button"
              class="w-full text-left"
              :class="schoolYear === y.label ? 'rounded-xl bg-[#216EC2]/5 p-2 -ml-2 pl-2' : ''"
              @click="selectSchoolYear(y.label)"
            >
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-slate-900">{{ formatYearLabel(y.label) }}</span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  :class="y.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ y.status === 'OPEN' ? 'Ouverte' : 'Clôturée' }}
                </span>
              </div>
              <p class="mt-1 text-xs text-slate-500">
                {{ formatDateDisplay(y.startDate) }} → {{ formatDateDisplay(y.endDate) }}
              </p>
            </button>
            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <button
                v-if="y.status === 'OPEN'"
                type="button"
                class="text-xs font-semibold text-[#F9994B] transition hover:underline"
                @click="closeYear(y.id)"
              >
                Clôturer l'année
              </button>
              <button
                v-else
                type="button"
                class="text-xs font-semibold text-[#216EC2] transition hover:underline"
                @click="openYear(y.id, y.label)"
              >
                Réouvrir
              </button>
              <button
                type="button"
                class="text-xs font-semibold text-red-600 transition hover:underline disabled:opacity-40"
                :disabled="yearDeleting === y.id"
                @click="removeYear(y)"
              >
                {{ yearDeleting === y.id ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </li>
        </ol>
      </aside>

      <!-- Niveaux & tarifs -->
      <section class="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-slate-900">Niveaux & tarifs</h2>
            <p class="mt-0.5 text-xs text-slate-500">
              Année scolaire <span class="font-semibold text-[#216EC2]">{{ formatYearLabel(schoolYear) }}</span>
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            @click="openAddLevelModal"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" stroke-linecap="round" />
            </svg>
            Ajouter un niveau
          </button>
        </div>

        <div class="mb-4 flex flex-wrap items-center gap-3">
          <div class="relative min-w-[200px] flex-1">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" stroke-linecap="round" />
              </svg>
            </span>
            <input
              v-model="levelSearch"
              type="search"
              placeholder="Rechercher un niveau"
              class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
            >
          </div>
          <label class="flex items-center gap-2 text-sm text-slate-600">
            <span class="font-medium">Trier par :</span>
            <select
              v-model="levelSort"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#216EC2]"
            >
              <option value="order">Ordre</option>
              <option value="name">Nom</option>
            </select>
          </label>
        </div>

        <div v-if="catalogPending" class="py-12 text-center text-sm text-slate-500">Chargement…</div>
        <div v-else class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="min-w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th class="px-4 py-3">Nom du niveau</th>
                <th class="px-4 py-3">Ordre</th>
                <th class="px-4 py-3">Horaires & tarifs</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="row in filteredLevels" :key="row.id">
                <td class="px-4 py-3">
                  <span class="font-semibold text-slate-900">{{ row.name }}</span>
                </td>
                <td class="px-4 py-3 text-slate-600">{{ row.order ?? '—' }}</td>
                <td class="px-4 py-3">
                  <div v-if="row.schedules?.length" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="schedule in row.schedules"
                      :key="schedule.id"
                      class="inline-flex max-w-full items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                      :title="`${schedule.label}${schedule.timeDescription ? ' — ' + schedule.timeDescription : ''} · Scolarité ${intFr.format(schedule.annualXof)} XOF · Mensualité ${intFr.format(schedule.monthlyXof)} XOF / mois`"
                    >
                      <span class="truncate font-semibold">{{ schedule.label }}</span>
                      <span v-if="schedule.timeDescription" class="ml-1 truncate text-slate-400">· {{ schedule.timeDescription }}</span>
                    </span>
                  </div>
                  <span v-else class="text-xs text-slate-400">Aucun horaire — cliquez Modifier</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-lg border border-[#216EC2]/40 bg-[#216EC2]/5 px-3 py-1.5 text-xs font-bold text-[#216EC2] hover:bg-[#216EC2]/10"
                      @click="openEditLevelModal(row)"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F9994B]/40 bg-[#FFF3E0] text-[#F9994B] transition hover:bg-[#FFF3E0]/80 disabled:opacity-50"
                      title="Réactualiser les factures"
                      :disabled="pricingRegenerating === row.id"
                      @click="regeneratePricingInvoices(row.id)"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" stroke-linecap="round" />
                        <path d="M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      title="Supprimer"
                      :disabled="levelDeleting === row.id"
                      @click="removeLevel(row)"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredLevels.length">
                <td colspan="4" class="px-4 py-10 text-center text-slate-500">Aucun niveau pour le moment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Classes -->
    <div v-show="activeTab === 'classes'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div class="flex items-start gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </span>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Classes</h2>
            <p class="mt-0.5 max-w-xl text-xs text-slate-500">
              Organisez les élèves de chaque niveau en classes, avec un effectif et un enseignant principal.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          @click="openAddClassModal"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          Ajouter une classe
        </button>
      </div>

      <div class="relative mb-5 max-w-xl">
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" stroke-linecap="round" />
          </svg>
        </span>
        <input
          v-model="classSearch"
          type="search"
          placeholder="Rechercher une classe…"
          class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
        >
      </div>

      <div v-if="catalogPending" class="py-12 text-center text-sm text-slate-500">Chargement…</div>
      <div v-else-if="!filteredClassCards.length" class="rounded-xl border border-dashed border-slate-200 py-14 text-center">
        <p class="font-semibold text-slate-700">Aucune classe</p>
        <p class="mt-1 text-sm text-slate-500">Ajoutez une classe pour commencer.</p>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in filteredClassCards"
          :key="card.id"
          class="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h3 class="font-bold text-slate-900">{{ card.name }}</h3>
              <p class="text-xs text-slate-500">{{ card.levelName }}</p>
            </div>
          </div>

          <p v-if="card.headTeacher" class="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600">
            <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {{ card.headTeacher }}
          </p>
          <p v-else class="mt-3 text-sm text-slate-400">Enseignant non renseigné</p>

          <div class="mt-4 flex-1">
            <div class="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="h-full rounded-full transition-all"
                :class="card.status.tone === 'warning' ? 'bg-[#F9994B]' : 'bg-emerald-500'"
                :style="{ width: `${card.status.percent}%` }"
              />
            </div>
            <div class="mt-2 flex items-center justify-between gap-2 text-xs">
              <span class="font-semibold text-slate-700">{{ card.studentCount }}/{{ card.capacity }}</span>
              <span
                class="rounded-full px-2 py-0.5 font-bold"
                :class="card.status.tone === 'warning' ? 'bg-[#FFF3E0] text-[#F9994B]' : 'bg-emerald-50 text-emerald-700'"
              >
                {{ card.status.label }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              class="rounded-lg border border-[#216EC2]/40 bg-[#216EC2]/5 px-3 py-1.5 text-xs font-bold text-[#216EC2] hover:bg-[#216EC2]/10"
              @click="openEditClassModal(card)"
            >
              Modifier
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              title="Supprimer"
              :disabled="classDeleting === card.id"
              @click="removeClass(card.id, card.name)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- Services -->
    <div v-show="activeTab === 'options'" class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex gap-3">
          <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </span>
          <div>
            <h2 class="text-lg font-bold text-slate-900">Options</h2>
            <p class="mt-0.5 max-w-xl text-xs text-slate-500">
              Cantine, transport, garderie… Prix unique ou formules personnalisables. Les parents choisiront lors de l'inscription.
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          @click="openAddServiceModal"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14" stroke-linecap="round" />
          </svg>
          Ajouter une option
        </button>
      </div>

      <div v-if="servicesPending" class="py-12 text-center text-sm text-slate-500">Chargement…</div>
      <div v-else-if="!services.length" class="rounded-xl border border-dashed border-slate-200 py-14 text-center">
        <p class="font-semibold text-slate-700">Aucune option</p>
        <p class="mt-1 text-sm text-slate-500">Ajoutez une option pour les inscriptions.</p>
      </div>
      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="s in services"
          :key="s.id"
          class="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <span
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#216EC2]/10 text-[#216EC2]"
              v-html="serviceIconSvg(s.code)"
            />
            <button
              type="button"
              role="switch"
              :aria-checked="s.active"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#216EC2]/30 disabled:opacity-50"
              :class="s.active ? 'bg-emerald-500' : 'bg-slate-200'"
              :disabled="serviceToggling === s.id"
              :title="s.active ? 'Désactiver' : 'Activer'"
              @click="toggleServiceActive(s)"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform"
                :class="s.active ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <h3 class="mt-3 font-bold text-slate-900">{{ s.label }}</h3>
          <p class="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{{ s.pricingModeLabel }}</p>
          <p v-if="s.pricingMode === 'FLAT'" class="mt-1 text-sm font-semibold text-slate-700">
            {{ intFr.format(s.amountXof) }} XOF
            <span class="font-normal text-slate-500">/ {{ s.billingPeriodLabel }}</span>
          </p>
          <ul v-else class="mt-2 space-y-1 text-sm text-slate-700">
            <li v-for="v in s.variants" :key="v.id">
              {{ v.label }} — {{ intFr.format(v.amountXof) }} XOF / {{ v.billingPeriodLabel }}
            </li>
          </ul>

          <div class="mt-3 flex items-center gap-2 text-xs">
            <template v-if="s.active">
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span class="font-semibold text-emerald-700">Actif</span>
              <span class="text-slate-400">·</span>
              <span class="text-slate-500">{{ intFr.format(s.subscriberCount) }} abonné{{ s.subscriberCount !== 1 ? 's' : '' }}</span>
            </template>
            <span v-else class="font-medium text-slate-400">Inactif</span>
          </div>

          <div class="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              class="rounded-lg border border-[#216EC2]/40 bg-[#216EC2]/5 px-3 py-1.5 text-xs font-bold text-[#216EC2] hover:bg-[#216EC2]/10"
              @click="openEditServiceModal(s)"
            >
              Modifier
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
              title="Supprimer"
              :disabled="serviceDeleting === s.id"
              @click="removeService(s)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="openYearModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="openYearModal = false"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900">Ouvrir une année scolaire</h3>
          <p class="mt-1 text-sm text-slate-500">Définissez le libellé et la période de la nouvelle année.</p>
          <form class="mt-5 space-y-4" @submit.prevent="submitCreateSchoolYear">
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Libellé</span>
              <input v-model.trim="newYear.label" type="text" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="2026-2027">
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Début</span>
                <input v-model="newYear.startDate" type="date" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Fin</span>
                <input v-model="newYear.endDate" type="date" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              </label>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="openYearModal = false">Annuler</button>
              <button type="submit" class="rounded-xl bg-[#216EC2] px-4 py-2 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50" :disabled="yearSubmitting">
                {{ yearSubmitting ? 'Création…' : 'Ouvrir' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="addLevelModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="addLevelModal = false"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900">Ajouter un niveau</h3>
          <p class="mt-1 text-sm text-slate-500">Créez un niveau avec au moins un horaire et ses tarifs pour {{ formatYearLabel(schoolYear) }}.</p>
          <form class="mt-5 space-y-4" @submit.prevent="submitNewLevelFromModal">
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Nom du niveau</span>
              <input v-model.trim="newLevel.name" required type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Ex. Crèche, CP…">
            </label>
            <label class="block max-w-[8rem]">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Ordre</span>
              <input v-model.number="newLevel.order" type="number" step="1" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="1">
            </label>

            <div class="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Horaires & tarifs</p>
              <p class="text-xs leading-relaxed text-slate-500">
                Les frais de scolarité (une fois) et la mensualité s’appliquent toujours. Sans échéancier : une facture annuelle = scolarité + mensualité × 10 mois (sept. à juin). Avec échéancier : une facture de scolarité + une facture par mois.
              </p>
              <div v-for="(row, index) in newLevelSchedules" :key="index" class="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                <label class="block sm:col-span-2">
                  <span class="mb-1 block text-xs font-semibold text-slate-600">Libellé</span>
                  <input v-model.trim="row.label" required type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Temps plein">
                </label>
                <label class="block sm:col-span-2">
                  <span class="mb-1 block text-xs font-semibold text-slate-600">Plage horaire</span>
                  <input v-model.trim="row.timeDescription" type="text" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="8h00 – 17h00">
                </label>
                <label class="block">
                  <span class="mb-1 block text-xs font-semibold text-slate-600">Frais de scolarité (XOF)</span>
                  <input v-model.number="row.annualXof" required type="number" min="0" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                </label>
                <label class="block">
                  <span class="mb-1 block text-xs font-semibold text-slate-600">Mensualité (XOF)</span>
                  <input v-model.number="row.monthlyXof" required type="number" min="0" class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                </label>
              </div>
              <button type="button" class="text-sm font-semibold text-[#216EC2] hover:underline" @click="addNewLevelScheduleRow">+ Ajouter un horaire</button>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="addLevelModal = false">Annuler</button>
              <button type="submit" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50" :disabled="levelSubmitting">
                {{ levelSubmitting ? 'Enregistrement…' : 'Créer le niveau' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="addClassModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="addClassModal = false"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900">Ajouter une classe</h3>
          <p class="mt-1 text-sm text-slate-500">Rattachez la classe à un niveau et renseignez l'effectif.</p>
          <form class="mt-5 space-y-4" @submit.prevent="submitNewClassFromModal">
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Niveau</span>
              <select v-model="newClass.levelId" required class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="" disabled>Sélectionner un niveau</option>
                <option v-for="l in catalog?.levels ?? []" :key="l.id" :value="l.id">{{ l.name }}</option>
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Nom de la classe</span>
              <input v-model.trim="newClass.name" required type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" placeholder="Ex. Crèche A">
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Enseignant principal</span>
              <select v-model="newClass.headTeacher" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="">— Sélectionner —</option>
                <option v-for="s in staffOptions" :key="s.id" :value="s.label">{{ s.label }}</option>
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Effectif maximum</span>
              <input v-model.number="newClass.capacity" required type="number" min="1" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            </label>
            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="addClassModal = false">Annuler</button>
              <button type="submit" class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50" :disabled="classSubmitting">
                {{ classSubmitting ? 'Création…' : 'Créer la classe' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="addServiceModal"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        @click.self="addServiceModal = false"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <h3 class="text-lg font-bold text-slate-900">Ajouter une option</h3>
          <p class="mt-1 text-sm text-slate-500">Prix unique ou formules personnalisables (ex. cantine).</p>
          <form class="mt-5 space-y-4" @submit.prevent="submitNewService">
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Code</span>
              <input
                v-model.trim="newService.code"
                type="text"
                required
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm uppercase"
                placeholder="CANTINE"
              >
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Libellé</span>
              <input
                v-model.trim="newService.label"
                type="text"
                required
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                placeholder="Cantine"
              >
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Mode de tarification</span>
              <select v-model="newService.pricingMode" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                <option value="FLAT">Prix unique</option>
                <option value="CUSTOMIZABLE">Personnalisable (variantes)</option>
              </select>
            </label>
            <div v-if="newService.pricingMode === 'FLAT'" class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Tarif (XOF)</span>
                <input
                  v-model.number="newService.amountXof"
                  type="number"
                  min="0"
                  step="1"
                  required
                  class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
              </label>
              <label class="block">
                <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Période</span>
                <select v-model="newService.billingPeriod" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
                  <option value="MONTHLY">Mensuel</option>
                  <option value="YEARLY">Annuel</option>
                </select>
              </label>
            </div>
            <div v-else class="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Variantes</p>
              <div v-for="(v, i) in newServiceVariants" :key="i" class="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2">
                <input v-model.trim="v.label" type="text" class="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Repas + goûter">
                <input v-model.trim="v.code" type="text" class="rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase" placeholder="COMPLET">
                <input v-model.number="v.amountXof" type="number" min="0" class="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Tarif XOF">
              </div>
              <button type="button" class="text-sm font-semibold text-[#216EC2] hover:underline" @click="addNewServiceVariant">+ Ajouter une variante</button>
            </div>
            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                @click="addServiceModal = false"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                :disabled="serviceSubmitting"
              >
                {{ serviceSubmitting ? 'Création…' : 'Créer l’option' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AdminLevelEditModal
        v-if="editLevelModal"
        :initial-name="editLevelModal.name"
        :initial-order="editLevelModal.order"
        :school-year-label="formatYearLabel(schoolYear)"
        :initial-rows="editLevelScheduleRows"
        :saving="levelEditSaving"
        @close="editLevelModal = null"
        @save="saveLevelEdit"
      />

      <AdminServiceEditModal
        v-if="editServiceDraft"
        :key="editServiceDraft.id"
        :initial-code="editServiceDraft.code"
        :initial-label="editServiceDraft.label"
        :initial-pricing-mode="editServiceDraft.pricingMode"
        :initial-amount-xof="editServiceDraft.amountXof"
        :initial-billing-period="editServiceDraft.billingPeriod"
        :initial-variants="editServiceDraft.variants"
        :school-year-label="formatYearLabel(schoolYear)"
        :saving="serviceEditSaving"
        :server-error="serviceEditError"
        @close="closeEditServiceModal"
        @save="saveServiceEdit"
      />

      <AdminClassEditModal
        v-if="editClassDraft"
        :key="editClassDraft.id"
        :initial-level-name="editClassDraft.levelName"
        :initial-name="editClassDraft.name"
        :initial-head-teacher="editClassDraft.headTeacher"
        :initial-capacity="editClassDraft.capacity"
        :initial-student-count="editClassDraft.studentCount"
        :school-year-label="formatYearLabel(schoolYear)"
        :staff-options="staffOptions"
        :saving="classEditSaving"
        :server-error="classEditError"
        @close="closeEditClassModal"
        @save="saveClassEdit"
      />

      <div
        v-if="confirmModalOpen"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 px-4"
        role="dialog"
        aria-modal="true"
        @click.self="resolveConfirmation(false)"
      >
        <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
          <h3 class="text-base font-semibold text-slate-900">{{ confirmModalTitle }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">{{ confirmModalMessage }}</p>
          <ul
            v-if="confirmModalItems.length"
            class="mt-3 list-disc space-y-1 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-700"
          >
            <li v-for="item in confirmModalItems" :key="item">{{ item }}</li>
          </ul>
          <p v-if="confirmModalKeepNote" class="mt-3 text-xs leading-relaxed text-slate-500">{{ confirmModalKeepNote }}</p>
          <p v-if="confirmModalWarning" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{{ confirmModalWarning }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <template v-if="confirmModalMode === 'alert'">
              <button
                type="button"
                class="rounded-lg bg-[#216EC2] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
                @click="resolveConfirmation(true)"
              >
                OK
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                @click="resolveConfirmation(false)"
              >
                Annuler
              </button>
              <button
                type="button"
                class="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                @click="resolveConfirmation(true)"
              >
                {{ confirmModalConfirmLabel }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import type { ClassEditPayload } from '~/components/admin/AdminClassEditModal.vue';
import type { LevelEditPayload, ScheduleRowDraft } from '~/components/admin/AdminLevelEditModal.vue';
import type { ServiceEditPayload, ServiceVariantDraft } from '~/components/admin/AdminServiceEditModal.vue';

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
});

type CatalogClass = {
  id: string;
  name: string;
  capacity: number;
  headTeacher: string;
  studentCount: number;
};

type LevelScheduleItem = {
  id: string;
  label: string;
  timeDescription: string;
  annualTuitionCents: number;
  monthlyBaseCents: number;
  annualXof: number;
  monthlyXof: number;
  order: number | null;
  active: boolean;
};

type CatalogLevel = {
  id: string;
  name: string;
  order: number | null;
  enrollmentCount?: number;
  classes: CatalogClass[];
  pricing: {
    id: string;
    annualTuitionCents: number;
    monthlyBaseCents: number;
  } | null;
  schedules: LevelScheduleItem[];
};

type CatalogDto = {
  schoolYear: string;
  levels: CatalogLevel[];
};

type SchoolYearDto = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
};

type YearDeletionImpact = {
  id: string;
  label: string;
  status: 'OPEN' | 'CLOSED';
  remainingYears: number;
  willReopenLabel: string | null;
  enrollments: number;
  approvedEnrollments: number;
  tuitionCharges: number;
  monthlyInstallments: number;
  monthlyPayments: number;
  programEvents: number;
  schedules: number;
  pricings: number;
  servicePrices: number;
};

type ServiceItem = {
  id: string;
  code: string;
  label: string;
  active: boolean;
  amountCents: number;
  amountXof: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  billingPeriodLabel: string;
  pricingMode: 'FLAT' | 'CUSTOMIZABLE';
  pricingModeLabel: string;
  subscriberCount: number;
  variants: Array<{
    id: string;
    code: string;
    label: string;
    amountCents: number;
    amountXof: number;
    billingPeriod: 'MONTHLY' | 'YEARLY';
    billingPeriodLabel: string;
    order: number | null;
    active: boolean;
  }>;
};

const tabs = [
  { id: 'levels' as const, label: 'Niveaux & tarifs' },
  { id: 'classes' as const, label: 'Classes' },
  { id: 'options' as const, label: 'Options' },
];

const { token } = useAuth();
const config = useRuntimeConfig();

const activeTab = ref<(typeof tabs)[number]['id']>('levels');
const schoolYear = ref(defaultSchoolYear());
const catalog = ref<CatalogDto | null>(null);
const catalogPending = ref(true);
const loadError = ref<string | null>(null);
const actionNotice = ref<string | null>(null);
const schoolYears = ref<SchoolYearDto[]>([]);
const yearsPending = ref(false);
const yearSubmitting = ref(false);
const yearDeleting = ref<string | null>(null);

const newYear = reactive({
  label: '',
  startDate: '',
  endDate: '',
});


const newLevel = reactive({
  name: '',
  order: null as number | null,
});

function emptyScheduleRow(order = 1): ScheduleRowDraft {
  return { label: '', timeDescription: '', annualXof: 0, monthlyXof: 0, order };
}

const newLevelSchedules = ref<ScheduleRowDraft[]>([emptyScheduleRow()]);
const editLevelModal = ref<CatalogLevel | null>(null);
const levelEditSaving = ref(false);

const editLevelScheduleRows = computed((): ScheduleRowDraft[] => {
  const level = editLevelModal.value;
  if (!level) return [emptyScheduleRow()];
  return scheduleRowsForLevel(level);
});

const newClass = reactive({
  levelId: '',
  name: '',
  headTeacher: '',
  capacity: 22,
});

const levelSubmitting = ref(false);
const classSubmitting = ref(false);
const classDeleting = ref<string | null>(null);
const levelDeleting = ref<string | null>(null);
const classEditSaving = ref(false);
const classEditError = ref<string | null>(null);
const editClassDraft = ref<{
  id: string;
  levelName: string;
  name: string;
  headTeacher: string;
  capacity: number;
  studentCount: number;
} | null>(null);
const classSearch = ref('');
const addClassModal = ref(false);
const staffOptions = ref<Array<{ id: string; label: string }>>([]);
const pricingRegenerating = ref<string | null>(null);
const services = ref<ServiceItem[]>([]);
const servicesPending = ref(false);
const serviceSubmitting = ref(false);
const serviceToggling = ref<string | null>(null);
const serviceDeleting = ref<string | null>(null);
type ServiceEditDraft = {
  id: string;
  code: string;
  label: string;
  pricingMode: 'FLAT' | 'CUSTOMIZABLE';
  amountXof: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  variants: ServiceVariantDraft[];
};

const addServiceModal = ref(false);
const editServiceDraft = ref<ServiceEditDraft | null>(null);
const serviceEditSaving = ref(false);
const serviceEditError = ref<string | null>(null);
const newService = reactive({
  code: '',
  label: '',
  amountXof: 0,
  billingPeriod: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
  pricingMode: 'FLAT' as 'FLAT' | 'CUSTOMIZABLE',
});

const newServiceVariants = ref<Array<{ code: string; label: string; amountXof: number }>>([
  { code: '', label: '', amountXof: 0 },
]);

const confirmModalOpen = ref(false);
const confirmModalMessage = ref('');
const confirmModalTitle = ref('Confirmation');
const confirmModalMode = ref<'confirm' | 'alert'>('confirm');
const confirmModalItems = ref<string[]>([]);
const confirmModalKeepNote = ref('');
const confirmModalWarning = ref('');
const confirmModalConfirmLabel = ref('Supprimer');
let confirmResolver: ((ok: boolean) => void) | null = null;

const levelSearch = ref('');
const levelSort = ref<'order' | 'name'>('order');
const openYearModal = ref(false);
const addLevelModal = ref(false);
const dashStats = ref<{ totalStudents: number } | null>(null);

const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
const xofCompact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });

const tabCounts = computed(() => ({
  levels: catalog.value?.levels?.length ?? 0,
  classes: (catalog.value?.levels ?? []).reduce((sum, l) => sum + l.classes.length, 0),
  options: services.value.length,
}));

const expectedMonthlyRevenueXof = computed(() => {
  const students = dashStats.value?.totalStudents ?? 0;
  const levels = catalog.value?.levels ?? [];
  if (!students || !levels.length) return 0;
  const totalMonthlyCents = levels.reduce((sum, l) => sum + (l.pricing?.monthlyBaseCents ?? 0), 0);
  const avgMonthly = totalMonthlyCents / levels.length / 100;
  return Math.round(avgMonthly * students);
});

const statCards = computed(() => [
  {
    key: 'levels',
    title: 'Niveaux',
    value: intFr.format(tabCounts.value.levels),
    iconBg: 'bg-[#216EC2]/10 text-[#216EC2]',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/></svg>`,
  },
  {
    key: 'classes',
    title: 'Classes',
    value: intFr.format(tabCounts.value.classes),
    iconBg: 'bg-violet-100 text-violet-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  },
  {
    key: 'students',
    title: 'Élèves inscrits',
    value: dashStats.value != null ? intFr.format(dashStats.value.totalStudents) : '—',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  },
  {
    key: 'revenue',
    title: 'Revenu mensuel attendu',
    value: expectedMonthlyRevenueXof.value > 0 ? `${xofCompact.format(expectedMonthlyRevenueXof.value)} XOF` : '—',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
]);

const filteredLevels = computed(() => {
  let rows = [...(catalog.value?.levels ?? [])];
  const q = levelSearch.value.trim().toLowerCase();
  if (q) rows = rows.filter((r) => r.name.toLowerCase().includes(q));
  if (levelSort.value === 'name') {
    rows.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  } else {
    rows.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  }
  return rows;
});

type ClassCard = CatalogClass & {
  levelName: string;
  status: { label: string; tone: 'ok' | 'warning'; percent: number };
};

function classCapacityStatus(studentCount: number, capacity: number) {
  const cap = Math.max(1, capacity);
  const ratio = studentCount / cap;
  const remaining = cap - studentCount;
  const percent = Math.min(100, Math.round(ratio * 100));
  if (ratio >= 0.85 || remaining <= 3) {
    return { label: 'Presque complète', tone: 'warning' as const, percent };
  }
  return { label: 'Places disponibles', tone: 'ok' as const, percent };
}

const filteredClassCards = computed(() => {
  const q = classSearch.value.trim().toLowerCase();
  const cards: ClassCard[] = [];
  for (const level of catalog.value?.levels ?? []) {
    for (const c of level.classes) {
      if (q && !c.name.toLowerCase().includes(q) && !level.name.toLowerCase().includes(q)) continue;
      cards.push({
        ...c,
        levelName: level.name,
        status: classCapacityStatus(c.studentCount, c.capacity),
      });
    }
  }
  return cards.sort((a, b) => a.levelName.localeCompare(b.levelName, 'fr') || a.name.localeCompare(b.name, 'fr'));
});

function formatDateDisplay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatYearLabel(label: string) {
  return label.replace('-', '–');
}

function selectSchoolYear(label: string) {
  schoolYear.value = label;
  void reloadCatalog();
}

function openCreateYearModal() {
  const defaults = defaultYearDates();
  newYear.label = defaults.label;
  newYear.startDate = defaults.startDate;
  newYear.endDate = defaults.endDate;
  openYearModal.value = true;
}

function openAddClassModal() {
  newClass.levelId = catalog.value?.levels?.[0]?.id ?? '';
  newClass.name = '';
  newClass.headTeacher = '';
  newClass.capacity = 22;
  addClassModal.value = true;
  void loadStaffOptions();
}

function openEditClassModal(card: ClassCard) {
  classEditError.value = null;
  editClassDraft.value = {
    id: card.id,
    levelName: card.levelName,
    name: card.name,
    headTeacher: card.headTeacher ?? '',
    capacity: card.capacity,
    studentCount: card.studentCount,
  };
  void loadStaffOptions();
}

function closeEditClassModal() {
  editClassDraft.value = null;
  classEditError.value = null;
}

async function saveClassEdit(payload: ClassEditPayload) {
  const classId = editClassDraft.value?.id;
  const t = token.value;
  if (!classId || !t) return;

  classEditSaving.value = true;
  classEditError.value = null;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/classes/${classId}`, {
      method: 'PATCH',
      headers: api.value.headers,
      body: {
        name: payload.name,
        headTeacher: payload.headTeacher || undefined,
        capacity: payload.capacity,
        schoolYear: schoolYear.value.trim() || defaultSchoolYear(),
      },
    });

    closeEditClassModal();
    await reloadCatalog();
    actionNotice.value = 'Classe mise à jour.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    const message =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Mise à jour de la classe impossible.';
    classEditError.value = message;
    loadError.value = message;
  } finally {
    classEditSaving.value = false;
  }
}

async function loadStaffOptions() {
  const t = token.value;
  if (!t) return;
  try {
    const data = await $fetch<{ staffOptions: Array<{ id: string; label: string }> }>(
      `${config.public.apiBase}/admin/programme`,
      { headers: api.value.headers },
    );
    staffOptions.value = data.staffOptions ?? [];
  } catch {
    staffOptions.value = [];
  }
}

async function submitNewClassFromModal() {
  await submitNewClass();
  if (!loadError.value) addClassModal.value = false;
}

async function removeLevel(row: CatalogLevel) {
  const attached =
    row.enrollmentCount ?? row.classes.reduce((sum, c) => sum + (c.studentCount ?? 0), 0);
  if (attached > 0) {
    await askAlert(levelDeleteBlockedMessage(row.name, attached), 'Suppression impossible');
    return;
  }

  const ok = await askConfirmation(
    `Supprimer le niveau « ${row.name} » ? Les classes vides, horaires et tarifs associés seront aussi supprimés.`,
  );
  if (!ok) return;
  const t = token.value;
  if (!t) {
    await askAlert('Session expirée. Reconnectez-vous pour supprimer un niveau.', 'Suppression impossible');
    return;
  }
  levelDeleting.value = row.id;
  loadError.value = null;
  actionNotice.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/levels/${row.id}`, {
      method: 'DELETE',
      headers: api.value.headers,
    });
    await reloadCatalog();
    actionNotice.value = `Niveau « ${row.name} » supprimé.`;
  } catch (e: unknown) {
    const message = apiErrorMessage(e, 'Suppression du niveau impossible.');
    loadError.value = message;
    await nextTick();
    document.getElementById('parametrage-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await askAlert(message, 'Suppression impossible');
  } finally {
    levelDeleting.value = null;
  }
}

async function removeClass(id: string, name: string) {
  if (!confirm(`Supprimer la classe « ${name} » ?`)) return;
  const t = token.value;
  if (!t) return;
  classDeleting.value = id;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/classes/${id}`, {
      method: 'DELETE',
      headers: api.value.headers,
    });
    await reloadCatalog();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Suppression impossible.';
  } finally {
    classDeleting.value = null;
  }
}

async function submitCreateSchoolYear() {
  await createSchoolYear();
  if (!loadError.value) openYearModal.value = false;
}

async function submitNewLevelFromModal() {
  await submitNewLevel();
  if (!loadError.value) addLevelModal.value = false;
}

async function loadDashStats() {
  const t = token.value;
  if (!t) return;
  try {
    const data = await $fetch<{ stats: { totalStudents: number } }>(`${config.public.apiBase}/admin/dashboard`, {
      headers: api.value.headers,
    });
    dashStats.value = { totalStudents: data.stats.totalStudents };
  } catch {
    dashStats.value = null;
  }
}

function defaultSchoolYear(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  if (m >= 9) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

function defaultYearDates() {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const start = m >= 9 ? y : y - 1;
  const end = start + 1;
  return {
    label: `${start}-${end}`,
    startDate: `${start}-09-01`,
    endDate: `${end}-07-31`,
  };
}

function xofToCents(xof: number): number {
  if (!Number.isFinite(xof) || xof < 0) return 0;
  return Math.round(xof * 100);
}

function serviceIconSvg(code: string): string {
  const c = code.trim().toUpperCase();
  if (c.includes('CANTINE') || c.includes('RESTAU')) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
  }
  if (c.includes('BUS') || c.includes('TRANSPORT')) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L21 4H3L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2L3 18h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>';
  }
  if (c.includes('GARDERIE') || c.includes('GARDE')) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  }
  if (c.includes('SPORT') || c.includes('ACTIV')) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>';
  }
  if (c.includes('SOUTIEN') || c.includes('COURS')) {
    return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>';
  }
  return '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>';
}

const api = computed(() => ({
  headers: { Authorization: `Bearer ${token.value ?? ''}` },
}));

async function reloadCatalog() {
  const t = token.value;
  if (!t) {
    catalog.value = null;
    catalogPending.value = false;
    return;
  }
  catalogPending.value = true;
  loadError.value = null;
  const sy = schoolYear.value.trim() || defaultSchoolYear();
  schoolYear.value = sy;
  try {
    catalog.value = await $fetch<CatalogDto>(
      `${config.public.apiBase}/admin/settings/catalog`,
      {
        headers: api.value.headers,
        query: { schoolYear: sy },
      },
    );
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger le paramétrage.';
    catalog.value = null;
  } finally {
    catalogPending.value = false;
  }
}

async function loadSchoolYears() {
  const t = token.value;
  if (!t) return;
  yearsPending.value = true;
  try {
    const res = await $fetch<{ items: SchoolYearDto[] }>(
      `${config.public.apiBase}/admin/settings/school-years`,
      { headers: api.value.headers },
    );
    schoolYears.value = res.items ?? [];
    const active = schoolYears.value.find((y) => y.status === 'OPEN');
    if (active && !schoolYear.value) schoolYear.value = active.label;
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : "Impossible de charger les années scolaires.";
  } finally {
    yearsPending.value = false;
  }
}

async function createSchoolYear() {
  const t = token.value;
  if (!t) return;
  yearSubmitting.value = true;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/school-years`, {
      method: 'POST',
      headers: api.value.headers,
      body: {
        label: newYear.label.trim(),
        startDate: newYear.startDate,
        endDate: newYear.endDate,
        openNow: true,
      },
    });
    const defaults = defaultYearDates();
    newYear.label = defaults.label;
    newYear.startDate = defaults.startDate;
    newYear.endDate = defaults.endDate;
    await loadSchoolYears();
    const active = schoolYears.value.find((y) => y.status === 'OPEN');
    if (active) {
      schoolYear.value = active.label;
      await reloadCatalog();
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : "Création de l'année impossible.";
  } finally {
    yearSubmitting.value = false;
  }
}

async function closeYear(id: string) {
  const t = token.value;
  if (!t) return;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/school-years/${id}/close`, {
      method: 'PATCH',
      headers: api.value.headers,
    });
    await loadSchoolYears();
  } catch {
    loadError.value = "Clôture de l'année impossible.";
  }
}

async function openYear(id: string, label: string) {
  const t = token.value;
  if (!t) return;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/school-years/${id}/open`, {
      method: 'PATCH',
      headers: api.value.headers,
    });
    schoolYear.value = label;
    await loadSchoolYears();
    await reloadCatalog();
  } catch {
    loadError.value = "Ouverture de l'année impossible.";
  }
}

function frCount(n: number, singular: string, plural: string) {
  return `${intFr.format(n)} ${n > 1 ? plural : singular}`;
}

function yearDeletionItems(impact: YearDeletionImpact): string[] {
  const items: string[] = [`L’année scolaire ${formatYearLabel(impact.label)} elle-même`];
  if (impact.enrollments > 0) {
    const extra =
      impact.approvedEnrollments > 0
        ? ` (dont ${frCount(impact.approvedEnrollments, 'dossier validé', 'dossiers validés')})`
        : '';
    items.push(`${frCount(impact.enrollments, 'dossier d’inscription', 'dossiers d’inscription')}${extra}`);
  }
  if (impact.tuitionCharges > 0) {
    items.push(frCount(impact.tuitionCharges, 'facture de scolarité', 'factures de scolarité'));
  }
  if (impact.monthlyInstallments > 0) {
    items.push(frCount(impact.monthlyInstallments, 'échéance mensuelle', 'échéances mensuelles'));
  }
  if (impact.monthlyPayments > 0) {
    items.push(frCount(impact.monthlyPayments, 'paiement mensuel', 'paiements mensuels'));
  }
  if (impact.programEvents > 0) {
    items.push(frCount(impact.programEvents, 'événement du programme', 'événements du programme'));
  }
  if (impact.schedules > 0) {
    items.push(frCount(impact.schedules, 'horaire de niveau', 'horaires de niveau'));
  }
  if (impact.pricings > 0) {
    items.push(frCount(impact.pricings, 'barème de scolarité', 'barèmes de scolarité'));
  }
  if (impact.servicePrices > 0) {
    items.push(frCount(impact.servicePrices, 'tarif d’option (cantine, bus…)', 'tarifs d’options (cantine, bus…)'));
  }
  return items;
}

async function removeYear(year: SchoolYearDto) {
  const t = token.value;
  if (!t) {
    await askAlert('Session expirée. Reconnectez-vous pour supprimer une année.', 'Suppression impossible');
    return;
  }
  yearDeleting.value = year.id;
  loadError.value = null;
  actionNotice.value = null;
  try {
    const impact = await $fetch<YearDeletionImpact>(
      `${config.public.apiBase}/admin/settings/school-years/${year.id}/deletion-impact`,
      { headers: api.value.headers },
    );
    yearDeleting.value = null;
    const warnings: string[] = [];
    if (impact.remainingYears === 0) {
      warnings.push('Ce sera la dernière année scolaire. Vous devrez en ouvrir une nouvelle pour continuer.');
    } else if (impact.willReopenLabel) {
      warnings.push(
        `L’année ${formatYearLabel(impact.willReopenLabel)} sera rouverte automatiquement pour que le paramétrage reste utilisable.`,
      );
    }
    const ok = await askConfirmation(
      `Vous allez supprimer définitivement l’année ${formatYearLabel(impact.label)} (${impact.status === 'OPEN' ? 'ouverte' : 'clôturée'}). Tout ce qui est rattaché à cette année sera effacé. Cette action est irréversible.`,
      {
        title: 'Supprimer cette année scolaire ?',
        items: yearDeletionItems(impact),
        keepNote:
          'Les comptes parents, les fiches élèves, les niveaux et les classes du catalogue sont conservés : ils ne dépendent pas d’une année.',
        warning: warnings.join(' '),
        confirmLabel: 'Supprimer définitivement',
      },
    );
    if (!ok) return;

    yearDeleting.value = year.id;
    const res = await $fetch<{ ok: boolean; label: string; remainingLabel: string | null; reopenedLabel: string | null }>(
      `${config.public.apiBase}/admin/settings/school-years/${year.id}`,
      { method: 'DELETE', headers: api.value.headers },
    );
    await loadSchoolYears();
    const nextLabel = res.reopenedLabel ?? res.remainingLabel ?? schoolYears.value[0]?.label ?? '';
    schoolYear.value = nextLabel;
    if (nextLabel) await reloadCatalog();
    else catalog.value = null;
    actionNotice.value = res.reopenedLabel
      ? `Année ${formatYearLabel(impact.label)} supprimée. L’année ${formatYearLabel(res.reopenedLabel)} a été rouverte.`
      : `Année ${formatYearLabel(impact.label)} supprimée.`;
  } catch (e: unknown) {
    const message = apiErrorMessage(e, "Suppression de l'année scolaire impossible.");
    loadError.value = message;
    await nextTick();
    document.getElementById('parametrage-feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await askAlert(message, 'Suppression impossible');
  } finally {
    yearDeleting.value = null;
  }
}

async function submitNewLevel() {
  const t = token.value;
  if (!t) return;
  levelSubmitting.value = true;
  loadError.value = null;
  try {
    const schedules = newLevelSchedules.value
      .map((row, index) => ({
        label: row.label.trim(),
        timeDescription: row.timeDescription.trim(),
        annualTuitionCents: xofToCents(Number(row.annualXof)),
        monthlyBaseCents: xofToCents(Number(row.monthlyXof)),
        order: index + 1,
      }))
      .filter((row) => row.label);

    const body: Record<string, unknown> = {
      name: newLevel.name,
      schoolYear: schoolYear.value.trim(),
      schedules,
    };
    if (newLevel.order !== null && newLevel.order !== undefined && !Number.isNaN(Number(newLevel.order))) {
      body.order = Number(newLevel.order);
    }
    await $fetch(`${config.public.apiBase}/admin/settings/levels`, {
      method: 'POST',
      headers: api.value.headers,
      body,
    });
    newLevel.name = '';
    newLevel.order = null;
    newLevelSchedules.value = [emptyScheduleRow()];
    await reloadCatalog();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Création du niveau impossible.';
  } finally {
    levelSubmitting.value = false;
  }
}

async function regeneratePricingInvoices(levelId: string) {
  const t = token.value;
  if (!t) return;
  pricingRegenerating.value = levelId;
  loadError.value = null;
  try {
    const result = await $fetch<{
      enrollmentsFound: number;
      enrollmentsProcessed: number;
      deleted: { tuitionCharges: number; monthlyInstallments: number };
      warnings: string[];
    }>(`${config.public.apiBase}/admin/settings/levels/${levelId}/pricing/regenerate`, {
      method: 'POST',
      headers: api.value.headers,
      body: { schoolYear: schoolYear.value.trim() },
    });
    const warnPart = result.warnings?.length
      ? `\nAvertissements: ${result.warnings.slice(0, 2).join(' | ')}${result.warnings.length > 2 ? '…' : ''}`
      : '';
    actionNotice.value =
      `Réactualisation terminée. Inscriptions traitées: ${result.enrollmentsProcessed}/${result.enrollmentsFound}. ` +
      `Factures scolarité recréées: ${result.deleted.tuitionCharges}. Mensualités recréées: ${result.deleted.monthlyInstallments}.` +
      (warnPart ? ` ${warnPart.replace(/\n/g, ' ')}` : '');
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Réactualisation des factures impossible.';
  } finally {
    pricingRegenerating.value = null;
  }
}

function openAddLevelModal() {
  newLevelSchedules.value = [emptyScheduleRow()];
  addLevelModal.value = true;
}

function addNewLevelScheduleRow() {
  newLevelSchedules.value.push(emptyScheduleRow(newLevelSchedules.value.length + 1));
}

function scheduleRowsForLevel(level: CatalogLevel): ScheduleRowDraft[] {
  if (level.schedules?.length) {
    return level.schedules.map((s, i) => ({
      label: s.label,
      timeDescription: s.timeDescription,
      annualXof: s.annualXof,
      monthlyXof: s.monthlyXof,
      order: s.order ?? i + 1,
    }));
  }
  if (level.pricing) {
    return [
      {
        label: 'Barème principal',
        timeDescription: '',
        annualXof: level.pricing.annualTuitionCents / 100,
        monthlyXof: level.pricing.monthlyBaseCents / 100,
        order: 1,
      },
    ];
  }
  return [emptyScheduleRow()];
}

function openEditLevelModal(level: CatalogLevel) {
  editLevelModal.value = level;
}

async function saveLevelEdit(payload: LevelEditPayload) {
  const level = editLevelModal.value;
  const t = token.value;
  if (!level || !t) return;
  levelEditSaving.value = true;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/levels/${level.id}`, {
      method: 'PATCH',
      headers: api.value.headers,
      body: {
        name: payload.name,
        order: payload.order,
        schoolYear: schoolYear.value.trim() || catalog.value?.schoolYear || defaultSchoolYear(),
        schedules: payload.schedules.map((row, index) => ({
          label: row.label,
          timeDescription: row.timeDescription,
          annualTuitionCents: xofToCents(Number(row.annualXof)),
          monthlyBaseCents: xofToCents(Number(row.monthlyXof)),
          order: index + 1,
        })),
      },
    });
    editLevelModal.value = null;
    await reloadCatalog();
    actionNotice.value = 'Niveau mis à jour.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Mise à jour du niveau impossible.';
  } finally {
    levelEditSaving.value = false;
  }
}

function addNewServiceVariant() {
  newServiceVariants.value.push({ code: '', label: '', amountXof: 0 });
}

function openAddServiceModal() {
  newService.code = '';
  newService.label = '';
  newService.amountXof = 0;
  newService.billingPeriod = 'MONTHLY';
  newService.pricingMode = 'FLAT';
  newServiceVariants.value = [{ code: '', label: '', amountXof: 0 }];
  addServiceModal.value = true;
}

function openEditServiceModal(service: ServiceItem) {
  serviceEditError.value = null;
  editServiceDraft.value = {
    id: service.id,
    code: service.code,
    label: service.label,
    pricingMode: service.pricingMode,
    amountXof: service.amountXof,
    billingPeriod: service.billingPeriod,
    variants: service.variants?.length
      ? service.variants.map((v) => ({
          code: v.code,
          label: v.label,
          amountXof: v.amountXof,
        }))
      : [{ code: '', label: '', amountXof: 0 }],
  };
}

function closeEditServiceModal() {
  editServiceDraft.value = null;
  serviceEditError.value = null;
}

async function saveServiceEdit(payload: ServiceEditPayload) {
  const serviceId = editServiceDraft.value?.id;
  const t = token.value;
  if (!serviceId || !t) return;

  serviceEditSaving.value = true;
  serviceEditError.value = null;
  loadError.value = null;
  try {
    const body: Record<string, unknown> = {
      label: payload.label,
      pricingMode: payload.pricingMode,
      schoolYear: schoolYear.value.trim() || defaultSchoolYear(),
    };

    if (payload.pricingMode === 'FLAT') {
      body.amountCents = xofToCents(Number(payload.amountXof));
      body.billingPeriod = payload.billingPeriod;
    } else {
      body.variants = payload.variants.map((v, index) => ({
        code: v.code.trim().toUpperCase(),
        label: v.label.trim(),
        amountCents: xofToCents(Number(v.amountXof)),
        billingPeriod: 'MONTHLY',
        order: index + 1,
      }));
    }

    await $fetch(`${config.public.apiBase}/admin/settings/services/${serviceId}`, {
      method: 'PATCH',
      headers: api.value.headers,
      body,
    });

    closeEditServiceModal();
    await loadServices();
    actionNotice.value = 'Option mise à jour.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    const message =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Mise à jour de l’option impossible.';
    serviceEditError.value = message;
    loadError.value = message;
  } finally {
    serviceEditSaving.value = false;
  }
}

async function submitNewClass() {
  const t = token.value;
  if (!t || !newClass.levelId) return;
  classSubmitting.value = true;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/classes`, {
      method: 'POST',
      headers: api.value.headers,
      body: {
        levelId: newClass.levelId,
        name: newClass.name,
        headTeacher: newClass.headTeacher || undefined,
        capacity: newClass.capacity,
      },
    });
    newClass.name = '';
    newClass.headTeacher = '';
    newClass.capacity = 22;
    await reloadCatalog();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Création de la classe impossible.';
  } finally {
    classSubmitting.value = false;
  }
}

async function loadServices() {
  const t = token.value;
  if (!t) return;
  servicesPending.value = true;
  try {
    const sy = schoolYear.value.trim() || defaultSchoolYear();
    const res = await $fetch<{ items: ServiceItem[] }>(
      `${config.public.apiBase}/admin/settings/services`,
      {
        headers: api.value.headers,
        query: { schoolYear: sy },
      },
    );
    services.value = res.items ?? [];
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les options.';
  } finally {
    servicesPending.value = false;
  }
}

async function submitNewService() {
  const t = token.value;
  if (!t) return;
  serviceSubmitting.value = true;
  loadError.value = null;
  try {
    const body: Record<string, unknown> = {
      code: newService.code.trim().toUpperCase(),
      label: newService.label.trim(),
      pricingMode: newService.pricingMode,
      schoolYear: schoolYear.value.trim() || defaultSchoolYear(),
      active: true,
    };
    if (newService.pricingMode === 'FLAT') {
      body.amountCents = xofToCents(Number(newService.amountXof));
      body.billingPeriod = newService.billingPeriod;
    } else {
      body.variants = newServiceVariants.value
        .map((v, index) => ({
          code: v.code.trim().toUpperCase(),
          label: v.label.trim(),
          amountCents: xofToCents(Number(v.amountXof)),
          billingPeriod: 'MONTHLY',
          order: index + 1,
        }))
        .filter((v) => v.code && v.label);
    }
    await $fetch(`${config.public.apiBase}/admin/settings/services`, {
      method: 'POST',
      headers: api.value.headers,
      body,
    });
    addServiceModal.value = false;
    newService.code = '';
    newService.label = '';
    newService.amountXof = 0;
    newService.billingPeriod = 'MONTHLY';
    newService.pricingMode = 'FLAT';
    newServiceVariants.value = [{ code: '', label: '', amountXof: 0 }];
    await loadServices();
    actionNotice.value = 'Option créée avec succès.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Création de l’option impossible.';
  } finally {
    serviceSubmitting.value = false;
  }
}

async function toggleServiceActive(service: ServiceItem) {
  const t = token.value;
  if (!t) return;
  serviceToggling.value = service.id;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/services/${service.id}`, {
      method: 'PATCH',
      headers: api.value.headers,
      body: { active: !service.active },
    });
    await loadServices();
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Mise à jour du service impossible.';
  } finally {
    serviceToggling.value = null;
  }
}

async function removeService(service: ServiceItem) {
  const ok = await askConfirmation(`Supprimer le service « ${service.label} » ?`);
  if (!ok) return;
  const t = token.value;
  if (!t) return;
  serviceDeleting.value = service.id;
  loadError.value = null;
  try {
    await $fetch(`${config.public.apiBase}/admin/settings/services/${service.id}`, {
      method: 'DELETE',
      headers: api.value.headers,
    });
    await loadServices();
    actionNotice.value = 'Service supprimé.';
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } };
    const raw = err?.data?.message;
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Suppression du service impossible.';
  } finally {
    serviceDeleting.value = null;
  }
}

function apiErrorMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { message?: string | string[] }; statusMessage?: string; message?: string };
  const raw = err?.data?.message;
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string' && raw[0].trim()) return raw[0];
  if (typeof err?.statusMessage === 'string' && err.statusMessage.trim()) return err.statusMessage;
  return fallback;
}

function levelDeleteBlockedMessage(name: string, count: number): string {
  if (count === 1) {
    return `Impossible de supprimer « ${name} » : 1 dossier d’inscription y est encore rattaché. Réaffectez ou supprimez ce dossier d’abord.`;
  }
  return `Impossible de supprimer « ${name} » : ${count} dossiers d’inscription y sont encore rattachés. Réaffectez ou supprimez ces dossiers d’abord.`;
}

function resetConfirmModalExtras() {
  confirmModalItems.value = [];
  confirmModalKeepNote.value = '';
  confirmModalWarning.value = '';
  confirmModalConfirmLabel.value = 'Supprimer';
}

function askAlert(message: string, title = 'Information'): Promise<void> {
  resetConfirmModalExtras();
  confirmModalTitle.value = title;
  confirmModalMode.value = 'alert';
  confirmModalMessage.value = message;
  confirmModalOpen.value = true;
  return new Promise((resolve) => {
    confirmResolver = () => resolve();
  });
}

function askConfirmation(
  message: string,
  options?: {
    title?: string;
    items?: string[];
    keepNote?: string;
    warning?: string;
    confirmLabel?: string;
  },
): Promise<boolean> {
  confirmModalTitle.value = options?.title ?? 'Confirmation';
  confirmModalMode.value = 'confirm';
  confirmModalMessage.value = message;
  confirmModalItems.value = options?.items ?? [];
  confirmModalKeepNote.value = options?.keepNote ?? '';
  confirmModalWarning.value = options?.warning ?? '';
  confirmModalConfirmLabel.value = options?.confirmLabel ?? 'Supprimer';
  confirmModalOpen.value = true;
  return new Promise<boolean>((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirmation(ok: boolean) {
  confirmModalOpen.value = false;
  const resolver = confirmResolver;
  confirmResolver = null;
  resolver?.(ok);
}

watch(token, () => {
  void reloadCatalog();
});

watch(
  () => [activeTab.value, schoolYear.value],
  () => {
    if (activeTab.value !== 'options') return;
    void loadServices();
  },
);

onMounted(() => {
  const defaults = defaultYearDates();
  newYear.label = defaults.label;
  newYear.startDate = defaults.startDate;
  newYear.endDate = defaults.endDate;
  void loadSchoolYears();
  void reloadCatalog();
  void loadServices();
  void loadDashStats();
});
</script>
