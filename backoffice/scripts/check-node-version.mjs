const [major] = process.versions.node.split('.').map((v) => Number(v));

// Nuxt/Nitro remain stable on maintained modern Node lines.
// We only enforce a minimum major to keep local environments flexible.
const ok = Number.isFinite(major) && major >= 20;

if (!ok) {
  console.error(
    `Node ${process.versions.node} non supporté pour ce projet.\n` +
      `Utilise une version moderne de Node (20+), idéalement via nvm :\n` +
      `  nvm install --lts && nvm use --lts\n`,
  );
  process.exit(1);
}
