<script setup lang="ts">
useHead({
  title: 'Message Sent - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Thank you for contacting the Houston Music Advisory Board. We\'ll get back to you soon.' 
    },
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center bg-space-dark py-24">
    <div class="max-w-lg mx-auto px-6 text-center">
      <!-- Success Icon -->
      <div class="w-24 h-24 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-electric-blue/20">
        <svg class="w-12 h-12 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
      </div>

      <h1 class="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
        Thank You!
      </h1>

      <p class="text-xl text-text-secondary mb-12">
        Your message has been sent successfully. We'll get back to you as soon as possible.
      </p>

      <div class="bg-space-gray rounded-2xl border border-white/10 p-8 mb-12">
        <h2 class="font-display font-semibold text-white mb-4">What happens next?</h2>
        <ul class="text-left text-text-secondary space-y-3">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Our team will review your message
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            You'll receive a response at the email address you provided
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-electric-blue mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            We typically respond within 1-2 business days
          </li>
        </ul>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink 
          to="/"
          class="inline-flex items-center justify-center bg-electric-blue text-space-black font-bold px-8 py-4 rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Back to Home
        </NuxtLink>
        <NuxtLink 
          to="/bulletin-board"
          class="inline-flex items-center justify-center bg-white/10 backdrop-blur text-white font-bold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          View Upcoming Events
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
