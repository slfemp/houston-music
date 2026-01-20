<script setup lang="ts">
useHead({
  title: 'Music Directory - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Find and connect with Houston musicians, music industry professionals, and support services. Register your music talent or business in the Houston Music Directory.' 
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Houston Music Directory"
      subtitle="Connect with local musicians, industry professionals, and support services"
    />

    <!-- Introduction -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="text-center mb-12">
          <p class="text-lg text-text-secondary leading-relaxed mb-6">
            Houston's music scene is as rich and culturally diverse as the City's nationwide top standing. But new musicians continue to redefine what Houston music sounds like. And folks beyond our city limits should be discovering those new sounds.
          </p>
          <p class="text-lg text-text-secondary leading-relaxed">
            You can now find local creatives, musicians, music industry professionals and support services. So, we invite all Houston musicians and music industry pros to create listings (see below).
          </p>
        </div>

        <!-- Photo Gallery Placeholder -->
        <div class="grid md:grid-cols-2 gap-6 mb-12">
          <div class="aspect-[4/3] bg-gradient-to-br from-electric-blue/20 to-electric-purple/20 rounded-2xl border border-white/10 flex items-center justify-center">
            <div class="text-center text-white/50">
              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm7 12l5-4-5-4v8zm-3-8l-3 4 3 4V9z"/>
              </svg>
              <p class="mt-2 text-sm">Photo by Marco Torres</p>
            </div>
          </div>
          <div class="aspect-[4/3] bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 rounded-2xl border border-white/10 flex items-center justify-center">
            <div class="text-center text-white/50">
              <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm7 12l5-4-5-4v8zm-3-8l-3 4 3 4V9z"/>
              </svg>
              <p class="mt-2 text-sm">@MarcoFromHouston</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Directory Listing -->
    <section class="py-24 bg-space-black">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="CREATE DIRECTORY LISTING" 
          centered 
        />

        <div class="text-center mb-12">
          <p class="text-lg text-text-secondary leading-relaxed mb-6">
            Musicians and music businesses can now register to create a new listing. The Houston Music Directory is designed to market the creative music industries across Houston area.
          </p>
          <p class="text-text-secondary mb-8">
            The free registration process takes about 10 minutes. The system provides a step-by-step guide to set up a simple profile. Read the 
            <a 
              href="#guidelines" 
              class="text-electric-blue font-semibold hover:text-white transition-colors"
            >
              Music Directory Guidelines
            </a> 
            or click the buttons below to get started.
          </p>
        </div>

        <!-- Registration Buttons -->
        <div class="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
          <a 
            href="https://houston.reel-scout.com/crew_registration.aspx?&cl=M&type=M&g=MOCA"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-space-gray rounded-2xl border border-white/10 p-8 text-center hover:border-electric-purple/50 transition-all group"
          >
            <div class="w-16 h-16 bg-electric-purple/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-electric-purple/20 group-hover:scale-110 transition-transform duration-200">
              <svg class="w-8 h-8 text-electric-purple" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-2 group-hover:text-electric-purple transition-colors">
              Music Talent Register
            </h3>
            <p class="text-text-secondary text-sm mb-4">
              For musicians, artists, and performers
            </p>
            <span class="inline-flex items-center text-electric-blue font-medium">
              Register Now
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </span>
          </a>

          <a 
            href="https://houston.reel-scout.com/crew_registration.aspx?cl=M&type=B&g=MOCA"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-space-gray rounded-2xl border border-white/10 p-8 text-center hover:border-electric-blue/50 transition-all group"
          >
            <div class="w-16 h-16 bg-electric-blue/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-electric-blue/20 group-hover:scale-110 transition-transform duration-200">
              <svg class="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-2 group-hover:text-electric-blue transition-colors">
              Music Business Register
            </h3>
            <p class="text-text-secondary text-sm mb-4">
              For venues, studios, and music companies
            </p>
            <span class="inline-flex items-center text-electric-blue font-medium">
              Register Now
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- Search Directory -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <SectionHeading 
          title="SEARCH THE DIRECTORY" 
          subtitle="Find local creatives, musicians, music industry professionals and support services"
          centered 
        />

        <p class="text-text-secondary mb-8">
          The Directory is also a searchable database. It's a great way to find local creatives, musicians, music industry professionals and support services. Customize a search by category, name, or company starting here:
        </p>

        <a 
          href="https://houston.reel-scout.com/crew_login.aspx?g=MOCA&cl=M"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
        >
          Search Directory
        </a>
      </div>
    </section>

    <!-- Disclaimer -->
    <section class="py-12 bg-space-black">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="bg-space-gray rounded-2xl border border-white/10 p-8">
          <h3 class="font-semibold text-white mb-4 flex items-center">
            <svg class="w-5 h-5 text-gold-accent mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            Disclaimer
          </h3>
          <p class="text-text-secondary text-sm leading-relaxed mb-4">
            Please note: The Houston Music Directory is a database filled by local musicians, industry professionals and vendors. Every effort is made to verify and ensure the accuracy of the information provided by those who have listed. The Mayor's Office of Cultural Affairs (MOCA) assumes no liability for any actions taken or responsibility for any fraud perpetrated by any individual or vendor.
          </p>
          <p class="text-text-secondary text-sm leading-relaxed">
            Please use this directory as a reference tool, not as an endorsement by the Mayor's Office of Cultural Affairs. Submit corrections and omissions through the 
            <NuxtLink to="/contact" class="text-electric-blue font-semibold hover:text-white transition-colors">
              Contact Form
            </NuxtLink>.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-space-dark border-t border-white/10">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 class="font-display text-4xl font-bold text-white mb-6 tracking-tight">
          Ready to Join Houston's Music Community?
        </h2>
        <p class="text-text-secondary text-xl mb-12">
          Register today and connect with fellow musicians, venues, and industry professionals.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://houston.reel-scout.com/crew_registration.aspx?&cl=M&type=M&g=MOCA"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-gold-accent text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            Register as Musician
          </a>
          <a 
            href="https://houston.reel-scout.com/crew_registration.aspx?cl=M&type=B&g=MOCA"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Register as Business
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
