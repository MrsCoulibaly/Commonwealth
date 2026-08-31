<template>
  <div id="enrollment-signature" class="parent-signature">
    <p class="parent-signature__label">Signature parent / responsable</p>

    <div v-if="signatureDataUrl" class="parent-signature__box parent-signature__box--filled">
      <img :src="signatureDataUrl" alt="Signature parent" class="parent-signature__image" />
      <button type="button" class="parent-signature__change" @click="clearSignature">
        Modifier
      </button>
    </div>

    <div v-else-if="mode === 'handwritten'" class="parent-signature__editor">
      <div class="parent-signature__box parent-signature__box--active">
        <canvas
          ref="signatureCanvas"
          class="parent-signature__canvas"
          width="640"
          height="240"
          aria-label="Zone de signature manuscrite"
          @mousedown="onDrawStart"
          @mousemove="onDrawMove"
          @mouseup="onDrawEnd"
          @mouseleave="onDrawEnd"
          @touchstart.prevent="onTouchStart"
          @touchmove.prevent="onTouchMove"
          @touchend.prevent="onDrawEnd"
        />
      </div>
      <div class="parent-signature__actions">
        <button type="button" class="parent-signature__link" @click="clearCanvas">Effacer</button>
        <button type="button" class="parent-signature__confirm" @click="confirmHandwritten">
          Valider la signature
        </button>
        <button type="button" class="parent-signature__link" @click="cancelMode">Annuler</button>
      </div>
    </div>

    <div v-else-if="mode === 'upload'" class="parent-signature__editor">
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="hidden"
        @change="onFileSelect"
      />
      <button
        type="button"
        class="parent-signature__box parent-signature__box--upload"
        @click="fileInput?.click()"
      >
        <svg class="h-7 w-7 text-[#216EC2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m17 8-5-5-5 5M12 3v12" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-sm font-semibold text-[#216EC2]">Choisir une image de signature</span>
        <span class="text-xs text-slate-500">PNG, JPG ou WEBP</span>
      </button>
      <div class="parent-signature__actions">
        <button type="button" class="parent-signature__link" @click="cancelMode">Annuler</button>
      </div>
    </div>

    <div v-else class="parent-signature__box parent-signature__box--empty">
      <span class="parent-signature__placeholder">À signer</span>
      <div class="parent-signature__modes">
        <button type="button" class="parent-signature__mode" @click="setMode('handwritten')">
          Signature manuscrite
        </button>
        <button type="button" class="parent-signature__mode" @click="setMode('upload')">
          Importer une image
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mode = defineModel<'handwritten' | 'upload' | ''>('mode', { default: '' });
const signatureDataUrl = defineModel<string>('signatureDataUrl', { default: '' });

const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDrawing = ref(false);
let hasInk = false;

function setMode(next: 'handwritten' | 'upload') {
  mode.value = next;
  if (next === 'handwritten') {
    nextTick(() => initCanvas());
  }
}

function cancelMode() {
  mode.value = '';
  hasInk = false;
  if (fileInput.value) fileInput.value.value = '';
}

function initCanvas() {
  const canvas = signatureCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  hasInk = false;
}

function clearCanvas() {
  initCanvas();
}

function canvasPoint(clientX: number, clientY: number) {
  const canvas = signatureCanvas.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) * canvas.width) / rect.width,
    y: ((clientY - rect.top) * canvas.height) / rect.height,
  };
}

function onDrawStart(e: MouseEvent) {
  const ctx = signatureCanvas.value?.getContext('2d');
  if (!ctx) return;
  isDrawing.value = true;
  const { x, y } = canvasPoint(e.clientX, e.clientY);
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function onDrawMove(e: MouseEvent) {
  if (!isDrawing.value) return;
  const ctx = signatureCanvas.value?.getContext('2d');
  if (!ctx) return;
  const { x, y } = canvasPoint(e.clientX, e.clientY);
  ctx.lineTo(x, y);
  ctx.stroke();
  hasInk = true;
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0];
  if (!touch) return;
  const ctx = signatureCanvas.value?.getContext('2d');
  if (!ctx) return;
  isDrawing.value = true;
  const { x, y } = canvasPoint(touch.clientX, touch.clientY);
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function onTouchMove(e: TouchEvent) {
  if (!isDrawing.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  const ctx = signatureCanvas.value?.getContext('2d');
  if (!ctx) return;
  const { x, y } = canvasPoint(touch.clientX, touch.clientY);
  ctx.lineTo(x, y);
  ctx.stroke();
  hasInk = true;
}

function onDrawEnd() {
  isDrawing.value = false;
}

function confirmHandwritten() {
  const canvas = signatureCanvas.value;
  if (!canvas || !hasInk) return;
  signatureDataUrl.value = canvas.toDataURL('image/png');
  mode.value = 'handwritten';
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const raw = String(reader.result ?? '');
    void compressSignatureDataUrl(raw).then((dataUrl) => {
      signatureDataUrl.value = dataUrl;
      mode.value = 'upload';
    });
  };
  reader.readAsDataURL(file);
}

/** Réduit les photos importées pour éviter « request entity too large ». */
function compressSignatureDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 900;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function clearSignature() {
  signatureDataUrl.value = '';
  mode.value = '';
  hasInk = false;
  if (fileInput.value) fileInput.value.value = '';
  nextTick(() => initCanvas());
}

watch(
  () => mode.value,
  (value) => {
    if (value === 'handwritten' && !signatureDataUrl.value) {
      nextTick(() => initCanvas());
    }
  },
);
</script>

<style scoped>
.parent-signature__label {
  margin-bottom: 0.5rem;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(148 163 184);
}

.parent-signature__box {
  position: relative;
  min-height: 7.5rem;
  border-radius: 0.75rem;
  border: 2px dashed rgb(203 213 225);
  background: rgb(248 250 252);
}

.parent-signature__box--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.25rem 1rem;
}

.parent-signature__box--active,
.parent-signature__box--upload,
.parent-signature__box--filled {
  overflow: hidden;
  border-style: solid;
  border-color: rgb(226 232 240);
  background: #fff;
}

.parent-signature__box--upload {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.parent-signature__box--upload:hover {
  border-color: rgb(33 110 194 / 0.35);
  background: rgb(33 110 194 / 0.04);
}

.parent-signature__placeholder {
  font-size: 0.875rem;
  color: rgb(148 163 184);
}

.parent-signature__modes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.parent-signature__mode {
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
  background: #fff;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(71 85 105);
  transition: border-color 0.15s ease, color 0.15s ease;
}

.parent-signature__mode:hover {
  border-color: rgb(33 110 194 / 0.35);
  color: #216ec2;
}

.parent-signature__canvas {
  display: block;
  height: 120px;
  width: 100%;
  touch-action: none;
  cursor: crosshair;
  background: #fff;
}

.parent-signature__image {
  display: block;
  margin: 0 auto;
  max-height: 6rem;
  max-width: 100%;
  object-fit: contain;
  padding: 1rem;
}

.parent-signature__change {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(226 232 240);
  background: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 11px;
  font-weight: 600;
  color: rgb(71 85 105);
}

.parent-signature__change:hover {
  background: rgb(248 250 252);
}

.parent-signature__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.625rem;
}

.parent-signature__link {
  font-size: 0.75rem;
  font-weight: 600;
  color: #216ec2;
}

.parent-signature__link:hover {
  text-decoration: underline;
}

.parent-signature__confirm {
  border-radius: 0.5rem;
  background: #216ec2;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #fff;
}

.parent-signature__confirm:hover {
  background: #1a5da3;
}
</style>
