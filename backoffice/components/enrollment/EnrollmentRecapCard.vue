<template>
  <section class="recap-card">
    <div class="recap-card__header">
      <div class="recap-card__title">
        <span class="recap-card__icon" :class="iconClass">
          <slot name="icon" />
        </span>
        <h3>{{ title }}</h3>
      </div>
      <button type="button" class="recap-card__edit" @click="$emit('edit')">Modifier</button>
    </div>
    <dl class="recap-card__body">
      <slot />
    </dl>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    iconClass?: string;
  }>(),
  {
    iconClass: 'text-[#216EC2]',
  },
);

defineEmits<{
  edit: [];
}>();
</script>

<style scoped>
.recap-card {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid rgb(226 232 240);
  background: #fff;
}

.recap-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid rgb(241 245 249);
  padding: 0.875rem 1rem;
}

.recap-card__title {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
}

.recap-card__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.recap-card__title h3 {
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(30 41 59);
}

.recap-card__edit {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #216ec2;
}

.recap-card__edit:hover {
  text-decoration: underline;
}

.recap-card__body {
  margin: 0;
}
</style>
