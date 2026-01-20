<script setup lang="ts">
useHead({
  title: 'Houston Music Advisory Board - Welcome to Houston\'s Music Community',
  meta: [
    { 
      name: 'description', 
      content: 'Welcome to Houston\'s music community! Home to notable music acts and world-class venues, opportunities in Houston\'s music industry are more available and diverse than ever before.' 
    }
  ]
})

// Video placeholders - replace with actual YouTube video IDs
const heroVideoId = 'YOUR_VIDEO_ID' // Listening Session at Cactus Music 2024
const soundSyncVideoId = 'YOUR_VIDEO_ID' // SoundSync Music video
const soundDiplomacyVideoId = 'YOUR_VIDEO_ID' // Sound Diplomacy video
const preservationVideoId = 'YOUR_VIDEO_ID' // Donnie Houston Podcast video
</script>

<template>
  <div>
    <!-- Full-screen Hero Section with Video Background -->
    <section class="relative h-screen min-h-[600px] bg-space-black overflow-hidden flex items-center">
      <!-- Background - Houston Skyline Image (video can overlay when available) -->
      <div class="absolute inset-0 z-0">
        <!-- Full image background -->
        <img 
          src="/images/htownskyline.jpg" 
          alt="Houston Skyline at Night"
          class="w-full h-full object-cover"
        />
        
        <!-- Dark gradient overlays for text readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-space-black/90 via-space-black/60 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-space-black via-transparent to-space-black/40"></div>
      </div>
      
      <!-- Content - Left Justified -->
      <div class="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 w-full">
        <!-- Logo SVG - White -->
        <div class="mb-8">
          <img 
            src="/herologo.svg" 
            alt="Houston Music Advisory Board" 
            class="h-48 md:h-64 lg:h-80 w-auto"
          />
        </div>
        
        <!-- Subheading -->
        <p class="text-xl md:text-2xl text-text-secondary max-w-2xl mb-12 leading-relaxed">
          Welcome to Houston's music community! Connecting musicians, venues, and industry professionals.
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <a 
            href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 text-center text-lg hover:scale-105"
          >
            RSVP NOW
          </a>
          <NuxtLink 
            to="/bulletin-board"
            class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full hover:bg-white/20 transition-all duration-300 text-center text-lg border border-white/20"
          >
            View Events
          </NuxtLink>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
        </svg>
      </div>
    </section>

    <!-- Welcome Section -->
    <section class="py-24 md:py-32 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="max-w-4xl mx-auto text-center">
          <SectionHeading 
            title="Welcome to Houston's Music Community!" 
            centered 
          />
          
          <div class="space-y-6 text-text-secondary">
            <p class="text-lg md:text-xl leading-relaxed">
              Home to notable music acts and world-class venues, opportunities in Houston's music industry are more available and diverse than ever before.
            </p>
            <p class="text-lg leading-relaxed">
              To keep up with a changing world, the need for the continued development and expansion of our local music industry workforce and companies is vital. So, we invite you to explore the resources here to learn about opportunities to plug in or start a career in Houston's music community.
            </p>
            <p class="text-lg leading-relaxed">
              To attend our next public meeting or event, please RSVP or visit our 
              <NuxtLink to="/bulletin-board" class="text-electric-blue font-semibold hover:text-white transition-colors">Bulletin Board</NuxtLink> 
              where you'll find more event details.
            </p>
          </div>

          <div class="mt-12">
            <a 
              href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-block px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
            >
              RSVP NOW
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Video Section -->
    <section class="py-24 md:py-32 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="Latest from HMAB"
          subtitle="Watch recordings from our listening sessions and community events"
          centered
        />
        
        <div class="max-w-4xl mx-auto">
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${heroVideoId}`"
            title="Listening Session at Cactus Music"
            caption="Listening Session Recorded live at Cactus Music with Houston Music Advisory Board and Community, 2024"
          />
        </div>
      </div>
    </section>

    <!-- What We Do Section -->
    <section class="py-24 md:py-32 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="What We Do"
          centered
        />
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-electric-blue/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-space-gray p-8 rounded-2xl border border-white/5 group-hover:border-electric-blue/50 transition-all duration-300">
              <!-- Icon -->
              <div class="w-16 h-16 bg-electric-blue/10 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              
              <h3 class="font-display text-2xl font-bold text-white mb-4">
                Community Events
              </h3>
              <p class="text-text-secondary leading-relaxed">
                Regular public meetings and listening sessions to discuss and advance Houston's music industry.
              </p>
            </div>
          </div>
          
          <!-- Card 2 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-electric-purple/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-space-gray p-8 rounded-2xl border border-white/5 group-hover:border-electric-purple/50 transition-all duration-300">
              <!-- Icon -->
              <div class="w-16 h-16 bg-electric-purple/10 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              
              <h3 class="font-display text-2xl font-bold text-white mb-4">
                Music Directory
              </h3>
              <p class="text-text-secondary leading-relaxed">
                Connecting local musicians, venues, and music businesses with opportunities across Houston.
              </p>
            </div>
          </div>
          
          <!-- Card 3 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-br from-neon-pink/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="relative bg-space-gray p-8 rounded-2xl border border-white/5 group-hover:border-neon-pink/50 transition-all duration-300">
              <!-- Icon -->
              <div class="w-16 h-16 bg-neon-pink/10 rounded-xl flex items-center justify-center mb-6">
                <svg class="w-8 h-8 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </div>
              
              <h3 class="font-display text-2xl font-bold text-white mb-4">
                Music Preservation
              </h3>
              <p class="text-text-secondary leading-relaxed">
                Documenting and celebrating Houston's rich musical heritage from blues to hip-hop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Houston Music History Section -->
    <section class="py-24 md:py-32 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <SectionHeading title="HOUSTON MUSIC HISTORY" />
            
            <div class="space-y-6 text-text-secondary">
              <p class="text-lg leading-relaxed">
                Music has long been an integral part of the Htown experience. It's home to many music superstars, including Beyoncé, ZZ Top, UGK, Robert Earl Keen, DJ Screw and La Mafia.
              </p>
              <p class="text-lg leading-relaxed">
                Bayou City's musicians continue to garner attention beyond our state and international borders. Our renowned venues, historic recording studios and talented music business professionals make Houston the perfect place to create the next music project.
              </p>
              <p class="text-lg leading-relaxed">
                If you're a local musician or music professional, please register in our 
                <NuxtLink to="/music-directory" class="text-electric-blue font-semibold hover:text-white transition-colors">Houston Music Directory</NuxtLink>.
              </p>
            </div>

            <div class="flex flex-wrap gap-4 mt-8">
              <NuxtLink 
                to="/music-history"
                class="px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
              >
                Explore History
              </NuxtLink>
              <NuxtLink 
                to="/music-directory"
                class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Join Directory
              </NuxtLink>
            </div>
          </div>

          <div class="relative">
            <div class="aspect-square bg-gradient-to-br from-electric-blue/20 via-electric-purple/20 to-neon-pink/20 rounded-2xl flex items-center justify-center border border-white/10">
              <svg class="w-32 h-32 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2024 Program Overview Section -->
    <section class="py-24 md:py-32 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="2024 HOUSTON MUSIC PROGRAM OVERVIEW (MOCA)" 
          subtitle="Presented to Houston City Council's Arts + Culture Committee by Music Officer Gracie Chavez, September 2024. Watch it recorded live on HTV."
          centered
        />
        
        <div class="max-w-2xl mx-auto text-center">
          <a 
            href="https://houston-music.live/wp-content/uploads/2024/09/Music-Program-MOCA-2024-Art-Culture-Committee-FIN.pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center px-8 py-6 bg-space-gray text-white rounded-2xl border border-white/10 hover:border-electric-blue/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-electric-blue/10"
          >
            <svg class="w-10 h-10 text-neon-pink mr-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v6h-2v-6H6l4-4 4 4h-2z"/>
            </svg>
            <div class="text-left">
              <span class="block font-display font-bold text-lg group-hover:text-electric-blue transition-colors">
                Music Program (MOCA) – 2024 Art + Culture Committee
              </span>
              <span class="text-sm text-text-secondary">Download PDF</span>
            </div>
            <svg class="w-6 h-6 ml-6 text-text-muted group-hover:text-electric-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Music Business Development Section -->
    <section class="py-24 md:py-32 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="MUSIC BUSINESS DEVELOPMENT 2024" 
          centered 
        />
        
        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${soundSyncVideoId}`"
            title="SoundSync Music Workshop"
            caption="Recorded live at The DeLuxe Theater with SoundSync Music, 2024"
            caption-link="https://www.soundsyncmusic.com/"
          />
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${soundDiplomacyVideoId}`"
            title="Sound Diplomacy Forum"
            caption="Recorded live at Off the Record with Sound Diplomacy, 2024"
            caption-link="http://www.sounddiplomacy.com"
          />
        </div>
      </div>
    </section>

    <!-- Music Preservation Section -->
    <section class="py-24 md:py-32 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="MUSIC PRESERVATION 2023" 
          centered 
        />
        
        <div class="max-w-3xl mx-auto">
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${preservationVideoId}`"
            title="Donnie Houston Podcast"
            caption="Recorded live at MATCH Houston with Donnie Houston Podcast, 2023"
            caption-link="https://www.youtube.com/@donnie_houston"
          />
        </div>
      </div>
    </section>

    <!-- Quick Links / CTA Section -->
    <section class="py-24 md:py-32 bg-space-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Get Involved
          </h2>
          <p class="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto">
            Explore opportunities to connect with Houston's music community
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Card 1 -->
          <NuxtLink 
            to="/bulletin-board" 
            class="bg-space-gray p-8 rounded-2xl border border-white/5 hover:border-electric-blue/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-electric-blue/10"
          >
            <div class="w-14 h-14 bg-electric-blue/10 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-3 group-hover:text-electric-blue transition-colors">
              Upcoming Events
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              Find public meetings, workshops, and networking events
            </p>
          </NuxtLink>

          <!-- Card 2 -->
          <NuxtLink 
            to="/music-directory" 
            class="bg-space-gray p-8 rounded-2xl border border-white/5 hover:border-electric-purple/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-electric-purple/10"
          >
            <div class="w-14 h-14 bg-electric-purple/10 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-electric-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-3 group-hover:text-electric-purple transition-colors">
              Music Directory
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              Register or find local musicians and music businesses
            </p>
          </NuxtLink>

          <!-- Card 3 -->
          <NuxtLink 
            to="/map" 
            class="bg-space-gray p-8 rounded-2xl border border-white/5 hover:border-neon-pink/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-neon-pink/10"
          >
            <div class="w-14 h-14 bg-neon-pink/10 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-3 group-hover:text-neon-pink transition-colors">
              Venue Map
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              Explore Houston's music venues and landmarks
            </p>
          </NuxtLink>

          <!-- Card 4 -->
          <NuxtLink 
            to="/about" 
            class="bg-space-gray p-8 rounded-2xl border border-white/5 hover:border-gold-accent/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-gold-accent/10"
          >
            <div class="w-14 h-14 bg-gold-accent/10 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-display font-bold text-xl text-white mb-3 group-hover:text-gold-accent transition-colors">
              About HMAB
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              Learn about the board and meet our members
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
