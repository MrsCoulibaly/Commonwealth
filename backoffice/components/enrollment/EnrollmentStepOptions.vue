<template>
  <div class="space-y-8">
    <div
      v-if="loading"
      class="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500"
    >
      Chargement des formules et options…
    </div>

    <p v-else-if="loadError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ loadError }}
    </p>

    <template v-else>
      <section v-if="schedules.length" id="enrollment-schedule" class="space-y-3">
        <EnrollmentSectionTitle title="Formule horaire" />
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="schedule in schedules"
            :key="schedule.id"
            type="button"
            class="enrollment-choice-card flex-col items-start !gap-2 !py-4 text-left"
            :class="options.scheduleId === schedule.id ? 'enrollment-choice-card--selected' : 'enrollment-choice-card--default'"
            @click="selectSchedule(schedule)"
          >
            <div class="flex w-full items-center gap-3">
              <span
                class="enrollment-radio"
                :class="options.scheduleId === schedule.id ? 'enrollment-radio--selected' : 'enrollment-radio--default'"
              >
                <svg
                  v-if="options.scheduleId === schedule.id"
                  class="h-2.5 w-2.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-[13px] font-bold text-slate-900">{{ schedule.label }}</span>
                <span v-if="schedule.timeDescription" class="mt-0.5 block text-[11px] text-slate-500">
                  {{ schedule.timeDescription }}
                </span>
                <span class="mt-1 block text-[11px] font-semibold text-[#216EC2]">
                  Scolarité {{ intFr.format(schedule.annualXof) }} XOF / an
                  <template v-if="schedule.monthlyXof">
                    · mensualité {{ intFr.format(schedule.monthlyXof) }} XOF / mois
                  </template>
                </span>
              </span>
            </div>
          </button>
        </div>
      </section>

      <section class="space-y-3">
        <EnrollmentSectionTitle title="Services" />
        <p v-if="!catalogServices.length" class="text-sm text-slate-500">
          Aucun service n'est proposé pour le moment.
        </p>
        <div v-else class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="service in catalogServices"
            :key="service.id"
            class="rounded-xl border border-slate-200 bg-white p-4"
            :class="isServiceSelected(service.id) ? 'ring-1 ring-[#216EC2]/25' : ''"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <p class="text-[13px] font-bold text-slate-900">{{ service.label }}</p>
                <p v-if="service.pricingMode === 'FLAT'" class="mt-1 text-sm font-semibold text-[#216EC2]">
                  {{ intFr.format(service.amountXof) }} XOF
                  <span class="font-normal text-slate-500">/ {{ service.billingPeriodLabel }}</span>
                </p>
                <p v-else class="mt-1 text-xs text-slate-500">
                  {{ service.variants.length }} formule{{ service.variants.length > 1 ? 's' : '' }} disponible{{ service.variants.length > 1 ? 's' : '' }}
                </p>
              </div>
              <button
                v-if="service.pricingMode === 'FLAT'"
                type="button"
                class="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition"
                :class="
                  isServiceSelected(service.id)
                    ? 'bg-[#216EC2] text-white'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#216EC2]/40'
                "
                @click="toggleFlatService(service)"
              >
                {{ isServiceSelected(service.id) ? 'Retirer' : 'Choisir' }}
              </button>
            </div>

            <div
              v-if="service.pricingMode === 'CUSTOMIZABLE' && service.variants.length"
              class="mt-3 space-y-2 border-t border-slate-100 pt-3"
            >
              <button
                v-for="variant in service.variants"
                :key="variant.id"
                type="button"
                class="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition"
                :class="
                  selectedVariantId(service.id) === variant.id
                    ? 'border-[#216EC2] bg-[#216EC2]/5'
                    : 'border-slate-200 hover:border-slate-300'
                "
                @click="selectVariant(service, variant)"
              >
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-slate-900">{{ variant.label }}</span>
                  <span class="mt-0.5 block text-xs text-slate-500">{{ variant.code }}</span>
                </span>
                <span class="shrink-0 text-right text-sm font-bold text-[#216EC2]">
                  {{ intFr.format(variant.amountXof) }} XOF
                  <span class="block text-[10px] font-normal text-slate-500">/ {{ variant.billingPeriodLabel }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="space-y-3">
        <EnrollmentSectionTitle title="Autorisations parentales" />
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            v-for="auth in authorizationChoices"
            :key="auth.key"
            type="button"
            class="enrollment-choice-card flex-col items-start !gap-2 !py-4 text-left"
            :class="options.authorizations[auth.key] ? 'enrollment-choice-card--selected-green' : 'enrollment-choice-card--default'"
            @click="toggleAuthorization(auth.key)"
          >
            <div class="flex w-full items-start gap-3">
              <span
                class="enrollment-checkbox mt-0.5"
                :class="options.authorizations[auth.key] ? 'enrollment-checkbox--selected-green' : 'enrollment-checkbox--default'"
              >
                <svg
                  v-if="options.authorizations[auth.key]"
                  class="h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3.5"
                >
                  <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span>
                <span class="block text-[13px] font-bold text-slate-900">{{ auth.title }}</span>
                <span class="mt-0.5 block text-[11px] text-slate-500">{{ auth.subtitle }}</span>
              </span>
            </div>
          </button>
        </div>
      </section>

      <EnrollmentField label="Message à l'administration">
        <textarea
          v-model.trim="options.comment"
          class="enrollment-textarea min-h-[100px]"
          rows="4"
          placeholder="Précisions sur votre demande…"
        />
      </EnrollmentField>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EnrollmentOptionsDraft } from '~/composables/useEnrollmentWizard';
