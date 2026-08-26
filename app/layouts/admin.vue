<script setup lang="ts">
const { data: me } = await useFetch('/api/auth/me')
const route = useRoute()

// Not signed in → bounce to the login page (which uses this layout too).
watchEffect(() => {
  if (!me.value?.admin && route.path !== '/admin') {
    navigateTo('/admin')
  }
})

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  navigateTo('/admin')
}

const nav = [
  { to: '/admin/network', label: 'Network', icon: '◉' },
  { to: '/admin/map', label: 'Map', icon: '⌖' },
  { to: '/admin/contacts', label: 'Contacts', icon: '@' },
]
</script>

<template>
  <div class="min-h-screen bg-space-black text-white flex">
    <aside v-if="me?.admin" class="w-56 shrink-0 border-r border-white/10 flex flex-col">
      <NuxtLink to="/admin/network" class="px-5 py-5 border-b border-white/10 block">
        <div class="font-bold tracking-wide">HMAB <span class="text-electric-blue">ADMIN</span></div>
        <div class="text-xs text-text-muted mt-1">Houston Music Intelligence</div>
      </NuxtLink>
      <nav class="flex-1 py-4">
        <NuxtLink
          v-for="item in nav" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition"
          active-class="!text-electric-blue bg-white/5 border-r-2 border-electric-blue"
        >
          <span class="w-4 text-center">{{ item.icon }}</span>{{ item.label }}
        </NuxtLink>
        <div class="px-5 py-2.5 text-sm text-text-muted flex items-center gap-3 cursor-default">
          <span class="w-4 text-center">▤</span>Meetings <span class="text-[10px] uppercase tracking-wider bg-white/10 rounded px-1.5 py-0.5">soon</span>
        </div>
      </nav>
      <div class="px-5 py-4 border-t border-white/10 text-xs">
        <div class="text-text-secondary truncate">{{ me.admin.name }}</div>
        <button class="text-text-muted hover:text-neon-pink mt-1 transition" @click="logout">Sign out</button>
      </div>
    </aside>
    <main class="flex-1 min-w-0 overflow-x-hidden">
      <slot />
    </main>
  </div>
</template>
