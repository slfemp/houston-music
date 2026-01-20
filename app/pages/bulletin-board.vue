<script setup lang="ts">
import { events, archives, musicResources } from '~/data/events'

useHead({
  title: 'Bulletin Board - Houston Music Advisory Board',
  meta: [
    { 
      name: 'description', 
      content: 'Find upcoming public meetings, workshops, and networking events from the Houston Music Advisory Board. RSVP for the next event.' 
    }
  ]
})

// Video placeholders
const hipHop50VideoId = 'YOUR_VIDEO_ID'
const donnieHoustonVideoId = 'YOUR_VIDEO_ID'
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection 
      title="Bulletin Board"
      subtitle="Your hub for announcements, public meetings, and networking events"
    >
      <div class="mt-8">
        <a 
          href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block px-8 py-4 bg-gold-accent text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
        >
          RSVP NOW
        </a>
      </div>
    </HeroSection>

    <!-- Introduction -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <p class="text-lg text-text-secondary leading-relaxed mb-6">
          The HMAB holds regular public meetings to discuss key issues in advancing the local music industry and provide recommendations for improvement. This page serves as the hub for announcements, public meetings, and networking events.
        </p>
        <p class="text-lg text-text-secondary leading-relaxed mb-8">
          Register for the next event or public meeting to share thoughts, ideas, and feedback below. This ensures we have room for everyone.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://forms.gle/Jg92Ms4wnG7ZaSXz5"
            target="_blank"
            rel="noopener noreferrer"
            class="px-8 py-4 bg-electric-blue text-space-black font-bold rounded-full hover:bg-white transition-all duration-300 hover:scale-105"
          >
            RSVP NOW
          </a>
        </div>
        <p class="mt-6 text-text-muted">
          To register as a musician or music business, visit the 
          <NuxtLink to="/music-directory" class="text-electric-blue font-semibold hover:text-white transition-colors">
            Houston Music Directory
          </NuxtLink>.
        </p>
      </div>
    </section>

    <!-- Calendar of Events -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="CALENDAR OF EVENTS" 
          subtitle="Upcoming and recent public meetings, workshops, and events"
          centered 
        />

        <div class="grid gap-6 md:gap-8 lg:grid-cols-2">
          <EventCard 
            v-for="event in events" 
            :key="event.id" 
            :event="event" 
          />
        </div>
      </div>
    </section>

    <!-- 2023 Houston Music Preservation -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="2023 HOUSTON MUSIC PRESERVATION" 
          centered 
        />

        <div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${hipHop50VideoId}`"
            title="Houston's Hip Hop 50th Anniversary"
            caption="Houston's Hip Hop 50th Anniversary, 2023 @donnie_houston Podcast"
          />
          <VideoEmbed 
            :src="`https://www.youtube.com/embed/${donnieHoustonVideoId}`"
            title="Donnie Houston Podcast"
            caption="Recorded live at MATCH Houston with Donnie Houston Podcast, 2023"
          />
        </div>
      </div>
    </section>

    <!-- Mini Concerts -->
    <section class="py-24 bg-space-black">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="MINI CONCERTS LIVE FROM CITY HALL" 
          centered 
        />

        <div class="max-w-3xl mx-auto text-center">
          <p class="text-lg text-text-secondary mb-8">
            Watch the latest Mini Concert live at City Hall presented by the Mayor's Office of Cultural Affairs (MOCA) and HTV. See more of our Mini Concert series archived here.
          </p>
          <div class="bg-space-gray rounded-2xl border border-white/10 p-8">
            <div class="aspect-video bg-space-gray-light rounded-xl flex items-center justify-center mb-4">
              <div class="text-center">
                <svg class="w-16 h-16 text-white/20 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <p class="text-text-muted mt-2">Mini Concert Video</p>
              </div>
            </div>
            <p class="text-sm text-text-secondary italic">
              Latest Mini Concert from City Hall - Check back for updates
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Archives -->
    <section class="py-24 bg-space-dark">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <SectionHeading 
          title="ARCHIVES" 
          subtitle="View our previous public listening sessions or meetings by year below."
          centered 
        />

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- 2024 Archives -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
            <h3 class="font-display font-semibold text-lg text-electric-blue mb-4">
              {{ archives['2024'].title }}
            </h3>
            <ul class="space-y-2">
              <li 
                v-for="(item, index) in archives['2024'].items" 
                :key="index"
                class="text-text-secondary text-sm flex items-start"
              >
                <svg class="w-4 h-4 text-electric-purple mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 2023 Archives -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
            <h3 class="font-display font-semibold text-lg text-electric-blue mb-4">
              {{ archives['2023'].title }}
            </h3>
            <ul class="space-y-2">
              <li 
                v-for="(item, index) in archives['2023'].items" 
                :key="index"
                class="text-text-secondary text-sm flex items-start"
              >
                <svg class="w-4 h-4 text-electric-purple mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- 2022 Archives -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
            <h3 class="font-display font-semibold text-lg text-electric-blue mb-4">
              {{ archives['2022'].title }}
            </h3>
            <ul class="space-y-2">
              <li 
                v-for="(item, index) in archives['2022'].items" 
                :key="index"
                class="text-text-secondary text-sm flex items-start"
              >
                <svg class="w-4 h-4 text-electric-purple mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- Mini Concerts Archive -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 md:col-span-2 lg:col-span-3">
            <h3 class="font-display font-semibold text-lg text-gold-accent mb-4">
              {{ archives.miniConcerts.title }}
            </h3>
            <ul class="grid sm:grid-cols-3 gap-2">
              <li 
                v-for="(item, index) in archives.miniConcerts.items" 
                :key="index"
                class="text-text-secondary text-sm flex items-start"
              >
                <svg class="w-4 h-4 text-gold-accent mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Music Resources -->
    <section class="py-24 bg-space-black border-t border-white/10">
      <div class="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            MUSIC RESOURCES
          </h2>
          <p class="text-text-secondary text-lg">
            Helpful links and resources for Houston's music community
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Grants -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-electric-blue/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-electric-blue">
              {{ musicResources.grants.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.grants.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-electric-blue transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Organizations -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-electric-purple/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-electric-purple">
              {{ musicResources.organizations.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.organizations.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-electric-purple transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Permitting -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-neon-pink/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-neon-pink">
              {{ musicResources.permitting.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.permitting.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-neon-pink transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Make Music Day -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-gold-accent/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-gold-accent">
              {{ musicResources.makeMusicDay.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.makeMusicDay.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-gold-accent transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- City + State Offices -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-electric-blue/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-electric-blue">
              {{ musicResources.cityState.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.cityState.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-electric-blue transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Archives -->
          <div class="bg-space-gray rounded-2xl border border-white/10 p-6 hover:border-electric-purple/50 transition-all">
            <h3 class="font-display font-semibold text-lg mb-4 text-electric-purple">
              {{ musicResources.archives.title }}
            </h3>
            <ul class="space-y-2">
              <li v-for="item in musicResources.archives.items" :key="item.name">
                <a 
                  :href="item.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-text-secondary hover:text-electric-purple transition-colors text-sm"
                >
                  {{ item.name }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
