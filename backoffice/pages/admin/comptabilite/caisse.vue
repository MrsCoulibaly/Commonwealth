<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-[#216EC2] sm:text-4xl">Gestion de Caisse</h1>
      <div class="flex flex-wrap gap-2 self-start">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#216EC2]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5 disabled:opacity-50"
          :disabled="pending"
          @click="loadDesk"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': pending }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Actualiser
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#216EC2]/40 bg-white px-5 py-2.5 text-sm font-bold text-[#216EC2] transition hover:bg-[#216EC2]/5"
          @click="navigateTo('/admin/comptabilite')"
        >
          ← Comptabilité
        </button>
      </div>
    </div>

    <p v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{{ loadError }}</p>
    <p v-if="actionMessage" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ actionMessage }}</p>

    <div v-if="!pending && desk && !desk.sessionOpen" class="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
      <p class="font-semibold text-amber-900">Aucune caisse ouverte.</p>
      <p class="mt-2 text-sm text-amber-800">Ouvrez la caisse pour enregistrer les entrées et sorties.</p>
      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          class="inline-flex rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          :disabled="cashBusy"
          @click="openCash"
        >
          Ouvrir la caisse
        </button>
        <NuxtLink
          to="/admin/comptabilite"
          class="inline-flex rounded-xl border border-[#216EC2]/40 px-5 py-2.5 text-sm font-bold text-[#216EC2] hover:bg-[#216EC2]/5"
        >
          Retour à la comptabilité
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <AdminAccountingTotalsBlocks
        variant="session"
        :pending="pending"
        :highlight="totalsHighlight"
        :entries-cents="desk?.stats.entriesCents ?? 0"
        :exits-cents="desk?.stats.exitsCents ?? 0"
        :balance-cents="desk?.stats.balanceCents ?? 0"
        :payments-cents="desk?.stats.paymentsCents ?? 0"
        :manual-cents="desk?.stats.manualCents ?? 0"
        period-label="Toutes périodes — paiements, entrées manuelles et sorties cumulés"
      />

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-xl bg-[#F9994B] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105"
          @click="openEntryModal"
        >
          Entrées Manuelle
        </button>
        <button
          type="button"
          class="rounded-xl bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105"
          @click="openExitModal"
        >
          Sorties Manuelle
        </button>
        <button
          type="button"
          class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105"
          @click="openBillingModal"
        >
          Facturation
        </button>
        <button
          type="button"
          class="ml-auto rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
          :disabled="cashBusy"
          @click="closeCash"
        >
          Fermer la caisse
        </button>
      </div>

      <section class="overflow-hidden rounded-2xl border-2 border-[#216EC2]/25 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-bold text-slate-800">Entrées de caisse</h2>
            <p class="mt-1 text-xs text-slate-500">
              Factures de scolarité et mensualités payées (en ligne) + encaissements manuels, depuis l’ouverture de la caisse.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-[#216EC2] px-4 py-2 text-sm font-bold text-white"
            @click="openEntryModal"
          >
            + Entrées Manuelle
          </button>
        </div>

        <div class="px-5 py-4">
          <div class="relative max-w-xl">
            <svg
              class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchInput"
              type="search"
              placeholder="Rechercher un enfant"
              class="w-full rounded-xl border border-slate-200 py-2.5 pl-12 pr-4 text-sm outline-none focus:border-[#216EC2] focus:ring-2 focus:ring-[#216EC2]/20"
            />
          </div>
        </div>

        <div class="overflow-x-auto px-4 pb-4">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr class="bg-[#216EC2] text-white">
                <th class="px-4 py-3 font-semibold">Date</th>
                <th class="px-4 py-3 font-semibold">Description</th>
                <th class="px-4 py-3 font-semibold">Source</th>
                <th class="px-4 py-3 font-semibold">Montant</th>
                <th class="px-4 py-3 font-semibold">Mode</th>
                <th class="px-4 py-3 font-semibold">Facture</th>
                <th class="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-if="pending">
                <tr v-for="n in 5" :key="n">
                  <td v-for="c in 7" :key="c" class="px-4 py-3">
                    <span class="block h-4 animate-pulse rounded bg-slate-200" />
                  </td>
                </tr>
              </template>
              <tr v-else-if="!entryRows.length">
                <td colspan="7" class="px-4 py-12 text-center text-slate-500">Aucune entrée pour cette session.</td>
              </tr>
              <tr v-for="row in entryRows" v-else :key="row.id" class="text-slate-700">
                <td class="whitespace-nowrap px-4 py-3">{{ formatDate(row.date) }}</td>
                <td class="px-4 py-3 font-medium">{{ row.description }}</td>
                <td class="px-4 py-3">{{ row.source }}</td>
                <td class="px-4 py-3 font-semibold">{{ formatXof(row.amountCents) }}</td>
                <td class="px-4 py-3">{{ row.paymentMethod }}</td>
                <td class="px-4 py-3">{{ row.invoiceNumber || (row.hasInvoice ? 'Oui' : 'Non') }}</td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#216EC2]/40 bg-[#216EC2]/5 text-[#216EC2] transition hover:bg-[#216EC2]/15"
                    :title="`Voir ${row.description}`"
                    aria-label="Voir le détail"
                  >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="desk?.sessionOpen && desk.total > 0"
          class="flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 px-5 py-4"
        >
          <span class="text-sm text-slate-600">{{ pageStart }} – {{ pageEnd }} pour {{ desk.total }}</span>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
              :disabled="page <= 1"
              @click="page--"
            >
              ‹
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
              :disabled="pageEnd >= desk.total"
              @click="page++"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </template>

    <Teleport to="body">
      <div
        v-if="modal === 'entry'"
        class="cash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-entry-title"
        @click.self="closeEntryModal"
      >
        <form
          class="cash-entry-modal flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          @submit.prevent="submitEntryModal"
        >
          <div class="flex items-start justify-between gap-3 px-6 pb-2 pt-6">
            <h3 id="manual-entry-title" class="text-xl font-bold text-[#216EC2]">Entrée en caisse Manuelle</h3>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#216EC2]/10 text-lg font-bold leading-none text-[#216EC2] hover:bg-[#216EC2]/20"
              aria-label="Fermer"
              @click="closeEntryModal"
            >
              ×
            </button>
          </div>

          <div class="space-y-4 overflow-y-auto px-6 py-4">
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Date</span>
              <input v-model="formEntryDate" type="date" required class="cash-entry-field__input" />
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Description</span>
              <input v-model.trim="formLabel" type="text" required placeholder="Nom ou libellé" class="cash-entry-field__input" />
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Montant</span>
              <div class="cash-amount-field">
                <input
                  v-model.number="formAmountXof"
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  class="cash-amount-field__input"
                />
                <span class="cash-amount-field__suffix">XOF</span>
              </div>
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Source</span>
              <input v-model.trim="formSource" type="text" required list="cash-entry-sources" class="cash-entry-field__input" />
              <datalist id="cash-entry-sources">
                <option value="Paiement" />
                <option value="Don" />
                <option value="Subvention" />
                <option value="Autre" />
              </datalist>
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Mode de paiement</span>
              <select v-model="formPaymentMethod" required class="cash-entry-field__input">
                <option>Espèces</option>
                <option>Orange Money</option>
                <option>Wave</option>
                <option>Virement</option>
              </select>
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">N°Facture</span>
              <input v-model.trim="formInvoiceNumber" type="text" placeholder="Ex. CM44223" class="cash-entry-field__input" />
            </label>
          </div>

          <div class="shrink-0 px-6 pb-6 pt-2">
            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-[#F9994B] py-3.5 text-base font-bold text-white shadow-md hover:brightness-105 disabled:opacity-50"
              :disabled="cashBusy"
            >
              Ajouter
              <span class="text-lg leading-none" aria-hidden="true">+</span>
            </button>
          </div>
        </form>
      </div>

      <div
        v-if="modal === 'billing'"
        class="cash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="billingStep === 'invoice' ? 'billing-modal-title' : 'billing-pay-title'"
        @click.self="closeBillingModal"
      >
        <div
          class="cash-entry-modal flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          :class="billingStep === 'pay' ? 'cash-entry-modal--pay' : ''"
        >
          <template v-if="billingStep === 'invoice'">
          <div class="flex items-start justify-between gap-3 px-6 pb-2 pt-6">
            <div>
              <h3 id="billing-modal-title" class="text-xl font-bold text-[#216EC2]">Facturation</h3>
              <p class="mt-1 text-xs text-slate-500">
                Saisissez le numéro de facture (ex. INV-2026-01234).
              </p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#216EC2]/10 text-lg font-bold leading-none text-[#216EC2] hover:bg-[#216EC2]/20"
              aria-label="Fermer"
              @click="closeBillingModal"
            >
              ×
            </button>
          </div>

          <div class="space-y-4 overflow-y-auto px-6 py-4">
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">N° Facture</span>
              <div class="flex gap-2">
                <input
                  v-model.trim="invoiceLookupInput"
                  type="text"
                  placeholder="INV-2026-56883 ou 56883"
                  class="cash-entry-field__input min-w-0 flex-1"
                  autocomplete="off"
                  @keydown.enter.prevent="lookupInvoice"
                />
                <button
                  type="button"
                  class="shrink-0 rounded-full bg-[#216EC2] px-5 py-2.5 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50"
                  :disabled="invoiceLookupPending || !invoiceLookupInput.trim()"
                  @click="lookupInvoice"
                >
                  {{ invoiceLookupPending ? '…' : 'Rechercher' }}
                </button>
              </div>
            </label>

            <p v-if="invoiceLookupError" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {{ invoiceLookupError }}
            </p>

            <template v-if="invoiceLookup">
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Élève</span>
                <input :value="invoiceLookup.studentName" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Classe</span>
                <input :value="invoiceLookup.className" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Type</span>
                <input :value="invoiceLookup.label" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Détail</span>
                <input :value="invoiceLookup.detail" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Année scolaire</span>
                <input :value="invoiceLookup.schoolYear" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Montant</span>
                <div class="cash-amount-field cash-amount-field--readonly">
                  <input
                    :value="formatAmountDigits(invoiceLookup.amountCents)"
                    readonly
                    class="cash-amount-field__input font-semibold"
                  />
                  <span class="cash-amount-field__suffix">XOF</span>
                </div>
              </label>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Statut</span>
                <input :value="invoiceLookup.statusLabel" readonly class="cash-entry-field__input cash-entry-field__input--readonly" />
              </label>
            </template>
          </div>

          <div v-if="invoiceLookup" class="shrink-0 px-6 pb-6 pt-2">
            <button
              v-if="invoiceLookup.canPay"
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-base font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
              :disabled="cashBusy"
              @click="openPayModalFromInvoice"
            >
              Payer
            </button>
            <p v-else class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
              Cette facture ne peut pas être encaissée (déjà réglée ou scolarité annuelle à payer avant).
            </p>
          </div>
          </template>

          <form
            v-else-if="payTarget"
            class="flex min-h-0 flex-1 flex-col"
            @submit.prevent="submitPayBill"
          >
            <div class="cash-entry-modal__pay-header flex items-start justify-between gap-3 px-6 pb-2 pt-6">
              <div>
                <button
                  type="button"
                  class="mb-2 text-sm font-semibold text-emerald-800 hover:underline"
                  @click="backToInvoiceStep"
                >
                  ← Retour à la facture
                </button>
                <h3 id="billing-pay-title" class="text-xl font-bold text-emerald-900">Encaisser à la caisse</h3>
                <p class="mt-1 text-xs text-emerald-800/80">Confirmez le mode de paiement pour valider l’encaissement.</p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900/10 text-lg font-bold leading-none text-emerald-900 hover:bg-emerald-900/20"
                aria-label="Fermer"
                @click="closeBillingModal"
              >
                ×
              </button>
            </div>

            <div class="space-y-4 overflow-y-auto px-6 py-4">
              <div class="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-4">
                <p class="text-sm text-slate-600">
                  <span class="font-semibold text-slate-800">{{ payTarget.studentName }}</span>
                  — {{ payTarget.label }}
                </p>
                <p class="mt-1 text-xs text-slate-500">{{ payTarget.detail }} · {{ payTarget.className }}</p>
                <p class="mt-3 text-2xl font-bold text-emerald-900">{{ formatXof(payTarget.amountCents) }}</p>
              </div>
              <label class="cash-entry-field block">
                <span class="cash-entry-field__label">Mode de paiement</span>
                <select v-model="formPaymentMethod" required class="cash-entry-field__input">
                  <option>Espèces</option>
                  <option>Orange Money</option>
                  <option>Wave</option>
                  <option>Virement</option>
                </select>
              </label>
            </div>

            <div class="shrink-0 px-6 pb-6 pt-2">
              <button
                type="submit"
                class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-base font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                :disabled="cashBusy"
              >
                Enregistrer le paiement
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        v-if="modal === 'exit'"
        class="cash-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-exit-title"
        @click.self="closeExitModal"
      >
        <form
          class="cash-entry-modal flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          @submit.prevent="submitExitModal"
        >
          <div class="flex items-start justify-between gap-3 px-6 pb-2 pt-6">
            <h3 id="manual-exit-title" class="text-xl font-bold text-[#216EC2]">Sortie de caisse Manuelle</h3>
            <button
              type="button"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#216EC2]/10 text-lg font-bold leading-none text-[#216EC2] hover:bg-[#216EC2]/20"
              aria-label="Fermer"
              @click="closeExitModal"
            >
              ×
            </button>
          </div>

          <div class="space-y-4 overflow-y-auto px-6 py-4">
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Date</span>
              <input v-model="formExitDate" type="date" required class="cash-entry-field__input" />
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Description</span>
              <input
                v-model.trim="formLabel"
                type="text"
                required
                placeholder="Ex. Salaire maîtresse"
                class="cash-entry-field__input"
              />
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Montant</span>
              <div class="cash-amount-field">
                <input
                  v-model.number="formAmountXof"
                  type="number"
                  min="1"
                  required
                  placeholder="0"
                  class="cash-amount-field__input"
                />
                <span class="cash-amount-field__suffix">XOF</span>
              </div>
            </label>
            <label class="cash-entry-field block">
              <span class="cash-entry-field__label">Mode de paiement</span>
              <select v-model="formPaymentMethod" required class="cash-entry-field__input">
                <option>Espèces</option>
                <option>Orange Money</option>
                <option>Wave</option>
                <option>Virement</option>
              </select>
            </label>
          </div>

          <div class="shrink-0 px-6 pb-6 pt-2">
            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-full bg-[#F9994B] py-3.5 text-base font-bold text-white shadow-md hover:brightness-105 disabled:opacity-50"
              :disabled="cashBusy"
            >
              Ajouter
              <span class="text-lg leading-none" aria-hidden="true">+</span>
            </button>
          </div>
        </form>
      </div>

    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

type DeskDto =
  | { sessionOpen: false }
  | {
      sessionOpen: true
      sessionId: string
      openedAt: string
      stats: {
        balanceCents: number
        entriesCents: number
        exitsCents: number
        paymentsCents: number
        manualCents: number
      }
      entries: Array<{
        id: string
        date: string
        description: string
        source: string
        amountCents: number
        paymentMethod: string
        hasInvoice: boolean
        invoiceNumber?: string | null
      }>
      total: number
      page: number
      limit: number
    }

const route = useRoute()
const router = useRouter()
const { token } = useAuth()
const config = useRuntimeConfig()

const desk = ref<DeskDto | null>(null)
const loadError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const pending = ref(true)
const cashBusy = ref(false)
const searchInput = ref('')
const debouncedSearch = ref('')
const page = ref(1)
const limit = ref(10)
const modal = ref<'entry' | 'exit' | 'billing' | null>(null)
const billingStep = ref<'invoice' | 'pay'>('invoice')
const payTarget = ref<PayBillTarget | null>(null)

type PayBillTarget = {
  id: string
  studentName: string
  className: string
  label: string
  detail: string
  amountCents: number
}

type InvoiceLookupDto = {
  billId: string
  invoiceNumber: string
  studentName: string
  className: string
  label: string
  detail: string
  amountCents: number
  schoolYear: string
  statusLabel: string
  canPay: boolean
}

const invoiceLookupInput = ref('')
const invoiceLookup = ref<InvoiceLookupDto | null>(null)
const invoiceLookupPending = ref(false)
const invoiceLookupError = ref<string | null>(null)
const formLabel = ref('')
const formAmountXof = ref<number | null>(null)
const formPaymentMethod = ref('Espèces')
const formHasInvoice = ref(false)
const formEntryDate = ref(todayInputDate())
const formExitDate = ref(todayInputDate())
const formSource = ref('Paiement')
const formInvoiceNumber = ref('')

function todayInputDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const totalsHighlight = ref<'entries' | 'exits' | 'balance' | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

function flashTotals(which: 'entries' | 'exits') {
  totalsHighlight.value = which
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightTimer = setTimeout(() => {
    totalsHighlight.value = null
  }, 1800)
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (v) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = v
    page.value = 1
  }, 350)
})

function formatXof(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatAmountDigits(cents: number) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
}

const entryRows = computed(() => (desk.value?.sessionOpen ? desk.value.entries : []))
const pageStart = computed(() => {
  if (!desk.value?.sessionOpen || !desk.value.total) return 0
  return (desk.value.page - 1) * desk.value.limit + 1
})
const pageEnd = computed(() => {
  if (!desk.value?.sessionOpen || !desk.value.total) return 0
  return Math.min(desk.value.page * desk.value.limit, desk.value.total)
})

function readFetchMessage(e: unknown, fallback: string): string {
  const err = e as { data?: { message?: string | string[] }; message?: string }
  const raw = err?.data?.message ?? err?.message
  if (typeof raw === 'string' && raw.trim()) return raw
  if (Array.isArray(raw) && raw[0]) return String(raw[0])
  return fallback
}

async function lookupInvoice() {
  const t = token.value
  const num = invoiceLookupInput.value.trim()
  if (!t || !num) return
  if (!desk.value?.sessionOpen) {
    invoiceLookupError.value = 'Ouvrez la caisse avant d’encaisser une facture.'
    return
  }
  invoiceLookupPending.value = true
  invoiceLookupError.value = null
  invoiceLookup.value = null
  try {
    const res = await $fetch<{ invoice: InvoiceLookupDto }>(
      `${config.public.apiBase}/admin/accounting/cash/lookup-invoice`,
      {
        headers: { Authorization: `Bearer ${t}` },
        query: { number: num },
      },
    )
    invoiceLookup.value = res.invoice
  } catch (e: unknown) {
    invoiceLookupError.value = readFetchMessage(e, 'Facture introuvable.')
    invoiceLookup.value = null
  } finally {
    invoiceLookupPending.value = false
  }
}

async function loadDesk() {
  pending.value = true
  loadError.value = null
  const t = token.value
  if (!t) {
    pending.value = false
    desk.value = null
    return
  }
  try {
    desk.value = await $fetch<DeskDto>(`${config.public.apiBase}/admin/accounting/cash/desk`, {
      headers: { Authorization: `Bearer ${t}` },
      query: {
        page: page.value,
        limit: limit.value,
        search: debouncedSearch.value.trim() || undefined,
      },
    })
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Impossible de charger la caisse.')
    desk.value = null
  } finally {
    pending.value = false
  }

  const autoOpen = route.query.open === '1'
  if (autoOpen) {
    await router.replace({ path: '/admin/comptabilite/caisse' })
    if (desk.value && !desk.value.sessionOpen) {
      await openCash()
    }
  }
}

function closeBillingModal() {
  modal.value = null
  billingStep.value = 'invoice'
  payTarget.value = null
  invoiceLookup.value = null
  invoiceLookupError.value = null
}

function openBillingModal() {
  invoiceLookupInput.value = ''
  invoiceLookup.value = null
  invoiceLookupError.value = null
  billingStep.value = 'invoice'
  payTarget.value = null
  modal.value = 'billing'
}

function backToInvoiceStep() {
  billingStep.value = 'invoice'
  payTarget.value = null
}

function openPayModalFromInvoice() {
  const inv = invoiceLookup.value
  if (!inv?.canPay) return
  payTarget.value = {
    id: inv.billId,
    studentName: inv.studentName,
    className: inv.className,
    label: inv.label,
    detail: inv.detail,
    amountCents: inv.amountCents,
  }
  formPaymentMethod.value = 'Espèces'
  formHasInvoice.value = true
  billingStep.value = 'pay'
}

function closeEntryModal() {
  modal.value = null
}

function openEntryModal() {
  formEntryDate.value = todayInputDate()
  formLabel.value = ''
  formAmountXof.value = null
  formSource.value = 'Paiement'
  formPaymentMethod.value = 'Espèces'
  formInvoiceNumber.value = ''
  modal.value = 'entry'
}

function closeExitModal() {
  modal.value = null
}

function openExitModal() {
  formExitDate.value = todayInputDate()
  formLabel.value = ''
  formAmountXof.value = null
  formPaymentMethod.value = 'Espèces'
  modal.value = 'exit'
}


async function submitPayBill() {
  const t = token.value
  const bill = payTarget.value
  if (!t || !bill) return
  cashBusy.value = true
  actionMessage.value = null
  loadError.value = null
  try {
    const res = await $fetch<{
      stats: {
        balanceCents: number
        entriesCents: number
        exitsCents: number
        paymentsCents: number
        manualCents: number
      }
    }>(`${config.public.apiBase}/admin/accounting/cash/pay-bill`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: {
        billId: bill.id,
        paymentMethod: formPaymentMethod.value,
        hasInvoice: formHasInvoice.value,
      },
    })
    payTarget.value = null
    billingStep.value = 'invoice'
    modal.value = null
    actionMessage.value = `Paiement enregistré — ${bill.studentName} (${bill.label}).`
    invoiceLookup.value = null
    invoiceLookupInput.value = ''
    if (desk.value?.sessionOpen && res?.stats) {
      desk.value = { ...desk.value, stats: res.stats }
    }
    flashTotals('entries')
    await loadDesk()
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Paiement impossible.')
  } finally {
    cashBusy.value = false
  }
}

