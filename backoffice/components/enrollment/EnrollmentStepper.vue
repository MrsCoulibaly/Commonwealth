<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
    <div class="overflow-x-auto">
      <div class="mx-auto flex min-w-[640px] max-w-[820px] items-start px-1">
      <template v-for="(s, index) in ENROLLMENT_STEPS" :key="s.id">
        <div class="flex flex-1 flex-col items-center">
          <div class="flex w-full items-center">
            <div
              v-if="index > 0"
              class="h-px flex-1"
              :class="connectorClassBefore(s.id)"
            />
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              :class="stepCircleClass(s.id)"
            >
              <svg
                v-if="isStepDone(s.id) && currentStep !== s.id"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span v-else>{{ s.id }}</span>
            </div>
            <div
              v-if="index < ENROLLMENT_STEPS.length - 1"
              class="h-px flex-1"
              :class="connectorClassAfter(s.id)"
            />
          </div>
          <span
            class="mt-2.5 whitespace-nowrap text-center text-xs font-semibold"
            :class="currentStep === s.id ? 'text-[#216EC2]' : 'text-slate-400'"
          >
            {{ s.label }}
          </span>
        </div>
      </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ENROLLMENT_STEPS, type EnrollmentStepId } from '~/composables/useEnrollmentWizard';

const props = defineProps<{
  currentStep: EnrollmentStepId;
  isStepDone: (n: EnrollmentStepId) => boolean;
}>();

function stepCircleClass(n: EnrollmentStepId): string {
  if (props.currentStep === n) {
    return 'bg-[#216EC2] text-white';
  }
  if (props.isStepDone(n)) {
    return 'bg-[#216EC2] text-white';
  }
  return 'border border-slate-300 bg-white text-slate-400';
}

function connectorClassBefore(n: EnrollmentStepId): string {
  const prev = (n - 1) as EnrollmentStepId;
  return props.isStepDone(prev) ? 'bg-[#216EC2]/50' : 'bg-slate-200';
}

function connectorClassAfter(n: EnrollmentStepId): string {
  return props.isStepDone(n) ? 'bg-[#216EC2]/50' : 'bg-slate-200';
}
</script>
