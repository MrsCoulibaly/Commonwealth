<template>
  <div
    class="fixed inset-0 z-[120] flex items-center justify-center bg-[#216EC2]/25 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    @click.self="$emit('close')"
  >
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <h3 class="text-lg font-bold text-slate-900">Modifier l'option</h3>
      <p class="mt-1 text-sm text-slate-500">
        Libellé, tarif et variantes pour {{ schoolYearLabel }}.
      </p>

      <div class="mt-5 space-y-4">
        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Code</span>
          <input
            :value="initialCode"
            type="text"
            readonly
            class="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase text-slate-500"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Libellé</span>
          <input
            v-model.trim="label"
            type="text"
            required
            class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Cantine"
          >
        </label>

        <label class="block">
          <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Mode de tarification</span>
          <select v-model="pricingMode" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
            <option value="FLAT">Prix unique</option>
            <option value="CUSTOMIZABLE">Personnalisable (variantes)</option>
          </select>
        </label>

        <div v-if="pricingMode === 'FLAT'" class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Tarif (XOF)</span>
            <input
              v-model.number="amountXof"
              type="number"
              min="0"
              step="1"
              class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Période</span>
            <select v-model="billingPeriod" class="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">
              <option value="MONTHLY">Mensuel</option>
              <option value="YEARLY">Annuel</option>
            </select>
          </label>
        </div>

        <div v-else class="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Variantes</p>
          <div
            v-for="(variant, index) in variants"
            :key="index"
            class="rounded-lg border border-slate-200 bg-white p-3"
          >
            <div class="mb-2 flex items-center justify-between gap-2">
              <p class="text-xs font-semibold text-slate-500">Variante {{ index + 1 }}</p>
              <button
                v-if="variants.length > 1"
                type="button"
                class="text-xs font-semibold text-red-600 hover:underline"
                @click="removeVariant(index)"
              >
                Retirer
              </button>
            </div>
            <div class="grid gap-2 sm:grid-cols-2">
              <input
                v-model.trim="variant.label"
                type="text"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                placeholder="Repas + goûter"
              >
              <input
                v-model.trim="variant.code"
                type="text"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase"
                placeholder="COMPLET"
              >
              <input
                v-model.number="variant.amountXof"
                type="number"
                min="0"
                class="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Tarif XOF"
              >
            </div>
          </div>
          <button
            type="button"
            class="text-sm font-semibold text-[#216EC2] hover:underline"
            @click="addVariant"
          >
            + Ajouter une variante
          </button>
        </div>
      </div>

      <p v-if="validationError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ validationError }}
      </p>
      <p v-if="serverError" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ serverError }}
      </p>

      <form class="mt-6 flex justify-end gap-2" @submit.prevent="save">
        <button
          type="button"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="$emit('close')"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
export type ServiceVariantDraft = {
  code: string;
  label: string;
  amountXof: number;
};

export type ServiceEditPayload = {
  label: string;
  pricingMode: 'FLAT' | 'CUSTOMIZABLE';
  amountXof: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  variants: ServiceVariantDraft[];
};

const props = defineProps<{
  initialCode: string;
  initialLabel: string;
  initialPricingMode: 'FLAT' | 'CUSTOMIZABLE';
  initialAmountXof: number;
  initialBillingPeriod: 'MONTHLY' | 'YEARLY';
  initialVariants: ServiceVariantDraft[];
  schoolYearLabel: string;
  saving?: boolean;
  serverError?: string | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: ServiceEditPayload];
}>();

const label = ref('');
const pricingMode = ref<'FLAT' | 'CUSTOMIZABLE'>('FLAT');
const amountXof = ref(0);
const billingPeriod = ref<'MONTHLY' | 'YEARLY'>('MONTHLY');
const variants = ref<ServiceVariantDraft[]>([]);
const validationError = ref('');

function resetFromProps() {
  label.value = props.initialLabel;
  pricingMode.value = props.initialPricingMode;
  amountXof.value = props.initialAmountXof;
  billingPeriod.value = props.initialBillingPeriod;
  variants.value = props.initialVariants.length
    ? props.initialVariants.map((v) => ({ ...v }))
    : [{ code: '', label: '', amountXof: 0 }];
  validationError.value = '';
}

watch(() => props.initialCode, resetFromProps, { immediate: true });

function addVariant() {
  variants.value.push({ code: '', label: '', amountXof: 0 });
}

function removeVariant(index: number) {
  variants.value.splice(index, 1);
}

function save() {
  validationError.value = '';

  const trimmedLabel = label.value.trim();
  if (!trimmedLabel) {
    validationError.value = 'Le libellé est obligatoire.';
    return;
  }

  if (pricingMode.value === 'CUSTOMIZABLE') {
    const validVariants = variants.value
      .map((v) => ({
        code: v.code.trim().toUpperCase(),
        label: v.label.trim(),
        amountXof: Number(v.amountXof) || 0,
      }))
      .filter((v) => v.code && v.label);
    if (!validVariants.length) {
      validationError.value = 'Ajoutez au moins une variante avec un libellé et un code.';
      return;
    }
    emit('save', {
      label: trimmedLabel,
      pricingMode: pricingMode.value,
      amountXof: 0,
      billingPeriod: billingPeriod.value,
      variants: validVariants,
    });
    return;
  }

  emit('save', {
    label: trimmedLabel,
    pricingMode: pricingMode.value,
    amountXof: Number(amountXof.value) || 0,
    billingPeriod: billingPeriod.value,
    variants: [],
  });
}
</script>
