<script setup lang="ts">
definePageMeta({ layout: 'board', middleware: 'board' })
useHead({ title: 'Finance' })

const { isOfficer } = useBoardUser()

const { data: summary, refresh } = await useFetch('/api/finance/summary', { default: () => null })
const { data: txns, refresh: refreshTxns } = await useFetch('/api/finance/transactions', { default: () => [] })
const { data: monthly } = await useFetch('/api/finance/monthly', { query: { months: 12 }, default: () => [] })

/** Axis ticks and labels stay compact; the table view carries exact cents. */
const usd = (cents: number) => {
  const d = Math.abs(cents) / 100
  if (d >= 1000) return `$${(d / 1000).toFixed(d >= 10000 ? 0 : 1)}K`
  return `$${d.toFixed(0)}`
}
const usdExact = (cents: number) =>
  `$${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const cashFlow = computed(() => (monthly.value as any[]).map(m => ({
  label: m.label, a: m.incomeCents, b: m.expenseCents,
})))

/** Expense categories only - mixing income in would make bar length meaningless. */
const spendByCategory = computed(() => {
  const rows = (summary.value?.byCategory ?? []).filter((c: any) => c.type === 'expense')
  return rows
    .map((c: any) => ({ label: humanize(c.category), value: Math.abs(Number(c.total)), meta: `${c.count} transaction(s)` }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 9)
})

const error = ref('')
const busy = ref(false)
const tab = ref<'overview' | 'ledger' | 'report'>('overview')

async function act(fn: () => Promise<unknown>) {
  error.value = ''; busy.value = true
  try { await fn(); await refresh(); await refreshTxns() } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

// --- Add transaction ---
const showTxn = ref(false)
const txnForm = reactive({
  accountId: null as number | null, occurredOn: new Date().toISOString().slice(0, 10),
  amount: '', type: 'expense', category: 'programs', payee: '', memo: '', reference: '', approvedByMotionId: '',
})

const incomeCategories = ['grants', 'donations', 'sponsorship', 'ticket_sales', 'merchandise', 'interest', 'other_income']
const expenseCategories = ['programs', 'events', 'marketing', 'supplies', 'travel', 'professional_fees', 'insurance', 'software', 'rent', 'stipends', 'bank_fees', 'other_expense']
const categories = computed(() => txnForm.type === 'income' ? incomeCategories : expenseCategories)
watch(() => txnForm.type, () => { txnForm.category = categories.value[0] })

async function addTxn() {
  await act(async () => {
    await $fetch('/api/finance/transactions', {
      method: 'POST',
      body: {
        ...txnForm,
        accountId: Number(txnForm.accountId),
        occurredOn: new Date(txnForm.occurredOn).toISOString(),
        approvedByMotionId: txnForm.approvedByMotionId ? Number(txnForm.approvedByMotionId) : undefined,
      },
    })
    txnForm.amount = ''; txnForm.payee = ''; txnForm.memo = ''; txnForm.reference = ''; txnForm.approvedByMotionId = ''
    showTxn.value = false
  })
}

// --- Add account ---
const showAccount = ref(false)
const acctForm = reactive({ name: '', type: 'checking', institution: '', openingBalance: '0', restrictedPurpose: '' })
async function addAccount() {
  await act(async () => {
    await $fetch('/api/finance/accounts', { method: 'POST', body: { ...acctForm } })
    acctForm.name = ''; acctForm.institution = ''; acctForm.openingBalance = '0'
    showAccount.value = false
  })
}

// --- Treasurer's report ---
const reportForm = reactive({
  periodStart: new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10),
  periodEnd: new Date().toISOString().slice(0, 10),
  narrative: '',
})
const generated = ref<any>(null)
async function generateReport() {
  error.value = ''; busy.value = true
  try {
    generated.value = await $fetch('/api/finance/report', {
      method: 'POST',
      body: {
        periodStart: new Date(reportForm.periodStart).toISOString(),
        periodEnd: new Date(reportForm.periodEnd).toISOString(),
        narrative: reportForm.narrative || undefined,
      },
    })
  } catch (e) { error.value = apiError(e) } finally { busy.value = false }
}

watch(summary, s => {
  if (s?.accounts?.length && txnForm.accountId === null) txnForm.accountId = s.accounts[0].id
}, { immediate: true })
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-3xl font-bold">Finance</h1>
        <p class="text-text-secondary text-sm mt-1">Fiscal year {{ summary?.fiscalYear }}</p>
      </div>
      <div v-if="isOfficer" class="flex flex-wrap gap-2">
        <button class="px-4 py-2 rounded-full text-sm border border-white/15 hover:border-electric-blue hover:text-electric-blue transition-colors" @click="showAccount = !showAccount">+ Account</button>
        <button class="px-5 py-2 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white transition-colors" @click="showTxn = !showTxn">+ Transaction</button>
      </div>
    </div>

    <div v-if="error" class="mb-6 px-5 py-4 rounded-xl bg-neon-pink/10 border border-neon-pink/30 text-sm text-neon-pink">{{ error }}</div>

    <!-- Headline figures -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="bg-space-gray rounded-2xl border border-white/10 p-5">
        <p class="text-xs uppercase tracking-wide text-text-muted mb-1">Total on hand</p>
        <p class="text-2xl font-bold">{{ summary?.totals?.totalFormatted ?? '$0.00' }}</p>
      </div>
      <div class="bg-space-gray rounded-2xl border border-white/10 p-5">
        <p class="text-xs uppercase tracking-wide text-text-muted mb-1">Unrestricted</p>
        <p class="text-2xl font-bold text-electric-blue">{{ summary?.totals?.unrestrictedFormatted ?? '$0.00' }}</p>
        <p class="text-[11px] text-text-muted mt-1">Excludes grant and restricted funds</p>
      </div>
      <div class="bg-space-gray rounded-2xl border border-white/10 p-5">
        <p class="text-xs uppercase tracking-wide text-text-muted mb-1">Income (FY)</p>
        <p class="text-2xl font-bold text-electric-blue">{{ summary?.totals?.incomeFormatted ?? '$0.00' }}</p>
      </div>
      <div class="bg-space-gray rounded-2xl border border-white/10 p-5">
        <p class="text-xs uppercase tracking-wide text-text-muted mb-1">Spent (FY)</p>
        <p class="text-2xl font-bold text-neon-pink">{{ summary?.totals?.expenseFormatted ?? '$0.00' }}</p>
      </div>
    </div>

    <!-- Forms -->
    <form v-if="showAccount" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-6" @submit.prevent="addAccount">
      <h2 class="font-display text-lg font-semibold mb-4">Add an account</h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block"><span class="block text-sm mb-1.5">Name</span>
          <input v-model="acctForm.name" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Type</span>
          <select v-model="acctForm.type" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="t in ['checking','savings','grant','restricted','petty_cash','reserve']" :key="t" :value="t">{{ humanize(t) }}</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Institution</span>
          <input v-model="acctForm.institution" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Opening balance</span>
          <input v-model="acctForm.openingBalance" placeholder="0.00" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
      </div>
      <button type="submit" :disabled="busy" class="mt-5 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">Create account</button>
    </form>

    <form v-if="showTxn" class="bg-space-gray rounded-2xl border border-white/10 p-6 mb-6" @submit.prevent="addTxn">
      <h2 class="font-display text-lg font-semibold mb-4">Record a transaction</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <label class="block"><span class="block text-sm mb-1.5">Account</span>
          <select v-model="txnForm.accountId" required class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="a in summary?.accounts ?? []" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Date</span>
          <input v-model="txnForm.occurredOn" type="date" required class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Amount</span>
          <input v-model="txnForm.amount" required placeholder="125.00" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Type</span>
          <select v-model="txnForm.type" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option value="expense">Expense</option><option value="income">Income</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Category</span>
          <select v-model="txnForm.category" class="w-full px-4 py-2.5 bg-space-dark border border-white/10 rounded-xl">
            <option v-for="c in categories" :key="c" :value="c">{{ humanize(c) }}</option>
          </select></label>
        <label class="block"><span class="block text-sm mb-1.5">Payee</span>
          <input v-model="txnForm.payee" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block sm:col-span-2"><span class="block text-sm mb-1.5">Memo</span>
          <input v-model="txnForm.memo" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Approving motion #</span>
          <input v-model="txnForm.approvedByMotionId" type="number" placeholder="required over $500" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
      </div>
      <p class="mt-3 text-xs text-text-muted">Expenses of $500 or more must cite a motion that carried. Enter the amount as a positive number; the sign follows the type.</p>
      <button type="submit" :disabled="busy" class="mt-4 px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50">Record</button>
    </form>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 border-b border-white/10">
      <button v-for="t in (['overview','ledger','report'] as const)" :key="t"
        class="px-4 py-2 text-sm capitalize border-b-2 -mb-px transition-colors"
        :class="tab === t ? 'border-electric-blue text-electric-blue' : 'border-transparent text-text-secondary hover:text-white'"
        @click="tab = t">{{ t === 'report' ? "Treasurer's report" : t }}</button>
    </div>

    <!-- Overview -->
    <div v-if="tab === 'overview'" class="space-y-6">
      <ChartsChartCard
        title="Income and spending by month"
        subtitle="Both series are dollars on one shared axis"
        :legend="[
          { label: 'Income', color: 'var(--color-viz-1)' },
          { label: 'Spending', color: 'var(--color-viz-4)' },
        ]"
      >
        <ChartsColumnsGrouped
          :data="cashFlow" series-a="Income" series-b="Spending" :format="usd"
          color-a="var(--color-viz-1)" color-b="var(--color-viz-4)"
        />
        <template #table>
          <table class="w-full text-sm min-w-[420px]">
            <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
              <tr><th class="text-left py-2 pr-4">Month</th><th class="text-right py-2 pr-4">Income</th><th class="text-right py-2 pr-4">Spending</th><th class="text-right py-2">Net</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="m in (monthly as any[])" :key="m.key">
                <td class="py-2 pr-4 text-text-secondary">{{ m.label }}</td>
                <td class="py-2 pr-4 text-right tabular-nums">{{ m.incomeFormatted }}</td>
                <td class="py-2 pr-4 text-right tabular-nums">{{ m.expenseFormatted }}</td>
                <td class="py-2 text-right tabular-nums" :class="m.netCents >= 0 ? 'text-electric-blue' : 'text-neon-pink'">{{ usdExact(m.netCents) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </ChartsChartCard>

      <div class="grid gap-6 lg:grid-cols-2">
      <ChartsChartCard
        v-if="spendByCategory.length"
        title="Where the money went"
        subtitle="Fiscal year to date, largest first"
      >
        <ChartsBarsH :data="spendByCategory" :format="usd" />
        <template #table>
          <table class="w-full text-sm">
            <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
              <tr><th class="text-left py-2 pr-4">Category</th><th class="text-right py-2">Spent</th></tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="c in spendByCategory" :key="c.label">
                <td class="py-2 pr-4 text-text-secondary">{{ c.label }}</td>
                <td class="py-2 text-right tabular-nums">{{ usdExact(c.value) }}</td>
              </tr>
            </tbody>
          </table>
        </template>
      </ChartsChartCard>

      <section class="bg-space-gray rounded-2xl border border-white/10 p-5 sm:p-6 lg:col-span-2">
        <h2 class="font-display text-lg font-semibold mb-4">Accounts</h2>
        <ul v-if="summary?.accounts?.length" class="divide-y divide-white/5">
          <li v-for="a in summary.accounts" :key="a.id" class="py-3 flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-sm">{{ a.name }}</p>
              <p class="text-xs text-text-muted capitalize">
                {{ humanize(a.type) }}<template v-if="a.institution"> · {{ a.institution }}</template>
              </p>
              <p v-if="a.restrictedPurpose" class="text-xs text-gold-accent mt-0.5">Restricted: {{ a.restrictedPurpose }}</p>
            </div>
            <span class="font-semibold shrink-0">{{ a.balanceFormatted }}</span>
          </li>
        </ul>
        <p v-else class="py-6 text-center text-text-muted text-sm">No accounts yet.</p>
      </section>

      <ChartsChartCard title="Budget vs actual" subtitle="Adopted budget for the fiscal year" :has-table="false">
        <ul v-if="summary?.budgetVsActual?.length" class="space-y-4">
          <li v-for="b in summary.budgetVsActual" :key="`${b.kind}-${b.category}`">
            <ChartsMeterRow
              :label="humanize(b.category)" :value="b.actualCents" :limit="b.budgetedCents"
              :format="usdExact" :over="b.overBudget"
            />
          </li>
        </ul>
        <p v-else class="py-6 text-center text-text-muted text-sm">No budget adopted for this fiscal year.</p>
      </ChartsChartCard>
      </div>
    </div>

    <!-- Ledger -->
    <section v-else-if="tab === 'ledger'" class="bg-space-gray rounded-2xl border border-white/10 p-6">
      <h2 class="font-display text-xl font-semibold mb-4">Ledger</h2>
      <div v-if="(txns as any[]).length" class="overflow-x-auto">
        <table class="w-full text-sm min-w-[640px]">
          <thead class="text-xs uppercase tracking-wide text-text-muted border-b border-white/10">
            <tr><th class="text-left py-2 pr-4">Date</th><th class="text-left py-2 pr-4">Payee / Memo</th><th class="text-left py-2 pr-4">Category</th><th class="text-left py-2 pr-4">Account</th><th class="text-right py-2">Amount</th></tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="t in (txns as any[])" :key="t.id">
              <td class="py-2.5 pr-4 whitespace-nowrap text-text-secondary">{{ formatDate(t.occurredOn) }}</td>
              <td class="py-2.5 pr-4">
                <div>{{ t.payee || '—' }}</div>
                <div v-if="t.memo" class="text-xs text-text-muted">{{ t.memo }}</div>
                <div v-if="t.approvedByMotionId" class="text-xs text-electric-blue">Motion #{{ t.approvedByMotionId }}</div>
              </td>
              <td class="py-2.5 pr-4 text-text-secondary capitalize">{{ humanize(t.category) }}</td>
              <td class="py-2.5 pr-4 text-text-muted">{{ t.accountName }}</td>
              <td class="py-2.5 text-right font-medium whitespace-nowrap" :class="t.amountCents >= 0 ? 'text-electric-blue' : 'text-neon-pink'">{{ t.formatted }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="py-8 text-center text-text-muted text-sm">No transactions recorded.</p>
    </section>

    <!-- Treasurer's report -->
    <section v-else class="bg-space-gray rounded-2xl border border-white/10 p-6">
      <h2 class="font-display text-xl font-semibold mb-2">Treasurer's Report</h2>
      <p class="text-sm text-text-secondary mb-5">Figures are snapshotted when generated, so a report the board has accepted will not change if a back-dated transaction is entered later.</p>

      <div class="grid gap-4 sm:grid-cols-3">
        <label class="block"><span class="block text-sm mb-1.5">Period start</span>
          <input v-model="reportForm.periodStart" type="date" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <label class="block"><span class="block text-sm mb-1.5">Period end</span>
          <input v-model="reportForm.periodEnd" type="date" class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"></label>
        <div class="flex items-end">
          <button :disabled="busy" class="w-full px-6 py-2.5 rounded-full bg-electric-blue text-space-black font-bold text-sm hover:bg-white disabled:opacity-50" @click="generateReport">Generate</button>
        </div>
      </div>

      <div v-if="generated" class="mt-6 pt-6 border-t border-white/10">
        <dl class="grid gap-4 sm:grid-cols-4">
          <div><dt class="text-xs uppercase tracking-wide text-text-muted">Opening</dt><dd class="text-lg font-semibold">{{ generated.formatted.opening }}</dd></div>
          <div><dt class="text-xs uppercase tracking-wide text-text-muted">Income</dt><dd class="text-lg font-semibold text-electric-blue">{{ generated.formatted.income }}</dd></div>
          <div><dt class="text-xs uppercase tracking-wide text-text-muted">Expenses</dt><dd class="text-lg font-semibold text-neon-pink">{{ generated.formatted.expense }}</dd></div>
          <div><dt class="text-xs uppercase tracking-wide text-text-muted">Closing</dt><dd class="text-lg font-semibold">{{ generated.formatted.closing }}</dd></div>
        </dl>
        <p class="text-xs text-text-muted mt-4">{{ generated.transactionCount }} transaction(s) in period. Present this at the meeting under Treasurer's Report and move to receive and file it.</p>
      </div>
    </section>
  </div>
</template>
