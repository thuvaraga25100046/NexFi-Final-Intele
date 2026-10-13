// A small assistant that answers from the user's own NexFi data (balance, forecast, receivables, payables, transactions).
// Everything runs in the browser, so no data leaves the device and no API key is needed.

const has = (text, words) => words.some((word) => text.includes(word))

const KEYWORDS = {
    afford: ['afford', 'purchase', 'can i buy', 'should i buy', 'வாங்க'],
    forecast: ['forecast', 'predict', 'future', 'next 30', 'ahead', 'projection', 'month end', 'முன்னறிவிப்பு'],
    shortage: ['shortage', 'run out', 'runout', 'short of', 'negative', 'risk', 'safe', 'பற்றாக்குறை'],
    overdue: ['overdue', 'late', 'delayed'],
    upcoming: ['upcoming', 'due soon', 'due date', 'what is due', "what's due"],
    payables: ['payable', 'bill', 'vendor', 'supplier', 'i owe', 'to pay', 'செலுத்த'],
    receivables: ['receivable', 'owe me', 'owed', 'invoice', 'customer', 'collect', 'unpaid', 'பெறவேண்டி'],
    category: ['category', 'categories', 'biggest', 'top expense', 'most spend', 'where am i spending', 'where do i spend'],
    expenses: ['expense', 'spend', 'spent', 'spending', 'cost', 'outflow', 'selavu', 'செலவு'],
    income: ['income', 'earn', 'revenue', 'inflow', 'sales', 'varumanam', 'வருமான'],
    balance: ['balance', 'cash', 'how much money', 'how much do i have', 'evlo', 'evvalavu', 'இருப்பு', 'பணம்'],
    health: ['health', 'score', 'rating'],
    recent: ['recent', 'latest', 'last transaction', 'transactions', 'activity', 'history'],
    tips: ['tip', 'advice', 'suggest', 'improve', 'recommend', 'save money', 'what should i do'],
    help: ['help', 'what can you', 'options', 'menu'],
}

const MULTIPLIERS = { k: 1e3, thousand: 1e3, m: 1e6, million: 1e6, lakh: 1e5, lakhs: 1e5 }

const sum = (list) => list.reduce((total, item) => total + Number(item.amount || 0), 0)

function parseAmount(text) {
    const match = text.match(/(\d[\d,]*(?:\.\d+)?)\s*(k|m|lakhs?|million|thousand)?\b/i)
    if (!match) return null
    const value = Number(match[1].replace(/,/g, ''))
    if (!Number.isFinite(value) || value <= 0) return null
    return value * (MULTIPLIERS[(match[2] || '').toLowerCase()] || 1)
}

function pending(list) {
    return list.filter((item) => item.status !== 'paid')
}

function splitOverdue(list, today) {
    const open = pending(list).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    const overdue = open.filter((item) => item.status === 'overdue' || String(item.dueDate) < today)
    const upcoming = open.filter((item) => !overdue.includes(item))
    return { open, overdue, upcoming }
}

function describeItems(items, nameKey, ctx, limit = 3) {
    return items
        .slice(0, limit)
        .map((item) => `• ${item[nameKey] || 'Unnamed'}: ${ctx.money(item.amount)} (due ${ctx.date(item.dueDate)})`)
        .join('\n')
}

function hasAnyData(ctx) {
    return Boolean(
        ctx.balance || ctx.income || ctx.expenses || ctx.receivables.length || ctx.payables.length || ctx.transactions.length,
    )
}

const NO_DATA =
    "You don't have any records yet. Add a transaction, receivable or payable (or set your base capital) and I'll start tracking your cash flow."

function balanceReply(ctx) {
    if (!hasAnyData(ctx)) return NO_DATA
    return `Your current cash balance is ${ctx.money(ctx.balance)}.\nTotal income recorded: ${ctx.money(ctx.income)} · Total expenses: ${ctx.money(ctx.expenses)}.`
}

function incomeReply(ctx) {
    const entries = ctx.transactions.filter((item) => item.type === 'income')
    if (!entries.length && !ctx.income) return 'No income has been recorded yet. Add an income transaction and I can track it for you.'
    let reply = `Total income recorded: ${ctx.money(ctx.income)}${entries.length ? ` across ${entries.length} transaction${entries.length === 1 ? '' : 's'}` : ''}.`
    if (ctx.forecast?.expectedInflow) reply += `\nExpected inflow over the forecast period: ${ctx.money(ctx.forecast.expectedInflow)}.`
    return reply
}

function categoryReply(ctx) {
    const totals = new Map()
    ctx.transactions
        .filter((item) => item.type === 'expense')
        .forEach((item) => {
            const key = item.category || 'Other'
            totals.set(key, (totals.get(key) || 0) + Number(item.amount || 0))
        })
    if (!totals.size) return 'No expenses have been recorded yet, so there is no category breakdown to show.'
    const total = [...totals.values()].reduce((a, b) => a + b, 0)
    const lines = [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => `• ${name}: ${ctx.money(amount)} (${Math.round((amount / total) * 100)}%)`)
    return `Your biggest expense categories:\n${lines.join('\n')}`
}

