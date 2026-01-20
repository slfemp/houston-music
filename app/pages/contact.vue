<script setup lang="ts">
useHead({
  title: 'Contact - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Contact the Houston Music Advisory Board. Have questions about Houston\'s music community? We want to hear from you.' 
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Contact Us"
      subtitle="We want to hear from you"
    />

    <!-- Contact Form Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <!-- Form -->
          <div>
            <div class="bg-space-gray rounded-2xl border border-white/10 p-8">
              <div class="mb-8 text-center lg:text-left">
                <div class="w-20 h-20 bg-gradient-to-br from-electric-blue/20 to-electric-purple/20 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 border border-white/10">
                  <svg class="w-10 h-10 text-electric-blue" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <p class="text-text-secondary">
                  Thanks for your interest in the <strong class="text-electric-blue">Houston Music Advisory Board</strong>.
                </p>
                <p class="text-text-secondary mt-2">
                  If you have any questions or concerns about our music community, or just want to get involved, 
                  please leave your contact info and a short message below.
                </p>
              </div>

              <!-- Netlify Form -->
              <form 
                name="contact" 
                method="POST" 
                data-netlify="true"
                netlify-honeypot="bot-field"
                action="/success"
                class="space-y-6"
              >
                <!-- Hidden fields for Netlify -->
                <input type="hidden" name="form-name" value="contact" />
                <p class="hidden">
                  <label>
                    Don't fill this out if you're human: <input name="bot-field" />
                  </label>
                </p>

                <!-- Name -->
                <div>
                  <label for="name" class="block text-sm font-medium text-white mb-2">
                    Name (First and Last) <span class="text-neon-pink">*</span>
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    autocomplete="name"
                    class="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-electric-blue focus:bg-white/10 transition-all"
                    placeholder="Your full name"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-white mb-2">
                    Email <span class="text-neon-pink">*</span>
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    autocomplete="email"
                    class="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-electric-blue focus:bg-white/10 transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label for="phone" class="block text-sm font-medium text-white mb-2">
                    Phone <span class="text-text-muted">(optional)</span>
                  </label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    autocomplete="tel"
                    class="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-electric-blue focus:bg-white/10 transition-all"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <!-- Message -->
                <div>
                  <label for="message" class="block text-sm font-medium text-white mb-2">
                    Message <span class="text-neon-pink">*</span>
                  </label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="5" 
                    required
                    class="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-electric-blue focus:bg-white/10 transition-all resize-y"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit"
                  class="w-full bg-electric-blue text-space-black font-bold px-8 py-4 rounded-full hover:bg-white focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 focus:ring-offset-space-black transition-all duration-300 hover:scale-105 flex items-center justify-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Contact Us
                </button>
              </form>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="lg:pl-8">
            <h2 class="font-display text-3xl font-bold text-white mb-8 tracking-tight">
              Get in Touch
            </h2>

            <div class="space-y-8">
              <!-- MOCA -->
              <div class="flex items-start">
                <div class="w-12 h-12 bg-electric-blue/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-electric-blue/20">
                  <svg class="w-6 h-6 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-white">Mayor's Office of Cultural Affairs</h3>
                  <p class="text-text-secondary mt-1">
                    The Houston Music Advisory Board operates under MOCA.
                  </p>
                  <a 
                    href="https://www.houstontx.gov/moca/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-electric-blue font-medium hover:text-white transition-colors mt-2 inline-block"
                  >
                    Visit MOCA Website →
                  </a>
                </div>
              </div>

              <!-- Location -->
              <div class="flex items-start">
                <div class="w-12 h-12 bg-electric-purple/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-electric-purple/20">
                  <svg class="w-6 h-6 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-white">Houston, Texas</h3>
                  <p class="text-text-secondary mt-1">
                    Serving the Greater Houston metropolitan area and surrounding communities.
                  </p>
                </div>
              </div>

              <!-- Events -->
              <div class="flex items-start">
                <div class="w-12 h-12 bg-gold-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gold-accent/20">
                  <svg class="w-6 h-6 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div class="ml-4">
                  <h3 class="font-semibold text-white">Public Meetings</h3>
                  <p class="text-text-secondary mt-1">
                    Join us at our regular public meetings to share your thoughts and ideas.
                  </p>
                  <NuxtLink 
                    to="/bulletin-board"
                    class="text-electric-blue font-medium hover:text-white transition-colors mt-2 inline-block"
                  >
                    View Upcoming Events →
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Quick Links -->
            <div class="mt-12 bg-space-gray rounded-2xl border border-white/10 p-6">
              <h3 class="font-semibold text-white mb-4">Quick Links</h3>
              <div class="grid grid-cols-2 gap-4">
                <a 
                  href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center text-text-secondary hover:text-electric-blue transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  RSVP for Events
                </a>
                <NuxtLink 
                  to="/music-directory"
                  class="flex items-center text-text-secondary hover:text-electric-blue transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  Music Directory
                </NuxtLink>
                <NuxtLink 
                  to="/donate"
                  class="flex items-center text-text-secondary hover:text-electric-blue transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  Make a Donation
                </NuxtLink>
                <NuxtLink 
                  to="/about"
                  class="flex items-center text-text-secondary hover:text-electric-blue transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                  About HMAB
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