import { ENROLLMENT_AUTHORIZATIONS } from '~/utils/enrollment-options';

type ApiSchedule = {
  id: string;
  label: string;
  timeDescription: string;
  annualXof: number;
  monthlyXof: number;
};

type ApiServiceVariant = {
  id: string;
  code: string;
  label: string;
  amountXof: number;
  billingPeriodLabel: string;
};

type ApiService = {
  id: string;
  code: string;
  label: string;
  pricingMode: 'FLAT' | 'CUSTOMIZABLE';
  amountXof: number;
  billingPeriodLabel: string;
  variants: ApiServiceVariant[];
};

const props = defineProps<{
  levelId: string;
}>();

const options = defineModel<EnrollmentOptionsDraft>('options', { required: true });

const config = useRuntimeConfig();
const intFr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

const loading = ref(true);
const loadError = ref('');
const schedules = ref<ApiSchedule[]>([]);
const catalogServices = ref<ApiService[]>([]);

const authorizationChoices = ENROLLMENT_AUTHORIZATIONS;

function selectSchedule(schedule: ApiSchedule) {
  options.value.scheduleId = schedule.id;
  options.value.scheduleLabel = schedule.label;
}

function isServiceSelected(serviceId: string): boolean {
  return options.value.serviceSelections.some((s) => s.serviceTariffId === serviceId);
}

function selectedVariantId(serviceId: string): string | null {
  return options.value.serviceSelections.find((s) => s.serviceTariffId === serviceId)?.variantId ?? null;
}

function buildSelection(
  service: ApiService,
  variant?: ApiServiceVariant,
): EnrollmentOptionsDraft['serviceSelections'][number] {
  if (variant) {
    return {
      serviceTariffId: service.id,
      code: service.code,
      variantId: variant.id,
      label: service.label,
      variantLabel: variant.label,
      amountXof: variant.amountXof,
    };
  }
  return {
    serviceTariffId: service.id,
    code: service.code,
    variantId: null,
    label: service.label,
    amountXof: service.amountXof,
  };
}

function toggleFlatService(service: ApiService) {
  if (isServiceSelected(service.id)) {
    options.value.serviceSelections = options.value.serviceSelections.filter(
      (s) => s.serviceTariffId !== service.id,
    );
    return;
  }
  options.value.serviceSelections = [
    ...options.value.serviceSelections,
    buildSelection(service),
  ];
}

function selectVariant(service: ApiService, variant: ApiServiceVariant) {
  if (selectedVariantId(service.id) === variant.id) {
    options.value.serviceSelections = options.value.serviceSelections.filter(
      (s) => s.serviceTariffId !== service.id,
    );
    return;
  }
  const rest = options.value.serviceSelections.filter((s) => s.serviceTariffId !== service.id);
  options.value.serviceSelections = [...rest, buildSelection(service, variant)];
}

function toggleAuthorization(key: keyof EnrollmentOptionsDraft['authorizations']) {
  options.value.authorizations[key] = !options.value.authorizations[key];
}

async function loadCatalog() {
  loading.value = true;
  loadError.value = '';
  try {
    const [scheduleRes, servicesRes] = await Promise.all([
      props.levelId
        ? $fetch<{ schedules: ApiSchedule[] }>(
            `${config.public.apiBase}/public/catalog/levels/${props.levelId}/schedules`,
          )
        : Promise.resolve({ schedules: [] as ApiSchedule[] }),
      $fetch<{ items: ApiService[] }>(`${config.public.apiBase}/public/catalog/services`),
    ]);

    schedules.value = scheduleRes.schedules ?? [];
    catalogServices.value = servicesRes.items ?? [];
    options.value.requiresSchedule = schedules.value.length > 0;

    if (schedules.value.length === 1 && !options.value.scheduleId) {
      selectSchedule(schedules.value[0]!);
    }
  } catch {
    loadError.value = 'Impossible de charger les formules et options.';
    schedules.value = [];
    catalogServices.value = [];
  } finally {
    loading.value = false;
  }
}

watch(
  () => props.levelId,
  () => {
    void loadCatalog();
  },
  { immediate: true },
);
</script>
