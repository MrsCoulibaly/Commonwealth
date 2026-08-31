<template>
  <div
    ref="root"
    :class="[
      visible ? 'reveal-in' : 'reveal-init',
      `reveal-${variant}`,
      stagger ? 'motion-stagger' : '',
      extraClass,
    ]"
    :style="visible ? `transition-delay:${delay}ms` : ''"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
export type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'smooth-up' | 'blur' | 'pop' | 'rise';

const props = withDefaults(
  defineProps<{
    delay?: number;
    extraClass?: string;
    threshold?: number;
    variant?: RevealVariant;
    /** Déclenche l'animation au chargement (above the fold) sans attendre le scroll. */
    immediate?: boolean;
    /** Anime les enfants en cascade à l'apparition. */
    stagger?: boolean;
  }>(),
  {
    delay: 0,
    extraClass: '',
    threshold: 0.15,
    variant: 'smooth-up',
    immediate: false,
    stagger: false,
  },
);

const { ready: pageReady } = usePageLoadMotion();

const root = ref<HTMLElement | null>(null);
const visible = ref(false);

function show() {
  visible.value = true;
}

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function runImmediate() {
  if (prefersReducedMotion()) {
    show();
    return;
  }
  const baseDelay = props.immediate ? 480 : 0;
  window.setTimeout(show, baseDelay + props.delay);
}

onMounted(() => {
  const el = root.value;
  if (!el) return;

  if (prefersReducedMotion()) {
    show();
    return;
  }

  if (props.immediate) {
    if (pageReady.value) {
      runImmediate();
    } else {
      const stop = watch(pageReady, (v) => {
        if (!v) return;
        runImmediate();
        stop();
      });
    }
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      show();
      observer.disconnect();
    },
    {
      threshold: props.threshold,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  observer.observe(el);
});
</script>
