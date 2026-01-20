<script setup lang="ts">
import { timelineEvents, spotifyPlaylist } from '~/data/timeline'

useHead({
  title: 'Music History - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Explore Houston\'s rich music history from the 1920s to today. Discover notable musicians, significant landmarks, and recorded music moments.' 
    }
  ]
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Houston Music History"
      subtitle="Celebrating the rich musical heritage of the Bayou City"
    />

    <!-- Introduction -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <SectionHeading 
          title="MUSIC HISTORY TIMELINE" 
          centered 
        />

        <p class="text-lg text-text-secondary leading-relaxed mb-6">
          Since the early 1900s, there has been an important music community developing in Houston.
        </p>
        <p class="text-lg text-text-secondary leading-relaxed mb-8">
          This year, we continue highlighting some of Houston's most notable local musicians, significant landmarks, and recorded music moments.
        </p>
        
        <div class="bg-space-gray rounded-2xl border border-white/10 p-8 inline-block">
          <p class="text-text-secondary mb-6">
            Have a bit of local music history to share?
          </p>
          <a 
            href="https://forms.office.com/g/mvLcRii1XJ"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            Submit Music History
          </a>
        </div>
      </div>
    </section>

    <!-- Timeline Gallery -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="EXPLORE THE TIMELINE" 
          subtitle="Discover Houston's musical milestones from 1923 to today"
          centered 
        />

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <TimelineCard 
            v-for="event in timelineEvents" 
            :key="event.year" 
            :event="event" 
          />
        </div>
      </div>
    </section>

    <!-- Spotify Playlist Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="SPOTIFY PLAYLIST" 
          centered 
        />

        <div class="text-center mb-8">
          <p class="text-lg text-text-secondary leading-relaxed mb-4">
            {{ spotifyPlaylist.description }}
          </p>
          <p class="text-text-secondary mb-8">
            To submit your local song for this playlist, send your selection using our 
            <NuxtLink to="/contact" class="text-electric-blue font-semibold hover:text-white transition-colors">
              Contact Form
            </NuxtLink>.
          </p>
        </div>

        <!-- Spotify Embed -->
        <div class="bg-space-gray rounded-2xl border border-white/10 p-4 mb-8">
          <iframe 
            style="border-radius: 12px" 
            :src="spotifyPlaylist.embedUrl" 
            width="100%" 
            height="380" 
            frameborder="0" 
            allowfullscreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            title="Essential Houston Music Playlist"
          />
        </div>

        <div class="text-center">
          <p class="text-sm text-text-muted mb-6 italic">
            Anyone with a Spotify account can listen to the Htown Music Spotify playlist.
          </p>
          <a 
            :href="spotifyPlaylist.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            LISTEN NOW
          </a>
        </div>
      </div>
    </section>

    <!-- Notable Artists Section -->
    <section class="py-24 bg-space-black border-y border-white/10">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Houston Music Legends
          </h2>
          <p class="text-text-secondary text-xl">
            Home to some of the world's most influential artists
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-gold-accent/50 transition-all">
              <span class="text-2xl font-bold text-gold-accent">B</span>
            </div>
            <p class="font-display font-semibold text-white">Beyoncé</p>
          </div>
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-electric-blue/50 transition-all">
              <span class="text-2xl font-bold text-electric-blue">ZZ</span>
            </div>
            <p class="font-display font-semibold text-white">ZZ Top</p>
          </div>
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-electric-purple/50 transition-all">
              <span class="text-2xl font-bold text-electric-purple">UGK</span>
            </div>
            <p class="font-display font-semibold text-white">UGK</p>
          </div>
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-neon-pink/50 transition-all">
              <span class="text-2xl font-bold text-neon-pink">REK</span>
            </div>
            <p class="font-display font-semibold text-white">Robert Earl Keen</p>
          </div>
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-electric-blue/50 transition-all">
              <span class="text-2xl font-bold text-electric-blue">DJ</span>
            </div>
            <p class="font-display font-semibold text-white">DJ Screw</p>
          </div>
          <div class="text-center group">
            <div class="w-24 h-24 mx-auto bg-space-gray rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-gold-accent/50 transition-all">
              <span class="text-2xl font-bold text-gold-accent">LM</span>
            </div>
            <p class="font-display font-semibold text-white">La Mafia</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <h2 class="font-display text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
          Be Part of Houston's Music Future
        </h2>
        <p class="text-text-secondary text-xl mb-12">
          Join the Houston Music Directory and help write the next chapter of Houston's musical legacy.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/music-directory"
            class="px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            Join the Directory
          </NuxtLink>
          <NuxtLink 
            to="/bulletin-board"
            class="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Attend an Event
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
