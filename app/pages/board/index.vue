<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Board Dashboard' })

const { user, isOfficer } = useBoardUser()

const { data: meetings } = await useFetch('/api/meetings', { query: { scope: 'upcoming' }, default: () => [] })
const { data: issues } = await useFetch('/api/issues', { default: () => [] })
const { data: finance } = await useFetch('/api/finance/summary', { default: () => null })
const { data: events } = await useFetch('/api/events', { query: { scope: 'upcoming' }, default: () => [] })
const { data: roster } = await useFetch('/api/members', { default: () => ({ members: [], seatedCount: 0, quorum: 0 }) })
const { data: signups } = await useFetch('/api/volunteer/signups', { default: () => [] })
const { data: gov } = await useFetch('/api/stats/governance', { default: () => null })

const attendanceBars = computed(() =>
  (gov.value?.attendance ?? [])
    .filter((a: any) => a.rate !== null)
    .map((a: any) => ({
      label: a.name,
      value: a.rate,
      meta: `${a.present} of ${a.eligible} meetings · ${humanize(a.position)}`,
    })))

const issueBars = computed(() =>
  (gov.value?.issues?.byCategory ?? []).map((c: any) => ({
    label: humanize(c.category), value: c.count, meta: `${c.count} issue(s) raised`,
  })))

const nextMeeting = computed(() => (meetings.value as any[])[0] ?? null)
const openIssues = computed(() => (issues.value as any[]).filter(i => ['submitted', 'under_review'].includes(i.status)))
const needsRsvp = computed(() => (events.value as any[]).filter(e => e.awaitingMyRsvp))
const pendingSignups = computed(() => (signups.value as any[]).filter(s => s.status === 'pending'))