async function submitEntryModal() {
  const t = token.value
  if (!t || !formLabel.value || !formAmountXof.value) return
  cashBusy.value = true
  actionMessage.value = null
  loadError.value = null
  try {
    const res = await $fetch<{
      stats: {
        balanceCents: number
        entriesCents: number
        exitsCents: number
        paymentsCents: number
        manualCents: number
      }
    }>(`${config.public.apiBase}/admin/accounting/cash/manual-entries`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: {
        description: formLabel.value,
        amountCents: Math.round(formAmountXof.value * 100),
        paymentMethod: formPaymentMethod.value,
        source: formSource.value,
        invoiceNumber: formInvoiceNumber.value || undefined,
        entryDate: formEntryDate.value,
        hasInvoice: Boolean(formInvoiceNumber.value.trim()),
      },
    })
    closeEntryModal()
    actionMessage.value = 'Entrée enregistrée.'
    if (desk.value?.sessionOpen && res?.stats) {
      desk.value = { ...desk.value, stats: res.stats }
    }
    flashTotals('entries')
    page.value = 1
    await loadDesk()
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Enregistrement impossible.')
  } finally {
    cashBusy.value = false
  }
}

async function submitExitModal() {
  const t = token.value
  if (!t || !formLabel.value || !formAmountXof.value) return
  cashBusy.value = true
  actionMessage.value = null
  loadError.value = null
  try {
    const res = await $fetch<{
      stats: {
        balanceCents: number
        entriesCents: number
        exitsCents: number
        paymentsCents: number
        manualCents: number
      }
    }>(`${config.public.apiBase}/admin/accounting/cash/expenses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: {
        label: formLabel.value,
        amountCents: Math.round(formAmountXof.value * 100),
        paymentMethod: formPaymentMethod.value,
        expenseDate: formExitDate.value,
      },
    })
    closeExitModal()
    actionMessage.value = 'Sortie enregistrée.'
    if (desk.value?.sessionOpen && res?.stats) {
      desk.value = { ...desk.value, stats: res.stats }
    }
    flashTotals('exits')
    page.value = 1
    await loadDesk()
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Enregistrement impossible.')
  } finally {
    cashBusy.value = false
  }
}

async function openCash() {
  const t = token.value
  if (!t) return
  cashBusy.value = true
  loadError.value = null
  try {
    await $fetch(`${config.public.apiBase}/admin/accounting/cash/open`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
      body: {},
    })
    actionMessage.value = 'Caisse ouverte.'
    await loadDesk()
  } catch (e: unknown) {
    loadError.value = readFetchMessage(e, 'Impossible d’ouvrir la caisse.')
  } finally {
    cashBusy.value = false
  }
}

async function closeCash() {
  const t = token.value
  if (!t) return
  if (!confirm('Fermer la caisse pour cette session ?')) return
  cashBusy.value = true
  try {
    await $fetch(`${config.public.apiBase}/admin/accounting/cash/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}` },
    })
    await navigateTo('/admin/comptabilite')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string | string[] } }
    const raw = err?.data?.message
    loadError.value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : 'Impossible de fermer la caisse.'
  } finally {
    cashBusy.value = false
  }
}

watch([token, page, limit, debouncedSearch], () => {
  if (token.value) void loadDesk()
}, { immediate: true })

</script>

<style scoped>
.cash-modal-overlay {
  background-color: rgb(33 110 194 / 0.34);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cash-entry-field__input--readonly {
  cursor: default;
  background-color: #f8fafc;
  color: #334155;
}

.cash-entry-field__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #216ec2;
}
.cash-entry-field__input {
  display: block;
  width: 100%;
  border-radius: 9999px;
  border: 1px solid rgb(33 110 194 / 0.35);
  background-color: #fff;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
}
.cash-entry-field__input:focus {
  border-color: #216ec2;
  box-shadow: 0 0 0 3px rgb(33 110 194 / 0.15);
}

.cash-amount-field {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  border-radius: 9999px;
  border: 1px solid rgb(33 110 194 / 0.35);
  background-color: #fff;
}
.cash-amount-field:focus-within {
  border-color: #216ec2;
  box-shadow: 0 0 0 3px rgb(33 110 194 / 0.15);
}
.cash-amount-field--readonly {
  background-color: #f8fafc;
}
.cash-amount-field__input {
  min-width: 0;
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.65rem 1rem;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
}
.cash-amount-field--readonly .cash-amount-field__input {
  cursor: default;
  color: #334155;
}
.cash-amount-field__suffix {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  background-color: #f1f5f9;
  border-left: 1px solid rgb(33 110 194 / 0.2);
}

.cash-entry-modal--pay {
  border: 2px solid rgb(16 185 129 / 0.35);
}
.cash-entry-modal__pay-header {
  background: linear-gradient(180deg, rgb(236 253 245) 0%, #fff 100%);
  border-bottom: 1px solid rgb(16 185 129 / 0.2);
}

.cash-entry-modal input[type='date'] {
  appearance: none;
  min-height: 2.75rem;
}
</style>
