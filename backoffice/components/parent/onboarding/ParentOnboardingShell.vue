<template>
  <div class="parent-onboarding">
    <div class="parent-onboarding__blob parent-onboarding__blob--tr" aria-hidden="true" />
    <div class="parent-onboarding__blob parent-onboarding__blob--bl" aria-hidden="true" />
    <div class="parent-onboarding__blob parent-onboarding__blob--br" aria-hidden="true" />

    <header class="parent-onboarding__header">
      <div class="parent-onboarding__logo-wrap">
        <img :src="logoUrl" alt="Commonwealth Preschool of Abidjan" class="parent-onboarding__logo" />
      </div>

      <div class="parent-onboarding__header-actions">
        <div class="parent-onboarding__lang" role="group" aria-label="Langue">
          <button
            type="button"
            class="parent-onboarding__lang-btn"
            :class="{ 'parent-onboarding__lang-btn--active': locale === 'fr' }"
            @click="setLocale('fr')"
          >
            FR
          </button>
          <button
            type="button"
            class="parent-onboarding__lang-btn"
            :class="{ 'parent-onboarding__lang-btn--active': locale === 'en' }"
            @click="setLocale('en')"
          >
            EN
          </button>
        </div>
        <button type="button" class="parent-onboarding__skip" @click="$emit('skip')">
          {{ t('parentOnboarding.skip') }}
        </button>
      </div>
    </header>

    <main class="parent-onboarding__main">
      <slot />
    </main>

    <footer class="parent-onboarding__footer">
      <div class="parent-onboarding__dots" aria-hidden="true">
        <span
          v-for="n in totalSteps"
          :key="n"
          class="parent-onboarding__dot"
          :class="{ 'parent-onboarding__dot--active': n === step }"
        />
      </div>

      <div class="parent-onboarding__nav">
        <button
          type="button"
          class="parent-onboarding__btn parent-onboarding__btn--ghost"
          :disabled="step <= 1"
          @click="$emit('prev')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ t('parentOnboarding.prev') }}
        </button>

        <button
          v-if="step < totalSteps"
          type="button"
          class="parent-onboarding__btn parent-onboarding__btn--primary"
          @click="$emit('next')"
        >
          {{ t('parentOnboarding.next') }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <button
          v-else
          type="button"
          class="parent-onboarding__btn parent-onboarding__btn--primary"
          @click="$emit('finish')"
        >
          {{ t('parentOnboarding.start') }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import logoUrl from '~/assets/images/logo.png';

defineProps<{
  step: number;
  totalSteps: number;
}>();

defineEmits<{
  prev: [];
  next: [];
  skip: [];
  finish: [];
}>();

const { locale, setLocale, t } = useI18n();
</script>

<style scoped>
.parent-onboarding {
  position: relative;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  overflow: hidden;
  background: #216ec2;
  color: #fff;
}

.parent-onboarding__blob {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
}

.parent-onboarding__blob--tr {
  top: -7rem;
  right: -5rem;
  height: 16rem;
  width: 16rem;
  background: #f99b4b;
}

.parent-onboarding__blob--bl {
  bottom: -8rem;
  left: -7rem;
  height: 18rem;
  width: 18rem;
  background: #fff;
}

.parent-onboarding__blob--br {
  right: -4rem;
  bottom: -6rem;
  height: 14rem;
  width: 14rem;
  background: #f99b4b;
}

.parent-onboarding__header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.parent-onboarding__logo-wrap {
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.5rem 0.75rem;
}

.parent-onboarding__logo {
  height: 2.75rem;
  width: auto;
  object-fit: contain;
}

.parent-onboarding__header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.parent-onboarding__lang {
  display: inline-flex;
  overflow: hidden;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.15);
  padding: 0.125rem;
}

.parent-onboarding__lang-btn {
  border-radius: 9999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(255 255 255 / 0.75);
}

.parent-onboarding__lang-btn--active {
  background: #fff;
  color: #216ec2;
}

.parent-onboarding__skip {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  opacity: 0.95;
}

.parent-onboarding__skip:hover {
  text-decoration: underline;
}

.parent-onboarding__main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 1.5rem 1rem;
}

.parent-onboarding__footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.5rem 1.5rem;
}

.parent-onboarding__dots {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding-bottom: 0.5rem;
  padding-left: 0.25rem;
}

.parent-onboarding__dot {
  display: block;
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.35);
  transition:
    width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.35s ease;
}

.parent-onboarding__dot--active {
  width: 1.75rem;
  background: #f99b4b;
}

.parent-onboarding__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.parent-onboarding__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.625rem;
  padding: 0.625rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;
}

.parent-onboarding__btn:active:not(:disabled) {
  transform: scale(0.98);
}

.parent-onboarding__btn--ghost {
  border: 1.5px solid rgb(255 255 255 / 0.85);
  background: transparent;
  color: #fff;
}

.parent-onboarding__btn--ghost:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.parent-onboarding__btn--primary {
  background: #f99b4b;
  color: #fff;
  box-shadow: 0 8px 24px rgb(249 155 75 / 0.35);
}

.parent-onboarding__btn--primary:hover {
  filter: brightness(1.05);
}

@media (min-width: 1024px) {
  .parent-onboarding__header {
    padding: 1.5rem 2.5rem;
  }

  .parent-onboarding__main {
    padding: 0 2.5rem 1.5rem;
  }

  .parent-onboarding__footer {
    padding: 0 2.5rem 2rem;
  }

  .parent-onboarding__blob--tr {
    top: -10rem;
    right: -6rem;
    height: 22rem;
    width: 22rem;
  }

  .parent-onboarding__blob--bl {
    bottom: -10rem;
    left: -9rem;
    height: 24rem;
    width: 24rem;
  }

  .parent-onboarding__blob--br {
    right: -5rem;
    bottom: -8rem;
    height: 18rem;
    width: 18rem;
  }
}
</style>