/** Notice shortfall is worth surfacing before the meeting, not after. */
const noticeWarning = computed(() => {
  const m = nextMeeting.value
  if (!m) return null
  if (!m.noticePostedAt) return 'Agenda not yet posted'
  return null
})
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="font-display text-3xl font-bold mb-1">Welcome back, {{ (user as any)?.name?.split(' ')[0] }}</h1>
      <p class="text-text-secondary">Houston Music Advisory Board</p>
    </div>

    <!-- Things needing this member's attention -->
    <div v-if="needsRsvp.length || (isOfficer && pendingSignups.length)" class="mb-8 space-y-3">
      <NuxtLink
        v-if="needsRsvp.length" to="/board/events"
        class="flex items-center gap-3 px-5 py-4 rounded-xl bg-gold-accent/10 border border-gold-accent/30 hover:border-gold-accent/60 transition-colors"
      >
        <span class="text-gold-accent font-bold text-lg">{{ needsRsvp.length }}</span>
        <span class="text-sm">event{{ needsRsvp.length === 1 ? '' : 's' }} awaiting your attendance confirmation</span>
        <span class="ml-auto text-gold-accent text-sm">Respond →</span>
      </NuxtLink>

      <NuxtLink
        v-if="isOfficer && pendingSignups.length" to="/board/volunteers"
        class="flex items-center gap-3 px-5 py-4 rounded-xl bg-electric-purple/10 border border-electric-purple/30 hover:border-electric-purple/60 transition-colors"
      >
        <span class="text-electric-purple font-bold text-lg">{{ pendingSignups.length }}</span>
        <span class="text-sm">volunteer sign-up{{ pendingSignups.length === 1 ? '' : 's' }} to review</span>
        <span class="ml-auto text-electric-purple text-sm">Review →</span>
      </NuxtLink>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Next meeting -->
      <div class="lg:col-span-2 bg-space-gray rounded-2xl border border-white/10 p-6">
        <div class="flex items-start justify-between mb-4">
          <h2 class="font-display text-xl font-semibold">Next Meeting</h2>
          <NuxtLink to="/board/meetings" class="text-sm text-electric-blue hover:text-white transition-colors">All meetings →</NuxtLink>
        </div>

        <div v-if="nextMeeting">
          <NuxtLink :to="`/board/meetings/${nextMeeting.id}`" class="block group">
            <h3 class="text-lg font-semibold group-hover:text-electric-blue transition-colors">{{ nextMeeting.title }}</h3>
            <p class="text-text-secondary text-sm mt-1">{{ formatDateTime(nextMeeting.startsAt) }}</p>
            <p class="text-text-muted text-sm">{{ nextMeeting.location }}</p>
          </NuxtLink>

          <div class="flex flex-wrap gap-2 mt-4">
            <span class="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 capitalize">
              {{ humanize(nextMeeting.status) }}
            </span>
            <span
              v-if="nextMeeting.noticeLeadHours !== null"
              class="px-3 py-1 rounded-full text-xs border"
              :class="nextMeeting.noticeLeadHours >= nextMeeting.noticeRequiredHours
                ? 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue'
                : 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent'"
            >{{ nextMeeting.noticeLeadHours }}h notice given</span>
            <span v-if="noticeWarning" class="px-3 py-1 rounded-full text-xs bg-gold-accent/10 border border-gold-accent/30 text-gold-accent">
              {{ noticeWarning }}
            </span>
          </div>
        </div>

        <div v-else class="py-8 text-center">
          <p class="text-text-muted mb-4">No meetings scheduled.</p>
          <NuxtLink v-if="isOfficer" to="/board/meetings" class="text-electric-blue hover:text-white text-sm transition-colors">
            Schedule one →
          </NuxtLink>
        </div>
      </div>

      <!-- Quorum -->
      <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
        <h2 class="font-display text-xl font-semibold mb-4">The Board</h2>
        <div class="flex items-baseline gap-2">
          <span class="text-4xl font-bold text-electric-blue">{{ roster?.seatedCount ?? 0 }}</span>
          <span class="text-text-secondary text-sm">seated members</span>
        </div>
        <p class="text-text-secondary text-sm mt-3">
          <span class="text-white font-semibold">{{ roster?.quorum ?? 0 }}</span> needed for quorum
        </p>
        <NuxtLink to="/board/members" class="inline-block mt-4 text-sm text-electric-blue hover:text-white transition-colors">
          Manage roster →
        </NuxtLink>
      </div>

      <!-- Treasury -->
      <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
        <div class="flex items-start justify-between mb-4">
          <h2 class="font-display text-xl font-semibold">Treasury</h2>
          <NuxtLink to="/board/finance" class="text-sm text-electric-blue hover:text-white transition-colors">Details →</NuxtLink>
        </div>
        <div class="text-3xl font-bold">{{ finance?.totals?.totalFormatted ?? '$0.00' }}</div>
        <p class="text-text-muted text-xs mt-1">across {{ finance?.accounts?.length ?? 0 }} account(s)</p>
        <dl class="mt-4 space-y-1.5 text-sm">
          <div class="flex justify-between">
            <dt class="text-text-secondary">Income (FY{{ finance?.fiscalYear }})</dt>
            <dd class="text-electric-blue">{{ finance?.totals?.incomeFormatted ?? '$0.00' }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-text-secondary">Spent</dt>
            <dd class="text-neon-pink">{{ finance?.totals?.expenseFormatted ?? '$0.00' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Issues -->
      <div class="lg:col-span-2 bg-space-gray rounded-2xl border border-white/10 p-6">
        <div class="flex items-start justify-between mb-4">
          <h2 class="font-display text-xl font-semibold">Open Issues</h2>
          <NuxtLink to="/board/issues" class="text-sm text-electric-blue hover:text-white transition-colors">All issues →</NuxtLink>
        </div>

        <ul v-if="openIssues.length" class="divide-y divide-white/5">
          <li v-for="issue in openIssues.slice(0, 5)" :key="issue.id" class="py-3 flex items-start gap-3">
            <span class="mt-0.5 px-2 py-0.5 rounded text-[11px] font-medium shrink-0 capitalize"
              :class="{
                'bg-neon-pink/15 text-neon-pink': issue.priority === 'urgent',
                'bg-gold-accent/15 text-gold-accent': issue.priority === 'high',
                'bg-white/5 text-text-secondary': ['normal','low'].includes(issue.priority),
              }">{{ issue.priority }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium truncate">{{ issue.title }}</p>
              <p class="text-xs text-text-muted">{{ humanize(issue.category) }} · {{ issue.support }} support</p>
            </div>
          </li>
        </ul>
        <p v-else class="py-6 text-center text-text-muted text-sm">Nothing in the backlog.</p>
      </div>

      <!-- Motion outcomes -->
      <div class="bg-space-gray rounded-2xl border border-white/10 p-6">
        <h2 class="font-display text-xl font-semibold mb-4">Voting record</h2>
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-4xl font-bold">{{ gov?.motions?.decided ?? 0 }}</span>
          <span class="text-text-secondary text-sm">motions decided</span>
        </div>
        <dl class="mt-4 space-y-1.5 text-sm">
          <div class="flex justify-between"><dt class="text-text-secondary">Carried</dt><dd class="tabular-nums">{{ gov?.motions?.carried ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt class="text-text-secondary">Failed</dt><dd class="tabular-nums">{{ gov?.motions?.failed ?? 0 }}</dd></div>
          <div class="flex justify-between"><dt class="text-text-secondary">Unanimous</dt><dd class="tabular-nums">{{ gov?.motions?.unanimous ?? 0 }}</dd></div>
          <div class="flex justify-between pt-1.5 border-t border-white/5"><dt class="text-text-secondary">Meetings held</dt><dd class="tabular-nums">{{ gov?.meetingsHeld ?? 0 }}</dd></div>
        </dl>
      </div>
    </div>

    <!-- Governance charts -->
    <div class="grid gap-6 lg:grid-cols-2 mt-6">
      <ChartsChartCard
        v-if="attendanceBars.length"
        title="Attendance by member"
        :subtitle="`Share of the ${gov?.meetingsHeld ?? 0} meetings held that each member attended`"
      >
        <ChartsBarsH :data="attendanceBars" :format="(v: number) => `${v}%`" />
        <template #table>
          <table class="w-full text-sm">
            <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
              <tr><th class="text-left py-2 pr-4">Member</th><th class="text-left py-2 pr-4">Position</th><th class="text-right py-2 pr-4">Present</th><th class="text-right py-2">Rate</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="a in (gov?.attendance ?? [])" :key="a.memberId">
                <td class="py-2 pr-4">{{ a.name }}</td>
                <td class="py-2 pr-4 text-text-secondary capitalize">{{ humanize(a.position) }}</td>
                <td class="py-2 pr-4 text-right tabular-nums">{{ a.present }} / {{ a.eligible }}</td>
                <td class="py-2 text-right tabular-nums">{{ a.rate === null ? '—' : `${a.rate}%` }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </ChartsChartCard>

      <ChartsChartCard
        v-if="issueBars.length"
        title="Issues raised by area"
        subtitle="What the board is being asked to work on"
      >
        <ChartsBarsH :data="issueBars" :format="(v: number) => String(v)" />
        <template #table>
          <table class="w-full text-sm">
            <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
              <tr><th class="text-left py-2 pr-4">Area</th><th class="text-right py-2">Issues</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="c in issueBars" :key="c.label">
                <td class="py-2 pr-4 text-text-secondary">{{ c.label }}</td>
                <td class="py-2 text-right tabular-nums">{{ c.value }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </ChartsChartCard>
    </div>
  </div>
</template>
