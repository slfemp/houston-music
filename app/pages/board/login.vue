<script setup lang="ts">
useHead({ title: 'HMAB Console — Sign In' })

// Already signed in? Straight to the console.
const { data: me } = await useFetch('/api/auth/me')
watchEffect(() => {
  if (me.value?.boardUser) navigateTo((useRoute().query.redirect as string) || '/board')
})

const email = ref('')
const sent = ref(false)
const devLink = ref('')
const error = ref('')
const busy = ref(false)

async function requestLink() {
  error.value = ''
  busy.value = true
  try {
    const res = await $fetch<{ ok: boolean; link?: string }>('/api/auth/magic-link', {
      method: 'POST',
      body: { email: email.value },
    })
    sent.value = true
    if (res.link) devLink.value = res.link
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Something went wrong.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-space-black text-white flex items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-2xl font-bold tracking-wide font-display">HMAB <span class="text-electric-blue">Console</span></div>
        <p class="text-sm text-text-muted mt-2">Board operations + Houston music intelligence</p>
      </div>

      <div v-if="!sent" class="bg-space-gray rounded-2xl p-6 border border-white/10">
        <label class="block text-xs uppercase tracking-wider text-text-muted mb-2">Board email</label>
        <input
          v-model="email" type="email" placeholder="you@example.com" autocomplete="email"
          class="w-full bg-space-black border border-white/15 rounded-lg px-4 py-3 text-sm placeholder:text-text-muted focus:border-electric-blue"
          @keyup.enter="requestLink"
        >
        <button
          class="w-full mt-4 bg-electric-blue text-space-black font-bold rounded-lg py-3 text-sm hover:bg-white transition disabled:opacity-50"
          :disabled="busy || !email.includes('@')" @click="requestLink"
        >
          {{ busy ? 'Sending…' : 'Email me a sign-in link' }}
        </button>
        <p v-if="error" class="text-neon-pink text-xs mt-3">{{ error }}</p>
      </div>

      <div v-else class="bg-space-gray rounded-2xl p-6 border border-white/10 text-center">
        <p class="text-sm">If that address is on the board, a sign-in link is on its way from noreply@houstonmusicadvisoryboard.com. It expires in 15 minutes.</p>
        <a v-if="devLink" :href="devLink" class="inline-block mt-4 text-electric-blue text-sm underline">Dev sign-in link</a>
      </div>
    </div>
  </div>
</template>
