<script setup lang="ts">
useHead({
  title: 'Donate - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Support Houston\'s music community by donating to the Houston Music Advisory Board. Your contribution helps advance local music industry development.' 
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Support Houston Music"
      subtitle="Your donation helps advance our music community"
    />

    <!-- Main Donate Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="text-center">
          <!-- Donate Icon -->
          <div class="w-24 h-24 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-gold-accent/20">
            <svg class="w-12 h-12 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>

          <h2 class="font-display text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            Make a Donation Today!
          </h2>

          <div class="space-y-6 text-text-secondary mb-12">
            <p class="text-xl leading-relaxed">
              The Houston Music Advisory Board creates opportunities and fosters the economic 
              development of our music industry.
            </p>
            <p class="text-lg leading-relaxed">
              To advance our music community, activities will be developed that shape event 
              programming and workshops. Your generous contribution helps make this possible.
            </p>
          </div>

          <!-- Donate Button -->
          <a 
            href="https://Simplecheckout.authorize.net/payment/CatalogPayment.aspx"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center bg-gold-accent hover:bg-white text-space-black font-bold text-xl px-12 py-5 rounded-full transition-all duration-300 hover:scale-105"
          >
            <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            DONATE NOW
          </a>

          <p class="mt-6 text-sm text-text-muted">
            Secure payment processing powered by Authorize.net
          </p>
        </div>
      </div>
    </section>

    <!-- Impact Section -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="YOUR IMPACT" 
          subtitle="How your donation helps Houston's music community"
          centered 
        />

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-space-gray rounded-2xl border border-white/10 p-8 text-center hover:border-electric-blue/50 transition-all">
            <div class="w-16 h-16 bg-electric-blue/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-electric-blue/20">
              <svg class="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-4">
              Community Events
            </h3>
            <p class="text-text-secondary">
              Fund public listening sessions, workshops, and networking events that bring 
              Houston's music community together.
            </p>
          </div>

          <div class="bg-space-gray rounded-2xl border border-white/10 p-8 text-center hover:border-electric-purple/50 transition-all">
            <div class="w-16 h-16 bg-electric-purple/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-electric-purple/20">
              <svg class="w-8 h-8 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-4">
              Education & Workshops
            </h3>
            <p class="text-text-secondary">
              Support educational programs that help local musicians develop their craft 
              and grow their careers.
            </p>
          </div>

          <div class="bg-space-gray rounded-2xl border border-white/10 p-8 text-center hover:border-gold-accent/50 transition-all">
            <div class="w-16 h-16 bg-gold-accent/10 rounded-xl flex items-center justify-center mx-auto mb-6 border border-gold-accent/20">
              <svg class="w-8 h-8 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-4">
              Industry Development
            </h3>
            <p class="text-text-secondary">
              Invest in programs that strengthen Houston's music industry infrastructure 
              and create economic opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Other Ways to Help -->
    <section class="py-24 bg-space-dark border-t border-white/10">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 class="font-display text-4xl font-bold text-white mb-6 tracking-tight">
          Other Ways to Support
        </h2>
        <p class="text-text-secondary text-xl mb-12">
          There are many ways to get involved with the Houston Music Advisory Board
        </p>
        <div class="grid sm:grid-cols-3 gap-6">
          <NuxtLink 
            to="/contact" 
            class="bg-space-gray rounded-2xl border border-white/10 p-8 hover:border-electric-purple/50 transition-all group"
          >
            <svg class="w-12 h-12 text-electric-purple mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h3 class="font-display font-bold text-white mb-2 group-hover:text-electric-purple transition-colors">Volunteer</h3>
            <p class="text-text-secondary text-sm">Help at community events</p>
          </NuxtLink>

          <NuxtLink 
            to="/bulletin-board" 
            class="bg-space-gray rounded-2xl border border-white/10 p-8 hover:border-electric-blue/50 transition-all group"
          >
            <svg class="w-12 h-12 text-electric-blue mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <h3 class="font-display font-bold text-white mb-2 group-hover:text-electric-blue transition-colors">Attend Events</h3>
            <p class="text-text-secondary text-sm">Join our public meetings</p>
          </NuxtLink>

          <NuxtLink 
            to="/music-directory" 
            class="bg-space-gray rounded-2xl border border-white/10 p-8 hover:border-gold-accent/50 transition-all group"
          >
            <svg class="w-12 h-12 text-gold-accent mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <h3 class="font-display font-bold text-white mb-2 group-hover:text-gold-accent transition-colors">Join Directory</h3>
            <p class="text-text-secondary text-sm">Register as a musician</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
