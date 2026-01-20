<script setup lang="ts">
const props = defineProps<{
  src: string
  title?: string
  caption?: string
  captionLink?: string
}>()

// Convert YouTube URLs to embed format
const embedSrc = computed(() => {
  const url = props.src
  
  // Handle YouTube watch URLs
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Handle YouTube short URLs
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Handle Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${videoId}`
  }
  
  // Already an embed URL or other format
  return url
})
</script>

<template>
  <div class="group">
    <!-- Video container with glow effect -->
    <div class="relative rounded-2xl overflow-hidden border border-white/10 group-hover:border-electric-blue/50 transition-all duration-300 shadow-2xl group-hover:shadow-electric-blue/20">
      <div class="aspect-video bg-space-gray">
        <iframe 
          :src="embedSrc" 
          :title="title || 'Video'"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          loading="lazy"
        />
      </div>
    </div>
    
    <!-- Caption -->
    <p v-if="caption" class="mt-4 text-sm text-text-secondary italic">
      {{ caption }}
      <a 
        v-if="captionLink" 
        :href="captionLink" 
        target="_blank" 
        rel="noopener noreferrer"
        class="text-electric-blue hover:text-white transition-colors ml-1"
      >
        Learn more →
      </a>
    </p>
  </div>
</template>
