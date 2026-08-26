<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })

const route = useRoute()
const id = Number(route.params.id)
const { user, isOfficer, canEdit } = useBoardUser()

const { data, refresh, pending } = await useFetch(`/api/meetings/${id}`)
const { data: rules } = await useFetch('/api/motions/rules', { default: () => [] })
const { data: roster } = await useFetch('/api/members', { default: () => ({ members: [], seatedCount: 0, quorum: 0 }) })

useHead({ title: () => (data.value as any)?.meeting?.title ?? 'Meeting' })

const error = ref('')
const busy = ref(false)

/** Wraps an action so every parliamentary refusal surfaces instead of failing silently. */
async function act(fn: () => Promise<unknown>) {
  error.value = ''
  busy.value = true
  try {
    await fn()
    await refresh()
  } catch (err) {
    error.value = apiError(err)
  } finally {
    busy.value = false
  }
}

const meeting = computed(() => (data.value as any)?.meeting)
const agenda = computed(() => (data.value as any)?.agenda ?? [])
const motions = computed(() => (data.value as any)?.motions ?? [])
const attendance = computed(() => (data.value as any)?.attendance ?? [])
const quorum = computed(() => (data.value as any)?.quorum ?? { required: 0, present: 0, met: false })

const mySeat = computed(() => {
  const me = (user.value as any)?.id
  return (roster.value as any)?.members?.find((m: any) => m.userId === me) ?? null
})

/** The question currently before the board, if any. */
const pendingMotion = computed(() =>
  motions.value.find((m: any) => ['proposed', 'seconded', 'debating', 'voting'].includes(m.status)) ?? null)

const decidedMotions = computed(() => motions.value.filter((m: any) => ['carried', 'failed', 'withdrawn', 'tabled', 'ruled_out_of_order'].includes(m.status)))

// --- Motion composer ---
const showMotion = ref(false)
const motionForm = reactive({ kind: 'main', text: '', agendaItemId: null as number | null })
const selectedRule = computed(() => (rules.value as any[]).find(r => r.kind === motionForm.kind))

async function makeMotion() {
  await act(async () => {
    await $fetch('/api/motions', {
      method: 'POST',
      body: {
        meetingId: id, kind: motionForm.kind, text: motionForm.text,
        agendaItemId: motionForm.agendaItemId ?? undefined,
      },
    })
    motionForm.text = ''
    showMotion.value = false
  })
}

const myVote = computed(() => {
  if (!pendingMotion.value || !mySeat.value) return null
  return pendingMotion.value.votes?.find((v: any) => v.memberId === mySeat.value.id)?.choice ?? null
})

const recuseReason = ref('')

async function castVote(choice: string) {
  if (choice === 'recuse' && !recuseReason.value.trim()) {
    error.value = 'State the conflict of interest when recusing'
    return
  }
  await act(() => $fetch(`/api/motions/${pendingMotion.value.id}/vote`, {
    method: 'POST', body: { choice, reason: choice === 'recuse' ? recuseReason.value : undefined },
  }))
}

// --- Agenda item composer ---
const showItem = ref(false)
const itemForm = reactive({ kind: 'new_business', title: '', description: '', actionRequired: true, afterItemId: null as number | null })

async function addItem() {
  await act(async () => {
    await $fetch(`/api/meetings/${id}/agenda`, {
      method: 'POST',
      body: { ...itemForm, afterItemId: itemForm.afterItemId ?? undefined },
    })
    itemForm.title = ''
    itemForm.description = ''
    showItem.value = false
  })
}

// --- Minutes ---
const minutesDraft = ref('')
watch(meeting, m => { if (m && minutesDraft.value === '') minutesDraft.value = m.minutesBody ?? '' }, { immediate: true })

async function saveMinutes() {
  await act(() => $fetch(`/api/meetings/${id}`, { method: 'PATCH', body: { minutesBody: minutesDraft.value, minutesStatus: 'draft' } }))
}

const attendanceOptions = ['present', 'remote', 'late', 'excused', 'absent'] as const
</script>

