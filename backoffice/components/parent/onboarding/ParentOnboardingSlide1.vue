<template>
  <div class="slide slide--split">
    <div class="slide__copy">
      <span class="slide__badge">{{ t('parentOnboarding.s1.badge') }}</span>
      <ParentOnboardingTitle
        title-key="parentOnboarding.s1.title"
        highlight-key="parentOnboarding.s1.titleHighlight"
      />
      <p class="slide__subtitle">{{ t('parentOnboarding.s1.subtitle') }}</p>
    </div>

    <div class="slide__visual slide__visual--cards" aria-hidden="true">
      <div class="mock-card mock-card--doc">
        <div class="mock-card__head">
          <span class="mock-icon mock-icon--orange">📄</span>
          <span>{{ t('parentOnboarding.s1.cardEnrollment') }}</span>
        </div>
        <div class="mock-lines">
          <span /><span /><span class="mock-lines__green" />
        </div>
      </div>

      <div class="mock-card mock-card--tuition">
        <div class="mock-card__head mock-card__head--light">
          <span>{{ t('parentOnboarding.s1.cardTuition') }}</span>
          <span class="mock-card__chip">···· 4921</span>
        </div>
        <p class="mock-card__amount">350 000 FCFA</p>
        <div class="mock-progress">
          <span class="mock-progress__fill" />
        </div>
        <p class="mock-card__hint">{{ t('parentOnboarding.s1.cardTuitionHint') }}</p>
      </div>

      <div class="mock-card mock-card--validated">
        <span class="mock-check">✓</span>
        <span>{{ t('parentOnboarding.s1.cardValidated') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>

<style scoped>
.slide {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
}

.slide--split {
  display: grid;
  gap: 2rem;
  align-items: center;
}

.slide__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  background: #f99b4b;
  padding: 0.3rem 0.75rem;
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.slide__badge::before {
  content: '';
  height: 0.375rem;
  width: 0.375rem;
  border-radius: 9999px;
  background: #fff;
}

.slide__copy :deep(.slide__title) {
  margin-top: 1rem;
}

.slide__subtitle {
  margin-top: 1rem;
  max-width: 32rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgb(255 255 255 / 0.88);
}

.slide__visual--cards {
  position: relative;
  min-height: 18rem;
}

.mock-card {
  position: absolute;
  border-radius: 1rem;
  box-shadow: 0 18px 40px rgb(15 23 42 / 0.18);
}

.mock-card--doc {
  top: 0;
  right: 12%;
  width: min(100%, 15rem);
  background: #fff;
  color: #0f172a;
  padding: 1rem;
}

.mock-card--tuition {
  top: 5.5rem;
  right: 0;
  width: min(100%, 17rem);
  background: #1a5da3;
  color: #fff;
  padding: 1rem 1.125rem;
}

.mock-card--validated {
  top: 13.5rem;
  right: 18%;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  color: #0f172a;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 700;
}

.mock-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 700;
}

.mock-card__head--light {
  opacity: 0.95;
}

.mock-card__chip {
  font-size: 0.6875rem;
  opacity: 0.8;
}

.mock-icon--orange {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgb(249 155 75 / 0.15);
}

.mock-lines {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.875rem;
}

.mock-lines span {
  display: block;
  height: 0.45rem;
  border-radius: 9999px;
  background: #e2e8f0;
}

.mock-lines span:nth-child(2) {
  width: 72%;
}

.mock-lines__green {
  width: 88%;
  background: #2e8b57 !important;
}

.mock-card__amount {
  margin-top: 0.75rem;
  font-size: 1.35rem;
  font-weight: 800;
}

.mock-progress {
  margin-top: 0.625rem;
  height: 0.45rem;
  overflow: hidden;
  border-radius: 9999px;
  background: rgb(255 255 255 / 0.2);
}

.mock-progress__fill {
  display: block;
  height: 100%;
  width: 66%;
  border-radius: inherit;
  background: #f99b4b;
}

.mock-card__hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.85;
}

.mock-check {
  display: inline-flex;
  height: 1.25rem;
  width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #2e8b57;
  color: #fff;
  font-size: 0.75rem;
}

@media (min-width: 900px) {
  .slide--split {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 2.5rem;
  }
}
</style>
