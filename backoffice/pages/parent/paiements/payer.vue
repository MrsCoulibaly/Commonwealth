<template>
  <div>
    <h1 class="mb-1 text-3xl font-bold text-brandBlue">Paiements</h1>
    <p class="mb-6 text-sm text-slate-500">Yorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

    <ParentPayTuitionInline @completed="onCompleted" @close="goBack" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'parent',
  middleware: ['parent'],
});

function goBack() {
  void navigateTo('/parent/paiements');
}

function onCompleted() {
  void navigateTo('/parent/paiements');
}
</script>
