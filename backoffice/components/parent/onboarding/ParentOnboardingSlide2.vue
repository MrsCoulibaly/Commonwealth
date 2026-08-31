<template>
  <div class="slide slide--center">
    <span class="slide__badge">{{ t('parentOnboarding.s2.badge') }}</span>
    <ParentOnboardingTitle
      title-key="parentOnboarding.s2.title"
      highlight-key="parentOnboarding.s2.titleHighlight"
    />
    <p class="slide__subtitle">{{ t('parentOnboarding.s2.subtitle') }}</p>

    <div class="tools-grid">
      <article v-for="item in items" :key="item.titleKey" class="tools-card">
        <span class="tools-card__check" aria-hidden="true">✓</span>
        <div>
          <h2>{{ t(item.titleKey) }}</h2>
          <p>{{ t(item.descKey) }}</p>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const items = [
  { titleKey: 'parentOnboarding.s2.items.enrollment.title', descKey: 'parentOnboarding.s2.items.enrollment.desc' },
  { titleKey: 'parentOnboarding.s2.items.payment.title', descKey: 'parentOnboarding.s2.items.payment.desc' },
  { titleKey: 'parentOnboarding.s2.items.journal.title', descKey: 'parentOnboarding.s2.items.journal.desc' },
  { titleKey: 'parentOnboarding.s2.items.photos.title', descKey: 'parentOnboarding.s2.items.photos.desc' },
  { titleKey: 'parentOnboarding.s2.items.docs.title', descKey: 'parentOnboarding.s2.items.docs.desc' },
  { titleKey: 'parentOnboarding.s2.items.messaging.title', descKey: 'parentOnboarding.s2.items.messaging.desc' },
] as const;
</script>

<style scoped>
.slide {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}

.slide--center {
  text-align: center;
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

.slide--center :deep(.slide__title) {
  margin-top: 1rem;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.slide__subtitle {
  margin: 0.875rem auto 0;
  max-width: 34rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgb(255 255 255 / 0.88);
}

.tools-grid {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.75rem;
  text-align: left;
}

.tools-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 0.875rem;
  border: 1px solid rgb(255 255 255 / 0.22);
  background: rgb(255 255 255 / 0.1);
  padding: 0.875rem 1rem;
  backdrop-filter: blur(6px);
}

.tools-card__check {
  display: inline-flex;
  height: 1.5rem;
  width: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #2e8b57;
  font-size: 0.75rem;
  font-weight: 800;
}

.tools-card h2 {
  font-size: 0.9rem;
  font-weight: 800;
}

.tools-card p {
  margin-top: 0.2rem;
  font-size: 0.78rem;
  line-height: 1.45;
  color: rgb(255 255 255 / 0.82);
}

@media (min-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.875rem;
  }
}

@media (min-width: 1024px) {
  .tools-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
