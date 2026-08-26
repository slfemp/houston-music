<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Merch' })

const { canEdit, isOfficer } = useBoardUser()
const { data: items, refresh } = await useFetch('/api/merch', { default: () => [] })

const error = ref('')
const busy = ref(false)
async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({
  name: '', description: '', category: 'apparel', price: '', imageUrl: '',
  sizes: '', stockQty: null as number | null, externalUrl: '',
  availableInPerson: true, published: false, sortOrder: 0,
})

function reset() {
  Object.assign(form, {
    name: '', description: '', category: 'apparel', price: '', imageUrl: '',
    sizes: '', stockQty: null, externalUrl: '', availableInPerson: true, published: false, sortOrder: 0,
  })
  editingId.value = null
}

function edit(item: any) {
  editingId.value = item.id
  Object.assign(form, {
    name: item.name, description: item.description, category: item.category,
    price: (item.priceCents / 100).toFixed(2), imageUrl: item.imageUrl ?? '',
    sizes: item.sizes ?? '', stockQty: item.stockQty, externalUrl: item.externalUrl ?? '',
    availableInPerson: item.availableInPerson, published: item.published, sortOrder: item.sortOrder,
  })
  showForm.value = true
}

async function save() {
  await act(async () => {
    const body = {
      ...form,
      imageUrl: form.imageUrl || undefined,
      externalUrl: form.externalUrl || undefined,
      sizes: form.sizes || undefined,
    }
    if (editingId.value) {
      await $fetch(`/api/merch/${editingId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch('/api/merch', { method: 'POST', body })
    }
    reset(); showForm.value = false
  })
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Merch</h1>
        <p class="text-text-secondary text-sm mt-1">Catalogue for the public store. Published items appear at <NuxtLink to="/merch" class="text-electric-blue hover:text-white">/merch</NuxtLink>.</p>
      </div>
      <button v-if="canEdit" class="px-5 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors"
        @click="showForm ? (showForm = false, reset()) : showForm = true">
        {{ showForm ? 'Cancel' : 'Add item' }}
      </button>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <form v-if="showForm" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-8" @submit.prevent="save">
      <h2 class="font-display text-lg font-semibold mb-4">{{ editingId ? 'Edit item' : 'New item' }}</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block"><span class="block text-sm mb-1.5">Name</span>
          <input v-model="form.name" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Category</span>
          <select v-model="form.category" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="c in ['apparel','print','accessory','music','bundle','other']" :key="c" :value="c">{{ humanize(c) }}</option>
          </select></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Description</span>
          <textarea v-model="form.description" required rows="2" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl resize-y" /></label>
        <label class="block"><span class="block text-sm mb-1.5">Price</span>
          <input v-model="form.price" required placeholder="25.00" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Stock <span class="text-text-muted">(blank = untracked)</span></span>
          <input v-model.number="form.stockQty" type="number" min="0" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Sizes <span class="text-text-muted">(comma separated)</span></span>
          <input v-model="form.sizes" placeholder="S, M, L, XL" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Sort order</span>
          <input v-model.number="form.sortOrder" type="number" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Image URL</span>
          <input v-model="form.imageUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Buy link <span class="text-text-muted">(Square, Bandcamp, Shopify…)</span></span>
          <input v-model="form.externalUrl" type="url" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="flex items-center gap-3"><input v-model="form.availableInPerson" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Available at events</span></label>
        <label class="flex items-center gap-3"><input v-model="form.published" type="checkbox" class="w-4 h-4 accent-electric-blue"><span class="text-sm">Publish to the store</span></label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">
        {{ editingId ? 'Save changes' : 'Add item' }}
      </button>
    </form>

    <div v-if="(items as any[]).length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in (items as any[])" :key="item.id" class="bg-space-gray rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        <div v-if="item.imageUrl" class="aspect-square bg-space-dark overflow-hidden">
          <img :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover">
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="font-semibold">{{ item.name }}</h3>
            <span class="font-bold text-electric-blue shrink-0">{{ item.priceFormatted }}</span>
          </div>
          <p class="text-sm text-text-secondary flex-1">{{ item.description }}</p>
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span class="px-2 py-0.5 rounded text-[11px] bg-white/5 text-text-secondary capitalize">{{ humanize(item.category) }}</span>
            <span class="px-2 py-0.5 rounded text-[11px]" :class="item.published ? 'bg-electric-blue/15 text-electric-blue' : 'bg-white/5 text-text-muted'">
              {{ item.published ? 'Published' : 'Draft' }}
            </span>
            <span v-if="item.soldOut" class="px-2 py-0.5 rounded text-[11px] bg-neon-pink/15 text-neon-pink">Sold out</span>
            <span v-else-if="item.stockQty !== null" class="px-2 py-0.5 rounded text-[11px] bg-white/5 text-text-secondary">{{ item.stockQty }} in stock</span>
          </div>
          <div v-if="canEdit" class="flex gap-2 mt-4 pt-4 border-t border-white/5">
            <button class="text-xs text-electric-blue hover:text-white transition-colors" @click="edit(item)">Edit</button>
            <button :disabled="busy" class="text-xs text-text-secondary hover:text-white transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/merch/${item.id}`, { method: 'PATCH', body: { published: !item.published } }))">
              {{ item.published ? 'Unpublish' : 'Publish' }}
            </button>
            <button v-if="isOfficer" :disabled="busy" class="ml-auto text-xs text-text-muted hover:text-neon-pink transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/merch/${item.id}`, { method: 'DELETE' }))">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="py-12 text-center text-text-muted">No merch items yet.</p>
  </div>
</template>
