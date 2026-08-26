<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'HMAB Admin — Contacts' })

interface Contact { nodeId: string; name: string; type: string; emails: string[]; phones: string[]; notes?: string }
const { data } = await useFetch<{ contacts: Contact[] }>('/api/admin/contacts')

const search = ref('')
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = data.value?.contacts || []
  if (!q) return list
  return list.filter((c) =>
    c.name.toLowerCase().includes(q) ||
    c.emails.some((e) => e.toLowerCase().includes(q)) ||
    (c.notes || '').toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-2xl font-bold">Contacts</h1>
      <span class="text-xs text-neon-pink uppercase tracking-wider">Private — board eyes only</span>
    </div>
    <p class="text-sm text-text-muted mb-6">The board's working directory. This data never appears on the public site.</p>

    <input
      v-model="search" type="search" placeholder="Search name, email, notes…"
      class="w-full max-w-md bg-space-gray border border-white/15 rounded-lg px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-electric-blue mb-6"
    >

    <div class="overflow-x-auto border border-white/10 rounded-xl">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-text-muted border-b border-white/10">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.nodeId" class="border-b border-white/5 hover:bg-white/5">
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ c.name }}</td>
            <td class="px-4 py-3">
              <div v-for="e in c.emails" :key="e"><a :href="`mailto:${e}`" class="text-electric-blue hover:underline">{{ e }}</a></div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-text-secondary">
              <div v-for="p in c.phones" :key="p">{{ p }}</div>
            </td>
            <td class="px-4 py-3 text-text-muted text-xs max-w-sm">{{ c.notes }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
