<template>
  <div class="min-h-screen flex flex-col bg-space-black">
    <Navigation />
    <main class="flex-grow pt-20">
      <slot />
    </main>
    <Footer />
  </div>
</template>