<template>
  <div v-if="pending" class="py-16 text-center text-text-muted">Loading…</div>

  <div v-else-if="meeting">
    <NuxtLink to="/board/meetings" class="inline-block mb-4 text-sm text-text-secondary hover:text-electric-blue transition-colors">← All meetings</NuxtLink>

    <!-- Header -->
    <div class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <h1 class="font-display text-2xl font-bold">{{ meeting.title }}</h1>
          <p class="text-text-secondary mt-1">{{ formatDateTime(meeting.startsAt) }}</p>
          <p class="text-text-muted text-sm">{{ meeting.location }}</p>
          <a v-if="meeting.virtualUrl" :href="meeting.virtualUrl" target="_blank" rel="noopener" class="text-sm text-electric-blue hover:text-white transition-colors">Join online →</a>
        </div>

        <div class="text-right">
          <span class="inline-block px-3 py-1 rounded-full text-xs border capitalize bg-white/5 border-white/10">{{ humanize(meeting.status) }}</span>
          <div class="mt-3 text-sm">
            <span class="text-text-secondary">Quorum </span>
            <span :class="quorum.met ? 'text-electric-blue font-semibold' : 'text-neon-pink font-semibold'">
              {{ quorum.present }} / {{ quorum.required }}
            </span>
            <span v-if="!quorum.met" class="block text-xs text-neon-pink mt-0.5">Not met — no business may be transacted</span>
          </div>
        </div>
      </div>

      <!-- Notice status -->
      <div class="mt-5 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3">
        <template v-if="meeting.noticePostedAt">
          <span
            class="px-3 py-1 rounded-full text-xs border"
            :class="meeting.noticeLeadHours >= meeting.noticeRequiredHours
              ? 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue'
              : 'bg-gold-accent/10 border-gold-accent/30 text-gold-accent'"
          >
            Notice posted {{ formatDateTime(meeting.noticePostedAt) }} — {{ meeting.noticeLeadHours }}h lead
            <template v-if="meeting.noticeLeadHours < meeting.noticeRequiredHours"> (short of {{ meeting.noticeRequiredHours }}h)</template>
          </span>
        </template>
        <span v-else class="px-3 py-1 rounded-full text-xs border bg-white/5 border-white/10 text-text-muted">Agenda not posted</span>

        <div v-if="isOfficer" class="flex flex-wrap gap-2 ml-auto">
          <button v-if="!meeting.noticePostedAt" :disabled="busy" class="px-4 py-2 rounded-full text-sm border border-white/15 hover:border-electric-blue hover:text-electric-blue transition-colors disabled:opacity-50"
            @click="act(() => $fetch(`/api/meetings/${id}/notice`, { method: 'POST' }))">Post notice</button>
          <button v-if="meeting.status === 'noticed' || meeting.status === 'draft'" :disabled="busy" class="px-4 py-2 rounded-full text-sm bg-electric-blue text-space-black font-bold hover:bg-white transition-colors disabled:opacity-50"
            @click="act(() => $fetch(`/api/meetings/${id}/call-to-order`, { method: 'POST' }))">Call to order</button>
          <button v-if="meeting.status === 'in_progress'" :disabled="busy" class="px-4 py-2 rounded-full text-sm border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10 transition-colors disabled:opacity-50"
            @click="act(() => $fetch(`/api/meetings/${id}/adjourn`, { method: 'POST' }))">Adjourn</button>
        </div>
      </div>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Agenda -->
      <div class="lg:col-span-2 space-y-6">
        <section class="bg-space-gray rounded-2xl border border-white/10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-xl font-semibold">Agenda</h2>
            <button v-if="canEdit" class="text-sm text-electric-blue hover:text-white transition-colors" @click="showItem = !showItem">
              {{ showItem ? 'Cancel' : '+ Add item' }}
            </button>
          </div>

          <form v-if="showItem" class="mb-5 p-4 rounded-xl bg-white/5 border border-white/10" @submit.prevent="addItem">
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Section</span>
                <select v-model="itemForm.kind" class="w-full px-3 py-2 bg-space-dark border border-white/10 rounded-lg text-sm">
                  <option value="new_business">New Business</option>
                  <option value="old_business">Unfinished Business</option>
                  <option value="report">Report</option>
                  <option value="consent">Consent</option>
                  <option value="discussion">Discussion</option>
                  <option value="action">Action</option>
                  <option value="public_comment">Public Comment</option>
                  <option value="executive_session">Executive Session</option>
                </select>
              </label>
              <label class="block">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Insert after</span>
                <select v-model="itemForm.afterItemId" class="w-full px-3 py-2 bg-space-dark border border-white/10 rounded-lg text-sm">
                  <option :value="null">End of agenda</option>
                  <option v-for="i in agenda" :key="i.id" :value="i.id">{{ i.itemNumber }}. {{ i.title }}</option>
                </select>
              </label>
              <label class="block sm:col-span-2">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Title</span>
                <input v-model="itemForm.title" required class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
              </label>
              <label class="block sm:col-span-2">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Description</span>
                <textarea v-model="itemForm.description" rows="2" class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-y" />
              </label>
              <label class="flex items-center gap-2 sm:col-span-2">
                <input v-model="itemForm.actionRequired" type="checkbox" class="w-4 h-4 accent-electric-blue">
                <span class="text-sm">Expected to require a vote</span>
              </label>
            </div>
            <button type="submit" :disabled="busy" class="mt-3 px-4 py-2 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">Add to agenda</button>
          </form>

          <ol class="space-y-2">
            <li
              v-for="item in agenda" :key="item.id"
              class="flex gap-3 p-3 rounded-xl border transition-colors"
              :class="item.status === 'completed' ? 'border-white/5 bg-white/[0.02] opacity-60' : 'border-white/10'"
            >
              <span class="font-mono text-sm text-electric-blue shrink-0 w-8">{{ item.itemNumber }}.</span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-medium text-sm">{{ item.title }}</span>
                  <span v-if="item.actionRequired" class="px-2 py-0.5 rounded text-[10px] bg-gold-accent/15 text-gold-accent">Action</span>
                  <span v-if="item.minutesAllotted" class="text-[11px] text-text-muted">{{ item.minutesAllotted }} min</span>
                </div>
                <p v-if="item.description" class="text-xs text-text-secondary mt-1">{{ item.description }}</p>
              </div>
            </li>
          </ol>
        </section>

        <!-- The pending question -->
        <section v-if="pendingMotion" class="bg-space-gray rounded-2xl border-2 border-gold-accent/40 p-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="w-2 h-2 rounded-full bg-gold-accent animate-pulse" />
            <h2 class="font-display text-xl font-semibold">Question Before the Board</h2>
          </div>

          <p class="text-lg mb-2">{{ pendingMotion.text }}</p>
          <p class="text-sm text-text-secondary mb-4">
            {{ pendingMotion.rule?.label }} ·
            requires {{ pendingMotion.threshold === 'two_thirds' ? 'two-thirds' : pendingMotion.threshold }} ·
            <span class="capitalize">{{ humanize(pendingMotion.status) }}</span>
          </p>
          <p v-if="pendingMotion.rule?.help" class="text-xs text-text-muted mb-4 italic">{{ pendingMotion.rule.help }}</p>

          <!-- Awaiting a second -->
          <div v-if="pendingMotion.status === 'proposed'" class="flex flex-wrap items-center gap-3">
            <span class="text-sm text-gold-accent">Awaiting a second</span>
            <button
              v-if="mySeat && pendingMotion.movedByMemberId !== mySeat.id" :disabled="busy"
              class="px-4 py-2 rounded-full text-sm bg-electric-blue text-space-black font-bold hover:bg-white transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/motions/${pendingMotion.id}/second`, { method: 'POST' }))"
            >Second the motion</button>
            <span v-else-if="mySeat" class="text-xs text-text-muted">You moved this — another member must second it</span>
          </div>

          <!-- Debate -->
          <div v-else-if="pendingMotion.status === 'debating'" class="flex flex-wrap items-center gap-3">
            <span class="text-sm text-text-secondary">Seconded — under debate</span>
            <button v-if="isOfficer" :disabled="busy" class="px-4 py-2 rounded-full text-sm bg-electric-blue text-space-black font-bold hover:bg-white transition-colors disabled:opacity-50"
              @click="act(() => $fetch(`/api/motions/${pendingMotion.id}/open-vote`, { method: 'POST' }))">Put the question</button>
          </div>

          <!-- Voting -->
          <div v-else-if="pendingMotion.status === 'voting'">
            <div v-if="mySeat" class="mb-4">
              <p class="text-sm font-medium mb-2">
                Your vote<span v-if="myVote" class="text-electric-blue"> — recorded as {{ myVote }}</span>
              </p>
              <div class="flex flex-wrap gap-2">
                <button v-for="c in ['aye','nay','abstain','recuse']" :key="c" :disabled="busy"
                  class="px-4 py-2 rounded-full text-sm border capitalize transition-colors disabled:opacity-50"
                  :class="myVote === c
                    ? 'bg-electric-blue text-space-black border-electric-blue font-bold'
                    : 'border-white/15 hover:border-electric-blue hover:text-electric-blue'"
                  @click="castVote(c)">{{ c }}</button>
              </div>
              <input v-model="recuseReason" placeholder="Reason for recusal (required to recuse)"
                class="mt-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-hidden focus:border-electric-blue">
            </div>
            <p v-else class="text-sm text-text-muted mb-4">You do not hold a seat and cannot vote.</p>

            <div class="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
              <span class="text-sm text-text-secondary">{{ pendingMotion.votes?.length ?? 0 }} of {{ quorum.present }} present have voted</span>
              <button v-if="isOfficer" :disabled="busy" class="ml-auto px-4 py-2 rounded-full text-sm bg-gold-accent text-space-black font-bold hover:bg-white transition-colors disabled:opacity-50"
                @click="act(() => $fetch(`/api/motions/${pendingMotion.id}/close`, { method: 'POST' }))">Close the vote</button>
            </div>
          </div>

          <div v-if="isOfficer" class="mt-4 pt-4 border-t border-white/10">
            <button :disabled="busy" class="text-xs text-text-muted hover:text-neon-pink transition-colors"
              @click="act(() => $fetch(`/api/motions/${pendingMotion.id}`, { method: 'PATCH', body: { status: 'withdrawn' } }))">Withdraw this motion</button>
          </div>
        </section>

        <!-- Motion composer -->
        <section v-if="meeting.status === 'in_progress' && mySeat" class="bg-space-gray rounded-2xl border border-white/10 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-display text-xl font-semibold">Make a Motion</h2>
            <button class="text-sm text-electric-blue hover:text-white transition-colors" @click="showMotion = !showMotion">
              {{ showMotion ? 'Cancel' : 'New motion' }}
            </button>
          </div>

          <form v-if="showMotion" @submit.prevent="makeMotion">
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Type of motion</span>
                <select v-model="motionForm.kind" class="w-full px-3 py-2 bg-space-dark border border-white/10 rounded-lg text-sm">
                  <option v-for="r in (rules as any[])" :key="r.kind" :value="r.kind">{{ r.label }}</option>
                </select>
              </label>
              <label class="block">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Agenda item</span>
                <select v-model="motionForm.agendaItemId" class="w-full px-3 py-2 bg-space-dark border border-white/10 rounded-lg text-sm">
                  <option :value="null">Not tied to an item</option>
                  <option v-for="i in agenda" :key="i.id" :value="i.id">{{ i.itemNumber }}. {{ i.title }}</option>
                </select>
              </label>
              <label class="block sm:col-span-2">
                <span class="block text-xs font-medium mb-1 text-text-secondary">Motion</span>
                <textarea v-model="motionForm.text" required rows="2" placeholder="I move that…"
                  class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-y focus:outline-hidden focus:border-electric-blue" />
              </label>
            </div>

            <p v-if="selectedRule" class="mt-2 text-xs text-text-muted">
              {{ selectedRule.help }}
              <span class="text-text-secondary">
                Needs a second: {{ selectedRule.needsSecond ? 'yes' : 'no' }} ·
                Debatable: {{ selectedRule.debatable ? 'yes' : 'no' }} ·
                Threshold: {{ selectedRule.threshold === 'two_thirds' ? 'two-thirds' : selectedRule.threshold }}
              </span>
            </p>

            <button type="submit" :disabled="busy" class="mt-3 px-5 py-2 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50">
              Move it
            </button>
          </form>
        </section>

        <!-- Record of decisions -->
        <section v-if="decidedMotions.length" class="bg-space-gray rounded-2xl border border-white/10 p-6">
          <h2 class="font-display text-xl font-semibold mb-4">Record of Votes</h2>
          <ul class="space-y-4">
            <li v-for="m in decidedMotions" :key="m.id" class="pb-4 border-b border-white/5 last:border-0 last:pb-0">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <p class="text-sm flex-1 min-w-0">{{ m.text }}</p>
                <span class="px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0"
                  :class="{
                    'bg-electric-blue/15 text-electric-blue': m.status === 'carried',
                    'bg-neon-pink/15 text-neon-pink': m.status === 'failed',
                    'bg-white/5 text-text-muted': !['carried','failed'].includes(m.status),
                  }">{{ humanize(m.status) }}</span>
              </div>
              <p v-if="m.status === 'carried' || m.status === 'failed'" class="text-xs text-text-muted mt-1.5">
                {{ m.ayes }} aye · {{ m.nays }} nay · {{ m.abstentions }} abstain
                <template v-if="m.recusals"> · {{ m.recusals }} recused</template>
                — {{ m.rule?.label }}
              </p>
              <details v-if="m.votes?.length" class="mt-2">
                <summary class="text-xs text-electric-blue cursor-pointer hover:text-white transition-colors">Roll call</summary>
                <ul class="mt-2 grid sm:grid-cols-2 gap-1">
                  <li v-for="v in m.votes" :key="v.id" class="text-xs text-text-secondary flex justify-between gap-2 px-2 py-1 rounded bg-white/[0.03]">
                    <span>{{ v.memberName }}</span>
                    <span class="capitalize" :class="{ 'text-electric-blue': v.choice === 'aye', 'text-neon-pink': v.choice === 'nay' }">{{ v.choice }}</span>
                  </li>
                </ul>
              </details>
            </li>
          </ul>
        </section>

        <!-- Minutes -->
        <section v-if="canEdit" class="bg-space-gray rounded-2xl border border-white/10 p-6">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 class="font-display text-xl font-semibold">Minutes</h2>
            <span class="px-3 py-1 rounded-full text-xs border bg-white/5 border-white/10 capitalize">{{ humanize(meeting.minutesStatus) }}</span>
          </div>

          <p v-if="meeting.minutesStatus === 'approved'" class="text-sm text-text-secondary mb-3">
            Adopted by the board. Corrections require a motion to amend something previously adopted.
          </p>

          <textarea
            v-model="minutesDraft" rows="10" :disabled="meeting.minutesStatus === 'approved'"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm resize-y focus:outline-hidden focus:border-electric-blue disabled:opacity-60"
            placeholder="Minutes of the meeting…"
          />
          <button v-if="meeting.minutesStatus !== 'approved'" :disabled="busy" class="mt-3 px-5 py-2 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50" @click="saveMinutes">
            Save draft
          </button>
        </section>
      </div>

      <!-- Roll call -->
      <aside class="space-y-6">
        <section class="bg-space-gray rounded-2xl border border-white/10 p-6 lg:sticky lg:top-24">
          <h2 class="font-display text-xl font-semibold mb-1">Roll Call</h2>
          <p class="text-sm mb-4" :class="quorum.met ? 'text-electric-blue' : 'text-neon-pink'">
            {{ quorum.present }} present of {{ quorum.required }} needed
          </p>

          <ul v-if="attendance.length" class="space-y-2">
            <li v-for="a in attendance" :key="a.id" class="text-sm">
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="truncate">{{ a.name }}</span>
                <span class="text-[10px] uppercase tracking-wide text-text-muted">{{ humanize(a.position) }}</span>
              </div>
              <div v-if="isOfficer && meeting.status === 'in_progress'" class="flex flex-wrap gap-1">
                <button
                  v-for="opt in attendanceOptions" :key="opt" :disabled="busy"
                  class="px-2 py-0.5 rounded text-[11px] border capitalize transition-colors disabled:opacity-50"
                  :class="a.status === opt
                    ? 'bg-electric-blue text-space-black border-electric-blue font-semibold'
                    : 'border-white/10 text-text-muted hover:text-white hover:border-white/30'"
                  @click="act(() => $fetch(`/api/meetings/${id}/attendance`, { method: 'POST', body: { memberId: a.memberId, status: opt } }))"
                >{{ opt }}</button>
              </div>
              <span v-else class="text-xs capitalize" :class="['present','remote','late'].includes(a.status) ? 'text-electric-blue' : 'text-text-muted'">
                {{ humanize(a.status) }}
              </span>
            </li>
          </ul>

          <p v-else class="text-sm text-text-muted">Roll is taken when the meeting is called to order.</p>
        </section>
      </aside>
    </div>
  </div>
</template>
