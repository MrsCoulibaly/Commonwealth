const CURTAIN_MIN_MS = 1100;
const CURTAIN_MAX_MS = 2200;

export function usePageLoadMotion() {
  const ready = useState('page-load-motion-ready', () => false);
  const curtainVisible = useState('page-load-curtain-visible', () => true);

  function finish() {
    ready.value = true;
    curtainVisible.value = false;
  }

  onMounted(() => {
    if (!import.meta.client) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      finish();
      return;
    }

    const started = performance.now();

    const done = () => {
      const elapsed = performance.now() - started;
      const wait = Math.max(0, CURTAIN_MIN_MS - elapsed);
      window.setTimeout(finish, wait);
    };

    if (document.readyState === 'complete') {
      done();
    } else {
      window.addEventListener('load', done, { once: true });
      window.setTimeout(done, CURTAIN_MAX_MS);
    }
  });

  return { ready, curtainVisible, finish };
}