function expensesReply(ctx) {
    const entries = ctx.transactions.filter((item) => item.type === 'expense')
    if (!entries.length && !ctx.expenses) return 'No expenses have been recorded yet.'
    let reply = `Total expenses recorded: ${ctx.money(ctx.expenses)}${entries.length ? ` across ${entries.length} transaction${entries.length === 1 ? '' : 's'}` : ''}.`
    if (ctx.forecast?.expectedOutflow) reply += `\nExpected outflow over the forecast period: ${ctx.money(ctx.forecast.expectedOutflow)}.`
    if (entries.length) reply += `\n\n${categoryReply(ctx)}`
    return reply
}

function forecastReply(ctx, focusShortage = false) {
    const days = ctx.forecast?.days || []
    if (!days.length) return "A forecast isn't available yet. Add a few records and I'll project your cash flow."

    const last = days[days.length - 1]
    const lowest = days.reduce((min, day) => (day.projectedBalance < min.projectedBalance ? day : min), days[0])
    const alert = ctx.forecast?.shortageAlert

    const shortageLine = alert
        ? `⚠️ A cash shortage of ${ctx.money(alert.shortageAmount)} is expected on ${ctx.date(alert.shortageDate)} (in ${alert.daysRemaining} day${alert.daysRemaining === 1 ? '' : 's'}, severity ${String(alert.severity).toLowerCase()}).`
        : `✅ No cash shortage is forecast through ${ctx.date(last.date)}.`

    const detail = [
        `Over the next ${days.length} days I expect ${ctx.money(ctx.forecast.expectedInflow || 0)} in and ${ctx.money(ctx.forecast.expectedOutflow || 0)} out.`,
        `Projected balance on ${ctx.date(last.date)}: ${ctx.money(last.projectedBalance)}.`,
        `Lowest point: ${ctx.money(lowest.projectedBalance)} on ${ctx.date(lowest.date)}.`,
    ].join('\n')

    return focusShortage ? `${shortageLine}\n\n${detail}` : `${detail}\n\n${shortageLine}`
}

function receivablesReply(ctx) {
    const { open, overdue, upcoming } = splitOverdue(ctx.receivables, ctx.today)
    if (!open.length) return 'No receivables are pending. Nobody owes you anything right now.'
    const parts = [`You're waiting on ${ctx.money(sum(open))} across ${open.length} invoice${open.length === 1 ? '' : 's'}.`]
    if (overdue.length) parts.push(`⏰ ${overdue.length} overdue (${ctx.money(sum(overdue))}):\n${describeItems(overdue, 'customerName', ctx)}`)
    if (upcoming.length) parts.push(`Next due:\n${describeItems(upcoming, 'customerName', ctx)}`)
    return parts.join('\n\n')
}

function payablesReply(ctx) {
    const { open, overdue, upcoming } = splitOverdue(ctx.payables, ctx.today)
    if (!open.length) return 'No payables are pending. You have no bills to pay right now.'
    const parts = [`You owe ${ctx.money(sum(open))} across ${open.length} bill${open.length === 1 ? '' : 's'}.`]
    if (overdue.length) parts.push(`⏰ ${overdue.length} overdue (${ctx.money(sum(overdue))}):\n${describeItems(overdue, 'vendorName', ctx)}`)
    if (upcoming.length) parts.push(`Next due:\n${describeItems(upcoming, 'vendorName', ctx)}`)
    return parts.join('\n\n')
}

function overdueReply(ctx) {
    const receivables = splitOverdue(ctx.receivables, ctx.today).overdue
    const payables = splitOverdue(ctx.payables, ctx.today).overdue
    if (!receivables.length && !payables.length) return '✅ Nothing is overdue. Your receivables and payables are on schedule.'
    const parts = []
    if (receivables.length) parts.push(`Customers overdue (${ctx.money(sum(receivables))}):\n${describeItems(receivables, 'customerName', ctx)}`)
    if (payables.length) parts.push(`Bills overdue (${ctx.money(sum(payables))}):\n${describeItems(payables, 'vendorName', ctx)}`)
    return parts.join('\n\n')
}

function upcomingReply(ctx) {
    return `${receivablesReply(ctx)}\n\n${payablesReply(ctx)}`
}

