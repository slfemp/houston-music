<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Board Sign In — Houston Music Advisory Board' })

const route = useRoute()
const { fetch: refreshSession } = useUserSession()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    await navigateTo((route.query.redirect as string) || '/board')
  } catch (err) {
    error.value = apiError(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-space-black text-white flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-6">
        <NuxtLink to="/" class="inline-block font-display font-bold text-2xl mb-2">
          HMAB <span class="text-electric-blue">Console</span>
        </NuxtLink>
        <p class="text-text-secondary text-sm">Board members and staff only</p>
      </div>

      <form class="bg-space-gray rounded-2xl border border-white/10 p-6 shadow-2xl shadow-black/50" @submit.prevent="submit">
        <div v-if="error" class="mb-4 px-3.5 py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">
          {{ error }}
        </div>

        <label class="block mb-4">
          <span class="block text-sm font-medium mb-2">Email or username</span>
          <input
            v-model="email" type="text" required autocomplete="username" autofocus
            class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-text-muted focus:outline-hidden focus:border-electric-blue focus:bg-white/10 transition-all"
            placeholder="you@example.com"
          >
        </label>

        <label class="block mb-5">
          <span class="block text-sm font-medium mb-2">Password</span>
          <input
            v-model="password" type="password" required autocomplete="current-password"
            class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-text-muted focus:outline-hidden focus:border-electric-blue focus:bg-white/10 transition-all"
            placeholder="••••••••••••"
          >
        </label>

        <button
          type="submit" :disabled="busy"
          class="w-full bg-electric-blue text-space-black font-bold px-6 py-2.5 text-sm rounded-full hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-space-gray transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="text-center text-xs text-text-muted mt-6">
        Trouble signing in? Contact the board secretary.
      </p>
    </div>
  </div>
</template>
