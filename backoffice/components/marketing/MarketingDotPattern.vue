<template>
  <div
    class="motion-dots-drift pointer-events-none"
    :class="[positionClass, sizeClass]"
    aria-hidden="true"
    :style="dotStyle"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    color?: 'orange' | 'blue';
    position?: 'top-right' | 'bottom-right' | 'top-left';
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    color: 'orange',
    position: 'top-right',
    size: 'md',
  },
);

const positionClass = computed(() => {
  if (props.position === 'bottom-right') return 'absolute -bottom-6 right-6 lg:right-10';
  if (props.position === 'top-left') return 'absolute left-6 top-16 lg:left-10';
  return 'absolute right-6 top-16 lg:right-10';
});

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-[60px] w-[60px]';
  if (props.size === 'lg') return 'h-[100px] w-[100px]';
  return 'h-[80px] w-[80px]';
});

const dotStyle = computed(() => {
  const c = props.color === 'blue' ? 'rgba(33, 110, 194, 0.55)' : 'rgba(249, 155, 75, 0.9)';
  return {
    backgroundImage: `radial-gradient(${c} 2px, transparent 2px)`,
    backgroundSize: '14px 14px',
  };
});
</script>
