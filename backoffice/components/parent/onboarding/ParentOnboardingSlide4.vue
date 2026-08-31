<template>
  <div class="slide slide--final">
    <div class="slide__success" aria-hidden="true">
      <span class="slide__ring slide__ring--outer" />
      <span class="slide__ring slide__ring--inner" />
      <span class="slide__check">✓</span>
    </div>

    <ParentOnboardingTitle
      title-key="parentOnboarding.s4.title"
      highlight-key="parentOnboarding.s4.titleHighlight"
    />
    <p class="slide__subtitle">{{ t('parentOnboarding.s4.subtitle') }}</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>

<style scoped>
.slide {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

.slide--final {
  text-align: center;
}

.slide__success {
  position: relative;
  display: grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  margin: 0 auto 1.5rem;
}

.slide__ring {
  position: absolute;
  border-radius: 9999px;
  border: 2px solid rgb(255 255 255 / 0.22);
}

.slide__ring--outer {
  inset: -0.75rem;
}

.slide__ring--inner {
  inset: -0.35rem;
}

.slide__check {
  position: relative;
  z-index: 1;
  display: inline-flex;
  height: 4.5rem;
  width: 4.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #2e8b57;
  font-size: 2rem;
  font-weight: 800;
  box-shadow: 0 12px 28px rgb(46 139 87 / 0.35);
}

.slide--final :deep(.slide__title) {
  font-size: clamp(1.85rem, 4vw, 2.75rem);
}

.slide__subtitle {
  margin: 1rem auto 0;
  max-width: 34rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgb(255 255 255 / 0.88);
}
</style>
