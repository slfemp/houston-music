<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'HMAB Admin — Contacts' })

interface Contact { nodeId: string; name: string; type: string; emails: string[]; phones: string[]; notes?: string }
const { data, refresh } = await useFetch<{ contacts: Contact[] }>('/api/admin/contacts')
const { data: graph } = await useFetch<{ nodes: { id: string; name: string; type: string }[] }>('/api/admin/graph')

const search = ref('')
const busy = ref(false)
const errorMsg = ref('')

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

const editorOpen = ref(false)
const editor = reactive({ isNew: true, nodeId: '', nodeName: '', emails: '', phones: '', notes: '' })

function openNew() {
  Object.assign(editor, { isNew: true, nodeId: '', nodeName: '', emails: '', phones: '', notes: '' })
  editorOpen.value = true
}
function openEdit(c: Contact) {
  Object.assign(editor, { isNew: false, nodeId: c.nodeId, nodeName: c.name, emails: c.emails.join('\n'), phones: c.phones.join('\n'), notes: c.notes || '' })
  editorOpen.value = true
}

async function call(fn: () => Promise<unknown>) {
  errorMsg.value = ''
  busy.value = true
  try { await fn(); await refresh() } catch (e: any) { errorMsg.value = e?.data?.statusMessage || 'Request failed.' } finally { busy.value = false }
}

async function save() {
  let nodeId = editor.nodeId
  if (editor.isNew) {
    const match = (graph.value?.nodes || []).find((n) => n.name === editor.nodeName)
    if (!match) { errorMsg.value = 'Pick a person or org from the list — contacts attach to a network node.'; return }
    nodeId = match.id
  }
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
  await call(() => $fetch('/api/admin/contacts', { method: 'POST', body: { nodeId, emails: lines(editor.emails), phones: lines(editor.phones), notes: editor.notes.trim() } }))
  if (!errorMsg.value) editorOpen.value = false
}

async function remove(c: Contact) {
  if (!confirm(`Delete contact info for "${c.name}"? (The network node stays.)`)) return
  await call(() => $fetch(`/api/admin/contacts/${c.nodeId}`, { method: 'DELETE' }))
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-2xl font-bold">Contacts</h1>
      <span class="text-xs text-neon-pink uppercase tracking-wider">Private — board eyes only</span>
    </div>
    <p class="text-sm text-text-muted mb-6">The board's working directory. This data never appears on the public site.</p>

    <div class="flex gap-3 mb-6">
      <input
        v-model="search" type="search" placeholder="Search name, email, notes…"
        class="w-full max-w-md bg-space-gray border border-white/15 rounded-lg px-4 py-2.5 text-sm placeholder:text-text-muted focus:border-electric-blue"
      >
      <button class="px-4 py-2.5 bg-electric-blue text-space-black font-bold rounded-lg text-sm hover:bg-white transition" @click="openNew">+ Add contact</button>
    </div>
    <p v-if="errorMsg" class="text-neon-pink text-sm mb-4">{{ errorMsg }}</p>

    <div class="overflow-x-auto border border-white/10 rounded-xl">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs uppercase tracking-wider text-text-muted border-b border-white/10">
            <th class="px-4 py-3">Name</th>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Phone</th>
            <th class="px-4 py-3">Notes</th>
            <th class="px-4 py-3 text-right">Actions</th>
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
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <button class="text-xs px-2.5 py-1 bg-white/10 rounded-full hover:bg-white/20 transition mr-2" :disabled="busy" @click="openEdit(c)">Edit</button>
              <button class="text-xs px-2.5 py-1 bg-neon-pink/15 text-neon-pink rounded-full hover:bg-neon-pink hover:text-white transition" :disabled="busy" @click="remove(c)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editor modal -->
    <div v-if="editorOpen" class="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-10" @click.self="editorOpen = false">
      <div class="bg-space-gray border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4">
        <h2 class="text-lg font-bold">{{ editor.isNew ? 'Add contact' : `Edit: ${editor.nodeName}` }}</h2>
        <label v-if="editor.isNew" class="block text-xs uppercase tracking-wider text-text-muted">Who (pick from the network)
          <input v-model="editor.nodeName" list="contact-nodes" placeholder="Start typing a name…" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white focus:border-electric-blue">
          <datalist id="contact-nodes">
            <option v-for="n in (graph?.nodes || [])" :key="n.id" :value="n.name" />
          </datalist>
          <span class="normal-case tracking-normal text-text-muted">Not in the network yet? Add them on the Network page first.</span>
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Emails (one per line)
          <textarea v-model="editor.emails" rows="2" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white focus:border-electric-blue" />
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Phones (one per line)
          <textarea v-model="editor.phones" rows="2" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white" />
        </label>
        <label class="block text-xs uppercase tracking-wider text-text-muted">Notes
          <textarea v-model="editor.notes" rows="3" class="mt-1 w-full bg-space-black border border-white/15 rounded px-3 py-2 text-sm text-white" />
        </label>
        <div class="flex justify-end gap-3 pt-2">
          <button class="px-4 py-2 text-sm text-text-secondary hover:text-white transition" @click="editorOpen = false">Cancel</button>
          <button class="px-5 py-2 bg-electric-blue text-space-black text-sm font-bold rounded-lg hover:bg-white transition disabled:opacity-50" :disabled="busy" @click="save">{{ busy ? 'Saving…' : 'Save' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
