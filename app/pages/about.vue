<script setup lang="ts">
import { boardMembers, musicOfficer } from '~/data/boardMembers'

useHead({
  title: 'About - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Learn about the Houston Music Advisory Board, our mission, and meet our board members dedicated to advancing Houston\'s music industry.' 
    }
  ]
})

// Video placeholder
const inauguralVideoId = 'YOUR_VIDEO_ID'
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-space-black py-24 md:py-32">
      <div class="absolute inset-0 bg-gradient-to-br from-electric-purple/10 via-space-black to-electric-blue/5"></div>
      <div class="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              About the Houston Music Advisory Board
            </h1>
            <p class="text-xl text-text-secondary leading-relaxed">
              Appointed by the Mayor and approved by City Council, representing the diversity, interests, and expertise of Houston's music community.
            </p>
          </div>
          <div class="relative">
            <div class="aspect-[4/3] bg-space-gray rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <div class="text-center p-8">
                <svg class="w-20 h-20 mx-auto text-white/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <p class="mt-4 text-text-muted text-sm">2022 Inaugural Board Members</p>
              </div>
            </div>
            <p class="text-text-muted text-sm mt-3 text-center">
              (l-r) Lupe Olivares, Dr. Anne Lundy, Chair Jason Woods, Ericka De Leon, Jason Kane, Henry (G-Dash) Guidry, Tracy DeJarnett, Music Officer Gracie Chavez, Vice-Chair Mark Austin, Jagi Kaital, Eric Jimenez. <em>Photo by Marco Torres</em>
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="space-y-6 text-text-secondary text-lg leading-relaxed">
          <p>
            With such significance to who Houston is, the 
            <strong class="text-electric-blue">Mayor's Office of Cultural Affairs</strong> (MOCA) 
            recognized the need to establish an advisory board to impact and influence the City's work. 
            In 2022, a city ordinance (No. 2022-694) was unanimously adopted to establish the 
            <strong class="text-electric-blue">Houston Music Advisory Board</strong> (HMAB).
          </p>
          <p>
            Appointed by the Mayor and approved by City Council, the board represents the diversity, 
            interests, and expertise of Houston's music community. The board is made up of nine (9) 
            action-oriented members.
          </p>
        </div>
      </div>
    </section>

    <!-- Board Members Section -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="BOARD MEMBERS" 
          subtitle="The following music industry stakeholders are appointed to the current Music Board"
          centered 
        />

        <!-- Officers -->
        <div class="mb-16">
          <h3 class="font-display font-semibold text-xl text-center text-electric-blue mb-8 tracking-wider uppercase">
            Board Officers
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              v-for="officer in boardMembers.officers" 
              :key="officer.name"
              class="bg-space-gray rounded-2xl border border-white/10 p-6 text-center hover:border-electric-blue/50 transition-all"
            >
              <div class="w-20 h-20 bg-gradient-to-br from-electric-blue/20 to-electric-purple/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/10">
                <span class="text-2xl font-bold text-white">
                  {{ officer.name.split(' ').map(n => n[0]).join('') }}
                </span>
              </div>
              <span class="inline-block px-3 py-1 bg-gold-accent/10 text-gold-accent text-xs font-semibold rounded-full mb-2 border border-gold-accent/20">
                {{ officer.position }}
              </span>
              <h4 class="font-semibold text-white">{{ officer.name }}</h4>
              <p v-if="officer.title" class="text-sm text-text-muted italic">{{ officer.title }}</p>
              <p class="text-sm text-text-secondary">{{ officer.organization }}</p>
            </div>
          </div>
        </div>

        <!-- Members -->
        <div class="mb-16">
          <h3 class="font-display font-semibold text-xl text-center text-electric-purple mb-8 tracking-wider uppercase">
            Members
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div 
              v-for="member in boardMembers.members" 
              :key="member.name"
              class="bg-space-gray rounded-2xl border border-white/10 p-6 text-center hover:border-electric-purple/50 transition-all"
            >
              <div class="w-16 h-16 bg-gradient-to-br from-electric-purple/20 to-neon-pink/20 rounded-full mx-auto mb-4 flex items-center justify-center border border-white/10">
                <span class="text-xl font-bold text-white">
                  {{ member.name === '(Vacant)' ? '?' : member.name.split(' ').map(n => n[0]).join('') }}
                </span>
              </div>
              <h4 class="font-semibold text-white text-sm">{{ member.name }}</h4>
              <p v-if="member.organization" class="text-xs text-text-secondary mt-1">{{ member.organization }}</p>
            </div>
          </div>
        </div>

        <!-- Alternates -->
        <div class="mb-16">
          <h3 class="font-display font-semibold text-lg text-center text-text-secondary mb-6 tracking-wider uppercase">
            Alternates
          </h3>
          <div class="flex flex-wrap justify-center gap-4">
            <span 
              v-for="alt in boardMembers.alternates" 
              :key="alt.name"
              class="px-4 py-2 bg-space-gray rounded-full border border-white/10 text-sm text-text-secondary"
            >
              {{ alt.name }}
            </span>
          </div>
        </div>

        <!-- Alumni -->
        <div class="bg-space-gray rounded-2xl border border-white/10 p-8">
          <h3 class="font-display font-semibold text-xl text-center text-neon-pink mb-8 tracking-wider uppercase">
            Alumni
          </h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div 
              v-for="alum in boardMembers.alumni" 
              :key="alum.name"
              class="text-center p-4 bg-space-black/50 rounded-xl border border-white/5"
            >
              <h4 class="font-medium text-white text-sm">{{ alum.name }}</h4>
              <p v-if="alum.years" class="text-xs text-text-muted">{{ alum.years }}</p>
              <p v-if="alum.position" class="text-xs text-electric-purple">{{ alum.position }}</p>
              <p class="text-xs text-text-secondary mt-1">{{ alum.organization }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Music Officer Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div class="order-2 lg:order-1">
            <SectionHeading title="MUSIC OFFICER" />
            
            <div class="space-y-6 text-text-secondary text-lg leading-relaxed">
              <p>
                To achieve this work of advancing Houston's music industry and support cultural tourism, 
                established musician and community advocate <strong class="text-electric-blue">Gracie Chavez</strong> 
                joined MOCA as the City's founding Music + Cultural Tourism Officer in 2022.
              </p>
              <p>
                That same year, she devised the concept of a music board and drafted the city ordinance 
                to establish Houston's Music Advisory Board, which City Council unanimously approved. 
                The Music Board reports to and provides music industry recommendations to the Music Officer.
              </p>
              <p>
                If you have questions or want to get involved, we want to hear from you. Please 
                <NuxtLink to="/contact" class="text-electric-blue font-semibold hover:text-white transition-colors">Contact Us</NuxtLink> 
                and we'll send a prompt response.
              </p>
            </div>
          </div>
          <div class="order-1 lg:order-2">
            <div class="aspect-square bg-gradient-to-br from-electric-purple/20 via-electric-blue/20 to-neon-pink/20 rounded-2xl overflow-hidden border border-white/10 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center p-8">
                  <svg class="w-24 h-24 mx-auto mb-4 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <p class="font-display font-semibold text-lg text-white">Gracie Chavez</p>
                  <p class="text-sm text-text-secondary">Music + Cultural Tourism Officer</p>
                </div>
              </div>
            </div>
            <p class="text-center text-sm text-text-muted mt-3 italic">Photo by J. Tovar</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Donate & Volunteer Section -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Donate -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-8 hover:border-gold-accent/50 transition-all">
            <div class="text-center">
              <div class="w-16 h-16 bg-gold-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-accent/20">
                <svg class="w-8 h-8 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="font-display font-bold text-2xl text-white mb-4">DONATE</h3>
              <p class="text-text-secondary mb-8">
                Make a donation to our Music Advisory Board today! The Houston Music Advisory Board 
                creates opportunities and fosters the economic development of our music industry.
              </p>
              <NuxtLink 
                to="/donate"
                class="inline-block px-8 py-4 bg-gold-accent text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
              >
                Donate Now
              </NuxtLink>
            </div>
          </div>

          <!-- Volunteer -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-8 hover:border-electric-purple/50 transition-all">
            <div class="text-center">
              <div class="w-16 h-16 bg-electric-purple/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-electric-purple/20">
                <svg class="w-8 h-8 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3 class="font-display font-bold text-2xl text-white mb-4">VOLUNTEER</h3>
              <p class="text-text-secondary mb-8">
                We need the help of reliable, dedicated people to make our community events 
                happen for the benefit of our music industry.
              </p>
              <NuxtLink 
                to="/contact"
                class="inline-block px-8 py-4 bg-electric-purple text-white font-bold rounded-full hover:bg-neon-pink transition-all duration-300 hover:scale-105"
              >
                Volunteer
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="2022 INAUGURAL LISTENING SESSION" 
          centered 
        />
        
        <VideoEmbed 
          :src="`https://www.youtube.com/embed/${inauguralVideoId}`"
          title="2022 Inaugural Listening Session"
          caption="2022 Inaugural Listening Session with Houston Music Advisory Board"
        />
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-space-black border-t border-white/10">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 class="font-display text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Get Involved with HMAB
        </h2>
        <p class="text-text-secondary text-xl mb-12">
          Whether you're a musician, venue owner, or music enthusiast, there's a place for you in Houston's music community.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            RSVP for Next Event
          </a>
          <NuxtLink 
            to="/contact"
            class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Contact Us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
