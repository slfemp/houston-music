<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'HMAB Console — Documents' })

// Board-internal docs stream from R2 behind auth; public docs are on the site.
const internal = [
  {
    name: 'Guidelines + Responsibilities Handbook (Rev. 01/2025)',
    href: '/api/documents/HMAB-Guidelines-Handbook-01.2025.pdf',
    note: 'Governance rules, terms, officer duties, meeting script, treasurer checklist, election ballots. Not for public access.',
  },
]
const publicDocs = [
  { name: 'Music Program (MOCA) — 2024 Arts + Culture Committee Presentation', href: '/docs/Music-Program-MOCA-2024-Art-Culture-Committee-FIN.pdf', note: 'Presented to City Council by Music Officer Gracie Chavez, September 2024.' },
  { name: 'SoundExchange Summary Handout', href: '/docs/SoundExchange-Summary-Handout.pdf', note: 'Digital performance royalties explainer from the sync licensing workshop.' },
]

// The governance rules the console enforces, straight from the handbook.
const handbookRules = [
  'Nine numbered seats + three rotating alternates, all Mayor-appointed and Council-confirmed; members must live in Houston.',
  'Max two consecutive two-year terms. Odd seats expire Jan of odd years, even seats Jan of even years; members serve until a successor is confirmed.',
  'Alternates attend but only vote when seated by the chair for a specific absent member.',
  'Chair, Vice-Chair, Treasurer elected at the first meeting every two years; Secretary elected every year (may be a non-member).',
  'Three consecutive absences in 12 months = removal review. Conflict-of-interest votes require abstention or recusal on the record.',
  'Members serve without compensation; resignations must be written, formally accepted at a meeting, and recorded in the minutes.',
  'Board nominations open after the first Fall listening session each year.',
]
</script>

<template>
  <div class="max-w-4xl">
    <h1 class="font-display text-3xl font-bold mb-2">Documents</h1>
    <p class="text-text-secondary text-sm mb-8">Board records and reference material. Internal documents are only reachable signed in.</p>

    <h2 class="text-sm uppercase tracking-wider text-neon-pink mb-3">Board internal</h2>
    <div class="space-y-3 mb-10">
      <a
        v-for="d in internal" :key="d.href" :href="d.href" target="_blank"
        class="block bg-space-gray border border-white/10 rounded-xl px-5 py-4 hover:border-electric-blue/60 transition"
      >
        <div class="font-semibold">{{ d.name }}</div>
        <div class="text-xs text-text-muted mt-1">{{ d.note }}</div>
      </a>
    </div>

    <h2 class="text-sm uppercase tracking-wider text-text-muted mb-3">Public (also on the site)</h2>
    <div class="space-y-3 mb-12">
      <a
        v-for="d in publicDocs" :key="d.href" :href="d.href" target="_blank"
        class="block bg-space-gray border border-white/10 rounded-xl px-5 py-4 hover:border-electric-blue/60 transition"
      >
        <div class="font-semibold">{{ d.name }}</div>
        <div class="text-xs text-text-muted mt-1">{{ d.note }}</div>
      </a>
    </div>

    <h2 class="text-sm uppercase tracking-wider text-electric-blue mb-3">Governance quick reference — from the Handbook</h2>
    <ul class="space-y-2">
      <li v-for="r in handbookRules" :key="r" class="text-sm text-text-secondary flex gap-2">
        <span class="text-electric-blue shrink-0">•</span>{{ r }}
      </li>
    </ul>
  </div>
</template>
