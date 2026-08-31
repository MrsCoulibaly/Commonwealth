<template>
  <div class="min-h-screen bg-slate-100">
    <div
      v-show="menuOpen"
      class="fixed inset-0 z-40 bg-slate-900/40 xl:hidden"
      aria-hidden="true"
      @click="menuOpen = false"
    />
    <!-- Mobile & tablette : menu tiroir ; à partir de xl : barre latérale fixe -->
    <AdminSidebar
      class="fixed bottom-0 left-0 top-0 z-50 flex w-[260px] max-w-[260px] -translate-x-full flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm transition-transform duration-200 xl:translate-x-0"
      :class="{ 'translate-x-0': menuOpen }"
    />
    <div class="flex min-h-screen min-w-0 flex-col xl:ml-[260px]">
      <AdminTopBar />
      <main class="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const menuOpen = useState('admin_menu_open', () => false)
const route = useRoute()

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

watch(
  () => route.path,
  () => {
    menuOpen.value = false
  }
)
</script>