function affordReply(ctx, text) {
    const amount = parseAmount(text)
    if (!amount) return "Tell me the amount and I'll check it against your forecast. For example: \"Can I afford 50,000?\""

    const days = ctx.forecast?.days || []
    const lowest = days.length ? Math.min(...days.map((day) => day.projectedBalance)) : ctx.balance
    const after = lowest - amount
    const base = days.length ? 'your lowest projected balance' : 'your balance'

    if (amount > ctx.balance && ctx.balance >= 0) {
        return `${ctx.money(amount)} is more than your current cash balance of ${ctx.money(ctx.balance)}. After it, ${base} would be ${ctx.money(after)}, so I'd hold off unless more money comes in first.`
    }
    if (after >= 0) {
        return `Yes, it looks affordable. After spending ${ctx.money(amount)}, ${base} would still be ${ctx.money(after)}.`
    }
    return `That would be risky. After spending ${ctx.money(amount)}, ${base} would drop to ${ctx.money(after)}.`
}

function healthReply(ctx) {
    if (!ctx.healthScore) return 'Your health score is 0/100 because there is no activity yet. Add income and set your base capital to get a score.'
    const mood = ctx.healthScore >= 80 ? 'a strong position' : ctx.healthScore >= 60 ? 'a stable position' : 'room to improve'
    return `Your financial health score is ${ctx.healthScore}/100, which shows ${mood}.\nIt reflects your cash balance and income activity. Keeping a positive balance and recording regular income raises it.`
}

function recentReply(ctx) {
    const latest = [...ctx.transactions]
        .sort((a, b) => String(b.transactionDate).localeCompare(String(a.transactionDate)))
        .slice(0, 5)
    if (!latest.length) return 'No transactions yet. Use "Add Transaction" to record your first one.'
    const lines = latest.map((item) => {
        const sign = item.type === 'income' ? '+' : '-'
        return `• ${ctx.date(item.transactionDate)} · ${sign}${ctx.money(item.amount)} · ${item.category || item.description || 'Transaction'}`
    })
    return `Your latest transactions:\n${lines.join('\n')}`
}

function tipsReply(ctx) {
    const tips = []
    const receivables = splitOverdue(ctx.receivables, ctx.today)
    const payables = splitOverdue(ctx.payables, ctx.today)
    if (ctx.forecast?.shortageAlert) tips.push('A shortage is forecast: delay non-essential payments and follow up on pending receivables.')
    if (receivables.overdue.length) tips.push(`Follow up on ${receivables.overdue.length} overdue invoice${receivables.overdue.length === 1 ? '' : 's'} worth ${ctx.money(sum(receivables.overdue))}.`)
    if (payables.overdue.length) tips.push(`Settle ${payables.overdue.length} overdue bill${payables.overdue.length === 1 ? '' : 's'} to avoid penalties.`)
    if (ctx.income > 0 && ctx.expenses > ctx.income * 0.8) tips.push('Expenses are above 80% of your income. Look at your biggest expense categories.')
    if (!tips.length) tips.push('Keep recording income and expenses so the forecast stays accurate.', 'Review upcoming bills weekly to avoid surprises.')
    return `Here is what I suggest:\n${tips.slice(0, 3).map((tip) => `• ${tip}`).join('\n')}`
}

const HELP =
    'I can answer from your own data:\n• Balance, income and expenses\n• Cash flow forecast and shortage risk\n• Receivables, payables and overdue items\n• Biggest expense categories\n• "Can I afford 50,000?"\n• Recent transactions and tips'

export function buildAssistantReply(question, ctx) {
    const text = String(question || '').toLowerCase().trim()
    if (!text) return HELP

    if (/^(hi|hello|hey|hii+|vanakkam|ayubowan|good (morning|afternoon|evening))\b/.test(text) || text === 'வணக்கம்') {
        return "Hi! 👋 I'm NexFi AI. Ask me about your balance, forecast, receivables, payables, or whether you can afford a purchase."
    }
    if (has(text, KEYWORDS.afford) || (parseAmount(text) && has(text, ['buy', 'spend', 'pay']))) return affordReply(ctx, text)
    if (has(text, KEYWORDS.shortage)) return forecastReply(ctx, true)
    if (has(text, KEYWORDS.forecast)) return forecastReply(ctx)
    if (has(text, KEYWORDS.overdue)) return overdueReply(ctx)
    if (has(text, KEYWORDS.upcoming)) return upcomingReply(ctx)
    if (has(text, KEYWORDS.payables)) return payablesReply(ctx)
    if (has(text, KEYWORDS.receivables)) return receivablesReply(ctx)
    if (has(text, KEYWORDS.category)) return categoryReply(ctx)
    if (has(text, KEYWORDS.expenses)) return expensesReply(ctx)
    if (has(text, KEYWORDS.income)) return incomeReply(ctx)
    if (has(text, KEYWORDS.balance)) return balanceReply(ctx)
    if (has(text, KEYWORDS.health)) return healthReply(ctx)
    if (has(text, KEYWORDS.recent)) return recentReply(ctx)
    if (has(text, KEYWORDS.tips)) return tipsReply(ctx)
    if (has(text, KEYWORDS.help)) return HELP

    return "I'm not sure about that yet. Try asking about your balance, forecast, overdue invoices, upcoming bills, expenses, or \"Can I afford 25,000?\"."
}