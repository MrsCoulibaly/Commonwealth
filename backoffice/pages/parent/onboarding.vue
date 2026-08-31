<template>
  <ParentOnboardingShell
    :step="step"
    :total-steps="TOTAL_STEPS"
    @prev="prev"
    @next="next"
    @skip="finish"
    @finish="finish"
  >
    <div class="onboarding-stage">
      <Transition :name="transitionName" mode="out-in">
        <component :is="slides[step - 1]" :key="step" />
      </Transition>
    </div>
  </ParentOnboardingShell>
</template>

<script setup lang="ts">
import ParentOnboardingShell from '~/components/parent/onboarding/ParentOnboardingShell.vue';
import ParentOnboardingSlide1 from '~/components/parent/onboarding/ParentOnboardingSlide1.vue';
import ParentOnboardingSlide2 from '~/components/parent/onboarding/ParentOnboardingSlide2.vue';
import ParentOnboardingSlide3 from '~/components/parent/onboarding/ParentOnboardingSlide3.vue';
import ParentOnboardingSlide4 from '~/components/parent/onboarding/ParentOnboardingSlide4.vue';

definePageMeta({
  layout: false,
  middleware: ['parent'],
});

useHead({
  title: 'Espace parent — Présentation',
});

const TOTAL_STEPS = 4;
const slides = [
  ParentOnboardingSlide1,
  ParentOnboardingSlide2,
  ParentOnboardingSlide3,
  ParentOnboardingSlide4,
];

const step = ref(1);
const direction = ref<'forward' | 'back'>('forward');

const transitionName = computed(() =>
  direction.value === 'forward' ? 'onboarding-forward' : 'onboarding-back',
);

const { finishOnboarding } = useParentOnboarding();
const { isLoggedIn } = useParentAuth();

onMounted(() => {
  if (isLoggedIn.value) {
    void navigateTo('/parent');
  }
});

function prev() {
  if (step.value <= 1) return;
  direction.value = 'back';
  step.value -= 1;
}

function next() {
  if (step.value >= TOTAL_STEPS) return;
  direction.value = 'forward';
  step.value += 1;
}

function finish() {
  void finishOnboarding();
}
</script>

<style>
.onboarding-stage {
  width: 100%;
}

.onboarding-forward-enter-active,
.onboarding-forward-leave-active,
.onboarding-back-enter-active,
.onboarding-back-leave-active {
  transition:
    opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
}

.onboarding-forward-enter-from {
  opacity: 0;
  transform: translateX(48px);
}

.onboarding-forward-leave-to {
  opacity: 0;
  transform: translateX(-48px);
}

.onboarding-back-enter-from {
  opacity: 0;
  transform: translateX(-48px);
}

.onboarding-back-leave-to {
  opacity: 0;
  transform: translateX(48px);
}

@media (prefers-reduced-motion: reduce) {
  .onboarding-forward-enter-active,
  .onboarding-forward-leave-active,
  .onboarding-back-enter-active,
  .onboarding-back-leave-active {
    transition: none;
  }

  .onboarding-forward-enter-from,
  .onboarding-forward-leave-to,
  .onboarding-back-enter-from,
  .onboarding-back-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>
