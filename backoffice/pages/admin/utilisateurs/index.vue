<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Gestion utilisateurs</h1>
      <button
        v-if="isSuperAdmin"
        type="button"
        class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        @click="openAddUserModal"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" stroke-linecap="round" />
        </svg>
        Ajouter un utilisateur
      </button>
    </div>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statCards"
        :key="card.key"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div class="mb-3 flex items-start justify-between gap-2">
          <h2 class="text-sm font-semibold leading-snug text-slate-700">{{ card.title }}</h2>
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            :class="card.iconBg"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5Z" />
              <path d="M6 12v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5" />
            </svg>
          </span>
        </div>
        <p class="text-3xl font-bold tracking-tight text-slate-900">
          <span v-if="pending" class="inline-block h-9 w-12 animate-pulse rounded bg-slate-200" />
          <template v-else>{{ card.value }}</template>
        </p>
        <p class="mt-1 text-xs font-medium text-slate-400">Sur l'ensemble du personnel</p>
      </article>
    </section>

    <div class="relative max-w-2xl">
      <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" stroke-linecap="round" />
        </svg>
      </span>
      <input
        v-model="searchInput"
        type="search"
        class="w-full rounded-2xl border border-[#216EC2]/30 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
        placeholder="Rechercher un nom, un e-mail…"
        autocomplete="off"
      />
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>
    <p v-if="actionNotice" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{{ actionNotice }}</p>

    <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4">
        <h1 class="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">Utilisateurs</h1>
        <select
          v-model="sort"
          class="rounded-xl border-2 border-[#F9994B] bg-[#F9994B] px-4 py-2.5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-[#F9994B]/30"
          @change="page = 1"
        >
          <option value="date_desc">Trier par</option>
          <option value="date_asc">Plus ancien</option>
          <option value="name_asc">Nom A → Z</option>
          <option value="name_desc">Nom Z → A</option>
        </select>
      </div>

      <div class="overflow-x-auto px-4 pb-3">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr class="bg-[#216EC2] text-white">
              <th class="px-4 py-3 font-semibold">Noms</th>
              <th class="px-4 py-3 font-semibold">E-Mail</th>
              <th class="px-4 py-3 font-semibold">Poste</th>
              <th class="px-4 py-3 font-semibold">Rôle</th>
              <th class="px-4 py-3 font-semibold">Statut</th>
              <th class="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            <template v-if="pending">
              <tr v-for="n in 6" :key="'s-' + n">
                <td v-for="c in 6" :key="c" class="px-4 py-3">
                  <span class="inline-block h-4 w-full max-w-[7rem] animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!rows.length">
              <td colspan="6" class="px-4 py-12 text-center text-slate-500">Aucun utilisateur.</td>
            </tr>
            <tr v-for="row in rows" v-else :key="row.id" class="text-slate-700">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <span
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    :class="avatarClass(row.fullName)"
                  >
                    {{ initials(row.fullName) }}
                  </span>
                  <span class="font-semibold text-slate-900">{{ row.fullName }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ row.email }}</td>
              <td class="px-4 py-3">
                <select
                  :value="row.jobTitle ?? ''"
                  class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-[#216EC2]/20"
                  :class="jobTitleClass(row.jobTitle)"
                  :disabled="rowSaving === row.id"
                  @change="onJobTitleChange(row, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="">— Poste —</option>
                  <option v-for="opt in jobTitleOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </td>
              <td class="px-4 py-3">
                <div v-if="row.isSuperAdmin" class="inline-flex rounded-lg bg-[#216EC2]/10 px-2.5 py-1 text-xs font-semibold text-[#216EC2]">
                  Super admin · tous les modules
                </div>
                <div v-else class="relative min-w-[12rem]">
                  <button
                    type="button"
                    class="flex w-full flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left text-xs transition hover:border-[#216EC2]/30 disabled:opacity-50"
                    :disabled="rowSaving === row.id || !isSuperAdmin"
                    @click="toggleRolesEditor(row.id)"
                  >
                    <template v-if="row.appRoles.length">
                      <span
                        v-for="r in row.appRoles"
                        :key="r.code"
                        class="inline-flex rounded-md bg-[#216EC2]/10 px-1.5 py-0.5 font-semibold text-[#216EC2]"
                      >
                        {{ r.label }}
                      </span>
                    </template>
                    <span v-else class="text-slate-400">Aucun rôle</span>
                    <svg
                      v-if="isSuperAdmin"
                      class="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m6 9 6 6 6-6" stroke-linecap="round" />
                    </svg>
                  </button>
                  <div
                    v-if="rolesEditorOpen === row.id"
                    class="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
                  >
                    <p class="mb-2 text-xs font-bold text-slate-500">Rôles d'accès (modules)</p>
                    <ul class="max-h-48 space-y-1 overflow-y-auto">
                      <li v-for="opt in roleOptionsList" :key="opt.code">
                        <label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
                          <input
                            type="checkbox"
                            :checked="rolesDraft.includes(opt.code)"
                            class="rounded border-slate-300 text-[#216EC2]"
                            @change="toggleRoleDraft(opt.code)"
                          >
                          <span class="font-medium text-slate-700">{{ opt.label }}</span>
                        </label>
                      </li>
                    </ul>
                    <div class="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        class="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        @click="closeRolesEditor"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        class="rounded-lg bg-[#216EC2] px-2 py-1 text-xs font-bold text-white hover:brightness-105 disabled:opacity-50"
                        :disabled="rowSaving === row.id"
                        @click="saveRolesDraft(row)"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="!row.blocked"
                  class="relative inline-flex h-7 w-[2.75rem] shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#216EC2]/40"
                  :class="[
                    row.blocked ? 'bg-slate-300' : 'bg-emerald-500',
                    rowActionId === row.id || (row.id === currentUserId && !row.blocked)
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer',
                  ]"
                  :disabled="rowActionId === row.id || (row.id === currentUserId && !row.blocked)"
                  @click="openBlockModal(row)"
                >
                  <span
                    class="pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[transform]"
                    :class="row.blocked ? 'left-0.5 translate-x-0' : 'left-0.5 translate-x-[1.15rem]'"
                  />
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="isSuperAdmin"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl border border-[#216EC2]/30 bg-[#216EC2]/5 px-2.5 py-1.5 text-xs font-bold text-[#216EC2] transition hover:bg-[#216EC2]/10 disabled:opacity-50"
                    :disabled="rowActionId === row.id || row.id === currentUserId"
                    @click="openResetPasswordModal(row)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M3 16a9 9 0 0 0 15 6.7L21 16" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                    :disabled="rowActionId === row.id || row.id === currentUserId || !isSuperAdmin"
                    @click="openDeleteModal(row)"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 11v-1a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="m21 21-3-3" stroke-linecap="round" />
                    </svg>
                    Supprimer
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                    :class="
                      row.blocked
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                    "
                    :disabled="rowActionId === row.id || row.id === currentUserId"
                    @click="openBlockModal(row)"
                  >
                    <svg v-if="row.blocked" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M4.5 4.5l15 15" stroke-linecap="round" />
                    </svg>
                    {{ row.blocked ? 'Débloquer' : 'Bloquer' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="!pending && overview && overview.total > 0"
        class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 px-5 py-4"
      >
        <span class="text-sm font-medium text-slate-600">
          {{ pageStart }} – {{ pageEnd }} sur {{ intFr.format(overview.total) }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page <= 1"
            @click="page--"
          >
            ‹
          </button>
          <span class="min-w-[3rem] text-center text-sm font-semibold text-slate-600">{{ page }} / {{ totalPages }}</span>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page >= totalPages"
            @click="page++"
          >
            ›
          </button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="addUserModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="presentation"
      >
        <div class="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-hidden="true" @click="closeAddUserModal" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-user-title"
          class="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white px-6 py-6 shadow-xl sm:px-8"
          @click.stop
        >
          <h2 id="add-user-title" class="text-xl font-bold text-slate-900">Ajouter un utilisateur</h2>
          <p class="mt-1 text-sm text-slate-500">
            Créez un compte et attribuez-lui un poste et un niveau d'accès.
          </p>

          <form class="mt-6 space-y-5" @submit.prevent="submitNewUser">
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Nom complet</span>
              <input
                v-model.trim="newUser.fullName"
                type="text"
                required
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                placeholder="Ex. Awa Diop"
              >
            </label>
            <label class="block">
              <span class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Adresse e-mail</span>
              <input
                v-model.trim="newUser.email"
                type="email"
                required
                class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
                placeholder="nom@example.com"
              >
            </label>

            <div>
              <span class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Poste / fonction</span>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  v-for="poste in posteOptions"
                  :key="poste"
                  type="button"
                  class="rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition"
                  :class="
                    newUser.jobTitle === poste
                      ? 'border-[#216EC2] bg-[#216EC2]/10 text-[#216EC2]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  "
                  @click="newUser.jobTitle = poste"
                >
                  {{ poste }}
                </button>
              </div>
            </div>

            <div>
              <span class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Niveau d'accès</span>
              <div class="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-bold transition"
                  :class="
                    newUser.accessLevel === 'ADMIN'
                      ? 'bg-[#216EC2] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  "
                  @click="newUser.accessLevel = 'ADMIN'"
                >
                  Admin
                </button>
                <button
                  type="button"
                  class="rounded-lg px-4 py-2 text-sm font-bold transition"
                  :class="
                    newUser.accessLevel === 'STAFF'
                      ? 'bg-[#216EC2] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  "
                  @click="newUser.accessLevel = 'STAFF'"
                >
                  Utilisateur
                </button>
              </div>
              <p v-if="newUser.accessLevel === 'ADMIN'" class="mt-2 text-xs text-slate-500">
                Accès à tous les modules (super administrateur).
              </p>
            </div>

            <div v-if="newUser.accessLevel === 'STAFF'">
              <span class="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Rôles d'accès (modules)</span>
              <p class="mb-2 text-xs text-slate-500">Sélectionnez un ou plusieurs modules accessibles.</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in roleOptionsList"
                  :key="opt.code"
                  type="button"
                  class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                  :class="
                    newUser.appRoleCodes.includes(opt.code)
                      ? 'border-[#216EC2] bg-[#216EC2]/10 text-[#216EC2]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  "
                  @click="toggleNewUserRole(opt.code)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
              <span class="text-sm font-semibold text-slate-800">Compte actif</span>
              <button
                type="button"
                role="switch"
                :aria-checked="newUser.active"
                class="relative inline-flex h-7 w-[2.75rem] shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#216EC2]/40"
                :class="newUser.active ? 'bg-emerald-500' : 'bg-slate-300'"
                @click="newUser.active = !newUser.active"
              >
                <span
                  class="pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[transform]"
                  :class="newUser.active ? 'left-0.5 translate-x-[1.15rem]' : 'left-0.5 translate-x-0'"
                />
              </button>
            </div>

            <p v-if="createUserError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {{ createUserError }}
            </p>

            <div class="flex justify-end gap-3 pt-1">
              <button
                type="button"
                class="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                :disabled="createUserSubmitting"
                @click="closeAddUserModal"
              >
                Annuler
              </button>
              <button
                type="submit"
                class="rounded-xl bg-[#216EC2] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50"
                :disabled="createUserSubmitting || !newUser.jobTitle"
              >
                {{ createUserSubmitting ? 'Création…' : 'Créer le compte' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="resetPasswordModalRow"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @click.self="closeResetPasswordModal"
      >
        <div
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <h2 class="mb-4 text-xl font-bold text-slate-900">Réinitialiser le mot de passe</h2>
          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Un nouveau mot de passe temporaire sera généré et envoyé par e-mail à
            <strong>{{ resetPasswordModalRow.fullName }}</strong>.
            L'utilisateur devra le changer à sa prochaine connexion.
          </p>
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-initial sm:px-6"
              @click="closeResetPasswordModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#216EC2] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50 sm:flex-initial sm:px-6"
              :disabled="!!rowActionId"
              @click="confirmResetPassword"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="deleteModalRow"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        @click.self="closeDeleteModal"
      >
        <div
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <h2 class="mb-4 text-xl font-bold text-slate-900">Supprimer l'utilisateur</h2>
          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Voulez-vous vraiment supprimer {{ deleteModalRow.fullName }}&nbsp;?
          </p>
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-initial sm:px-6"
              @click="closeDeleteModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50 sm:flex-initial sm:px-6"
              :disabled="!!rowActionId"
              @click="confirmDelete"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="blockModalRow"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        @click.self="closeBlockModal"
      >
        <div
          class="relative w-full max-w-[440px] rounded-[28px] bg-white px-7 pb-8 pt-6 shadow-xl"
          @click.stop
        >
          <h2 class="mb-4 text-xl font-bold text-slate-900">
            {{ blockModalRow.blocked ? 'Débloquer' : 'Bloquer' }} l'utilisateur
          </h2>
          <p class="mb-6 text-center text-[15px] leading-relaxed text-slate-500">
            Voulez-vous vraiment {{ blockModalRow.blocked ? 'débloquer' : 'bloquer' }} {{ blockModalRow.fullName }}&nbsp;?
          </p>
          <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:flex-initial sm:px-6"
              @click="closeBlockModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50 sm:flex-initial sm:px-6"
              :disabled="!!rowActionId"
              @click="confirmBlock"
            >
              {{ blockModalRow.blocked ? 'Débloquer' : 'Bloquer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { AppModuleRoleCode } from '~/utils/admin-permissions'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type AppRoleDto = { code: AppModuleRoleCode; label: string }

type UserRow = {
  id: string
  fullName: string
  email: string
  jobTitle: string | null
  isSuperAdmin: boolean
  appRoles: AppRoleDto[]
  blocked: boolean
  active: boolean
}

type OverviewDto = {
  stats: {
    total: number
    active: number
    blocked: number
    administrators: number
  }
  items: UserRow[]
  total: number
  page: number
  limit: number
  roleOptions?: AppRoleDto[]
}

const posteOptions = [
  'Directeur',
  'Maîtresse',
  'Maître',
  'Comptable',
  'Gestionnaire de stock',
]

const jobTitleOptions = [...posteOptions, 'Secrétaire', 'Assistant(e)']

const newUser = reactive({
  fullName: '',
  email: '',
  jobTitle: '',
  accessLevel: 'STAFF' as 'ADMIN' | 'STAFF',
  active: true,
  appRoleCodes: [] as AppModuleRoleCode[],
})

const { token } = useAuth()
const { isSuperAdmin, currentUserId, roleOptions: defaultRoleOptions } = useAdminPermissions()
const config = useRuntimeConfig()

const searchInput = ref('')
const debouncedSearch = ref('')
const sort = ref('date_desc')
const page = ref(1)
const limit = ref(8)

const overview = ref<OverviewDto | null>(null)
const loadError = ref<string | null>(null)
const actionNotice = ref<string | null>(null)
const pending = ref(true)
const rowActionId = ref<string | null>(null)
const rowSaving = ref<string | null>(null)
const deleteModalRow = ref<UserRow | null>(null)
const resetPasswordModalRow = ref<UserRow | null>(null)
const blockModalRow = ref<UserRow | null>(null)
const addUserModal = ref(false)
const createUserSubmitting = ref(false)
const createUserError = ref<string | null>(null)
const rolesEditorOpen = ref<string | null>(null)
const rolesDraft = ref<AppModuleRoleCode[]>([])
const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

const avatarPalette = [
  'bg-[#216EC2]',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
]

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = v
    page.value = 1
  }, 350)
})

const roleOptionsList = computed(() => overview.value?.roleOptions ?? defaultRoleOptions.value)

const statCards = computed(() => {
  const s = overview.value?.stats
  return [
    {
      key: 'total',
      title: 'Total utilisateurs',
      value: s != null ? intFr.format(s.total) : '—',
      iconBg: 'bg-[#216EC2]/10 text-[#216EC2]',
    },
    {
      key: 'active',
      title: 'Comptes actifs',
      value: s != null ? intFr.format(s.active) : '—',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      key: 'blocked',
      title: 'Comptes bloqués',
      value: s != null ? intFr.format(s.blocked) : '—',
      iconBg: 'bg-amber-100 text-amber-600',
    },
    {
      key: 'admins',
      title: 'Administrateurs',
      value: s != null ? intFr.format(s.administrators) : '—',
      iconBg: 'bg-violet-100 text-violet-600',
    },
  ]
})

const rows = computed(() => overview.value?.items ?? [])
const totalPages = computed(() => {
  if (!overview.value?.total) return 1
  return Math.max(1, Math.ceil(overview.value.total / overview.value.limit))
})
const pageStart = computed(() => {
  if (!overview.value?.total) return 0
  return (overview.value.page - 1) * overview.value.limit + 1
})
const pageEnd = computed(() => {
  if (!overview.value?.total) return 0
  return Math.min(overview.value.page * overview.value.limit, overview.value.total)
})

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
}

function avatarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % avatarPalette.length
  return avatarPalette[hash] ?? avatarPalette[0]!
}

function jobTitleClass(title: string | null): string {
  if (!title) return 'border-slate-200 bg-white text-slate-500'
  if (title === 'Comptable') return 'border-amber-200 bg-amber-50 text-amber-800'
  if (title === 'Maîtresse' || title === 'Maître') return 'border-sky-200 bg-sky-50 text-sky-800'
  if (title === 'Directeur' || title === 'Gestionnaire de stock') return 'border-violet-200 bg-violet-50 text-violet-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function openAddUserModal() {
  newUser.fullName = ''
  newUser.email = ''
  newUser.jobTitle = ''
  newUser.accessLevel = 'STAFF'
  newUser.active = true
  newUser.appRoleCodes = []
  createUserError.value = null
  addUserModal.value = true
}

function closeAddUserModal() {
  addUserModal.value = false
  createUserError.value = null
}

function toggleNewUserRole(code: AppModuleRoleCode) {
  if (newUser.appRoleCodes.includes(code)) {
    newUser.appRoleCodes = newUser.appRoleCodes.filter((c) => c !== code)
  } else {
    newUser.appRoleCodes.push(code)
  }
}

async function submitNewUser() {
  const t = token.value
  if (!t || !newUser.jobTitle) return
  createUserSubmitting.value = true
  createUserError.value = null
  loadError.value = null
  actionNotice.value = null
  const configPublic = useRuntimeConfig().public
  try {
    const res = await $fetch<{
      temporaryPassword?: string
      user: { fullName: string }
      emailSent?: boolean
      message?: string
    }>(`${config.public.apiBase}/admin/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: {
        fullName: newUser.fullName.trim(),
        email: newUser.email.trim().toLowerCase(),
        jobTitle: newUser.jobTitle,
        accessLevel: newUser.accessLevel,
        active: newUser.active,
        appRoleCodes: newUser.accessLevel === 'STAFF' ? [...newUser.appRoleCodes] : [],
      },
    })
    closeAddUserModal()
    const parts: string[] = []
    if (res.message) parts.push(res.message)
    if (configPublic.showTempPasswordOnUserCreate && res.temporaryPassword) {
      parts.push(`Mot de passe temporaire (dev) : ${res.temporaryPassword}`)
    }
    actionNotice.value = parts.length ? parts.join(' ') : `Compte créé pour ${res.user.fullName}.`
    page.value = 1
    await loadOverview()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    createUserError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Création du compte impossible.'
  } finally {
    createUserSubmitting.value = false
  }
}

function openDeleteModal(row: UserRow) {
  if (row.id === currentUserId.value) return
  loadError.value = null
  deleteModalRow.value = row
}

function closeDeleteModal() {
  deleteModalRow.value = null
}

function openResetPasswordModal(row: UserRow) {
  if (row.id === currentUserId.value) return
  loadError.value = null
  resetPasswordModalRow.value = row
}

function closeResetPasswordModal() {
  resetPasswordModalRow.value = null
}

async function confirmResetPassword() {
  const row = resetPasswordModalRow.value
  if (!row) return
  closeResetPasswordModal()
  const t = token.value
  if (!t) return
  rowActionId.value = row.id
  loadError.value = null
  actionNotice.value = null
  const configPublic = useRuntimeConfig().public
  try {
    const res = await $fetch<{
      message?: string
      temporaryPassword?: string
      emailSent?: boolean
    }>(`${config.public.apiBase}/admin/users/${row.id}/reset-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    })
    const parts: string[] = []
    if (res.message) parts.push(res.message)
    if (configPublic.showTempPasswordOnUserCreate && res.temporaryPassword) {
      parts.push(`Mot de passe temporaire (dev) : ${res.temporaryPassword}`)
    }
    actionNotice.value = parts.join(' ')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Réinitialisation impossible.'
  } finally {
    rowActionId.value = null
  }
}

function openBlockModal(row: UserRow) {
  if (row.id === currentUserId.value && !row.blocked) return
  loadError.value = null
  blockModalRow.value = row
}

function closeBlockModal() {
  blockModalRow.value = null
}

async function loadOverview() {
  pending.value = true
  loadError.value = null
  const t = token.value
  if (!t) {
    pending.value = false
    overview.value = null
    return
  }
  try {
    overview.value = await $fetch<OverviewDto>(`${config.public.apiBase}/admin/users`, {
      headers: { Authorization: `Bearer ${t}` },
      query: {
        page: page.value,
        limit: limit.value,
        search: debouncedSearch.value.trim() || undefined,
        sort: sort.value,
      },
    })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de charger les utilisateurs.'
    overview.value = null
  } finally {
    pending.value = false
  }
}

async function patchUser(row: UserRow, body: Record<string, unknown>): Promise<boolean> {
  const t = token.value
  if (!t) return false
  rowSaving.value = row.id
  loadError.value = null
  try {
    const updated = await $fetch<UserRow>(`${config.public.apiBase}/admin/users/${row.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body,
    })
    Object.assign(row, updated)
    return true
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Mise à jour impossible.'
    return false
  } finally {
    rowSaving.value = null
  }
}

async function patchBlocked(row: UserRow, blocked: boolean) {
  rowActionId.value = row.id
  try {
    const t = token.value
    if (!t) return
    await $fetch(`${config.public.apiBase}/admin/users/${row.id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${t}` },
      body: { blocked },
    })
    row.blocked = blocked
    row.active = !blocked
    closeBlockModal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Impossible de mettre à jour le statut.'
  } finally {
    rowActionId.value = null
  }
}

function onJobTitleChange(row: UserRow, value: string) {
  void patchUser(row, { jobTitle: value || null })
}

function toggleRolesEditor(userId: string) {
  if (!isSuperAdmin.value) return
  const row = rows.value.find((r) => r.id === userId)
  if (!row || row.isSuperAdmin) return
  if (rolesEditorOpen.value === userId) {
    closeRolesEditor()
    return
  }
  rolesEditorOpen.value = userId
  rolesDraft.value = row.appRoles.map((r) => r.code)
}

function closeRolesEditor() {
  rolesEditorOpen.value = null
  rolesDraft.value = []
}

function toggleRoleDraft(code: AppModuleRoleCode) {
  if (rolesDraft.value.includes(code)) {
    rolesDraft.value = rolesDraft.value.filter((c) => c !== code)
  } else {
    rolesDraft.value = [...rolesDraft.value, code]
  }
}

async function saveRolesDraft(row: UserRow) {
  const ok = await patchUser(row, { appRoleCodes: [...rolesDraft.value] })
  if (ok) closeRolesEditor()
}

function confirmBlock() {
  const row = blockModalRow.value
  if (!row) return
  void patchBlocked(row, !row.blocked)
}

function confirmDelete() {
  const row = deleteModalRow.value
  if (!row) return
  closeDeleteModal()
  void deleteUser(row)
}

async function deleteUser(row: UserRow) {
  const t = token.value
  if (!t) return
  rowActionId.value = row.id
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/users/${row.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${t}` },
    })
    await loadOverview()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value =
      typeof raw === 'string'
        ? raw
        : Array.isArray(raw)
          ? raw[0]
          : 'Suppression impossible.'
  } finally {
    rowActionId.value = null
  }
}

watch(
  [token, page, limit, debouncedSearch, sort],
  () => {
    if (token.value) void loadOverview()
  },
  { immediate: true },
)
</script>
