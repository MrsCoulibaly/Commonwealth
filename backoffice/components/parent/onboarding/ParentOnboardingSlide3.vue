<template>
  <div class="slide slide--split">
    <div class="slide__copy">
      <span class="slide__badge">{{ t('parentOnboarding.s3.badge') }}</span>
      <ParentOnboardingTitle
        title-key="parentOnboarding.s3.title"
        highlight-key="parentOnboarding.s3.titleHighlight"
      />
      <p class="slide__subtitle">{{ t('parentOnboarding.s3.subtitle') }}</p>
    </div>

    <div class="slide__visual" aria-hidden="true">
      <div class="feed-toast">
        <span class="feed-toast__icon">↓</span>
        <div>
          <p class="feed-toast__title">{{ t('parentOnboarding.s3.toastTitle') }}</p>
          <p class="feed-toast__meta">{{ t('parentOnboarding.s3.toastMeta') }}</p>
        </div>
      </div>

      <div class="feed-card">
        <div class="feed-card__head">
          <span class="feed-avatar">AK</span>
          <div class="min-w-0 flex-1">
            <p class="feed-card__name">{{ t('parentOnboarding.s3.childName') }}</p>
            <p class="feed-card__class">{{ t('parentOnboarding.s3.childClass') }}</p>
          </div>
          <span class="feed-live">{{ t('parentOnboarding.s3.live') }}</span>
        </div>

        <div class="feed-row">
          <span class="feed-row__icon feed-row__icon--blue">🕐</span>
          <div class="min-w-0 flex-1">
            <p class="feed-row__title">{{ t('parentOnboarding.s3.row1Title') }}</p>
            <p class="feed-row__meta">{{ t('parentOnboarding.s3.row1Meta') }}</p>
          </div>
          <span class="feed-row__value">08:02</span>
        </div>

        <div class="feed-row">
          <span class="feed-row__icon feed-row__icon--orange">🏫</span>
          <div class="min-w-0 flex-1">
            <p class="feed-row__title">{{ t('parentOnboarding.s3.row2Title') }}</p>
            <p class="feed-row__meta">{{ t('parentOnboarding.s3.row2Meta') }}</p>
          </div>
          <span class="feed-row__status">{{ t('parentOnboarding.s3.active') }}</span>
        </div>

        <div class="feed-row">
          <span class="feed-row__icon feed-row__icon--green">✓</span>
          <div class="min-w-0 flex-1">
            <p class="feed-row__title">{{ t('parentOnboarding.s3.row3Title') }}</p>
            <p class="feed-row__meta">{{ t('parentOnboarding.s3.row3Meta') }}</p>
          </div>
          <span class="feed-ring">75%</span>
        </div>
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

.slide__visual {
  position: relative;
  min-height: 20rem;
}

.feed-toast {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  width: min(100%, 15rem);
  border-radius: 0.875rem;
  background: #fff;
  color: #0f172a;
  padding: 0.75rem 0.875rem;
  box-shadow: 0 14px 32px rgb(15 23 42 / 0.16);
}

.feed-toast__icon {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: rgb(249 155 75 / 0.15);
  color: #f99b4b;
  font-weight: 800;
}

.feed-toast__title {
  font-size: 0.78rem;
  font-weight: 700;
}

.feed-toast__meta {
  margin-top: 0.15rem;
  font-size: 0.7rem;
  color: #64748b;
}

.feed-card {
  position: relative;
  margin-top: 2.5rem;
  border-radius: 1rem;
  background: #fff;
  color: #0f172a;
  padding: 1rem;
  box-shadow: 0 20px 44px rgb(15 23 42 / 0.18);
}

.feed-card__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #f1f5f9;
}

.feed-avatar {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #216ec2;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
}

.feed-card__name {
  font-size: 0.9rem;
  font-weight: 800;
}

.feed-card__class {
  font-size: 0.75rem;
  color: #64748b;
}

.feed-live {
  font-size: 0.65rem;
  font-weight: 800;
  color: #2e8b57;
}

.feed-live::before {
  content: '● ';
}

.feed-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f8fafc;
}

.feed-row:last-child {
  border-bottom: none;
}

.feed-row__icon {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  font-size: 0.9rem;
}

.feed-row__icon--blue {
  background: rgb(33 110 194 / 0.12);
}

.feed-row__icon--orange {
  background: rgb(249 155 75 / 0.15);
}

.feed-row__icon--green {
  background: rgb(46 139 87 / 0.12);
}

.feed-row__title {
  font-size: 0.82rem;
  font-weight: 700;
}

.feed-row__meta {
  font-size: 0.72rem;
  color: #64748b;
}

.feed-row__value {
  font-size: 0.82rem;
  font-weight: 800;
}

.feed-row__status {
  font-size: 0.72rem;
  font-weight: 800;
  color: #2e8b57;
}

.feed-ring {
  display: inline-flex;
  height: 2.25rem;
  width: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 3px solid #2e8b57;
  font-size: 0.62rem;
  font-weight: 800;
  color: #2e8b57;
}

@media (min-width: 900px) {
  .slide--split {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 2.5rem;
  }
}
</style>
