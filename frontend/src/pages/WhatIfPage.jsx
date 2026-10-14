import { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, Lightbulb, LoaderCircle, Sparkles, Wallet } from 'lucide-react'
import useApiResource from '../hooks/useApiResource.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'
import useTranslation from '../i18n/useTranslation.js'
import { fetchCashFlowForecast, fetchReceivables } from '../services/api.js'
import { buildScenarioForecast } from '../services/scenarioForecast.js'

const COPY = {
  en: {
    eyebrow: 'PLAN BEFORE IT HAPPENS',
    title: 'What-If Simulator',
    subtitle: 'Test a payment delay or a new expense against your recorded 90-day cash-flow forecast.',
    delay: 'Delay an incoming payment',
    expense: 'Add a one-time expense',
    receivable: 'Choose a pending receivable',
    noReceivables: 'No pending receivables are available. Add one first to test a payment delay.',
    delayDays: 'Delay payment by',
    days: 'days',
    expenseAmount: 'Expense amount',
    expenseDay: 'Pay after',
    amountPlaceholder: 'Enter amount',
    baseline: 'Current forecast ending balance',
    scenarioEnding: 'Scenario ending balance',
    lowest: 'Lowest balance in this scenario',
    on: 'on',
    impact: '90-day cash balance',
    baselineLegend: 'Current forecast',
    scenarioLegend: 'What-if scenario',
    action: 'What this means',
    risk: (date, amount) => `Your projected cash goes below zero on ${date}, reaching ${amount}. Consider following up on collections or rescheduling a payment.`,
    safe: 'This scenario keeps the projected balance above zero across the forecast. Review the assumptions before making a financial decision.',
    note: 'Scenario only — this does not change or save your financial records. Forecasts depend on the dates and amounts you have recorded.',
    loading: 'Loading your forecast and pending receivables…',
    missing: 'A 90-day forecast is not available yet. Add financial records and try again.',
    error: 'Could not load the data required for this simulation.',
    enterValid: 'Enter an expense above zero, or choose a pending receivable to run the comparison.',
    pending: 'Pending',
  },
  ta: {
    eyebrow: 'நடப்பதற்கு முன் திட்டமிடுங்கள்',
    title: 'What-If Simulator',
    subtitle: 'பதிவுசெய்த 90 நாள் பணப்புழக்க முன்னறிவிப்பில் பணம் தாமதம் அல்லது புதிய செலவைச் சோதியுங்கள்.',
    delay: 'வரவேண்டிய தொகை தாமதம்',
    expense: 'ஒருமுறை செலவைச் சேர்க்கவும்',
    receivable: 'நிலுவையில் உள்ள வரவைத் தேர்ந்தெடுக்கவும்',
    noReceivables: 'நிலுவையில் வரவுகள் இல்லை. தாமதத்தைச் சோதிக்க முதலில் ஒன்றைச் சேர்க்கவும்.',
    delayDays: 'பணம் தாமதமாகும் நாட்கள்',
    days: 'நாட்கள்',
    expenseAmount: 'செலவுத் தொகை',
    expenseDay: 'செலுத்தும் நாள்',
    amountPlaceholder: 'தொகையை உள்ளிடவும்',
    baseline: 'தற்போதைய முன்னறிவிப்பு முடிவு இருப்பு',
    scenarioEnding: 'இந்த சூழ்நிலையின் முடிவு இருப்பு',
    lowest: 'இந்த சூழ்நிலையின் குறைந்தபட்ச இருப்பு',
    on: 'தேதி',
    impact: '90 நாள் பண இருப்பு',
    baselineLegend: 'தற்போதைய முன்னறிவிப்பு',
    scenarioLegend: 'What-if சூழ்நிலை',
    action: 'இதன் பொருள்',
    risk: (date, amount) => `${date} அன்று உங்கள் கணிக்கப்பட்ட பண இருப்பு பூஜ்ஜியத்திற்குக் கீழே சென்று ${amount} ஆகும். வரவுகளைப் பின்தொடர்வது அல்லது கட்டணத்தை மாற்றுவது குறித்து பரிசீலிக்கவும்.`,
    safe: 'இந்த சூழ்நிலையில் முன்னறிவிப்பு காலம் முழுவதும் இருப்பு பூஜ்ஜியத்திற்கும் மேலாக உள்ளது. முடிவெடுக்கும் முன் கருதுகோள்களைச் சரிபார்க்கவும்.',
    note: 'இது ஒரு கணிப்பு மட்டுமே; உங்கள் நிதிப் பதிவுகள் மாற்றப்படவோ சேமிக்கப்படவோ மாட்டாது. பதிவுசெய்த தேதிகள் மற்றும் தொகைகளின் அடிப்படையில் முன்னறிவிப்பு அமையும்.',
    loading: 'உங்கள் முன்னறிவிப்பு மற்றும் நிலுவை வரவுகள் ஏற்றப்படுகின்றன…',
    missing: '90 நாள் முன்னறிவிப்பு கிடைக்கவில்லை. நிதிப் பதிவுகளைச் சேர்த்து மீண்டும் முயற்சிக்கவும்.',
    error: 'இந்த கணிப்புக்குத் தேவையான தரவை ஏற்ற முடியவில்லை.',
    enterValid: 'ஒப்பீட்டை இயக்க பூஜ்ஜியத்தை விட அதிகமான செலவை உள்ளிடவும் அல்லது நிலுவை வரவைத் தேர்ந்தெடுக்கவும்.',
    pending: 'நிலுவையில்',
  },
  si: {
    eyebrow: 'සිදුවීමට පෙර සැලසුම් කරන්න',
    title: 'What-If Simulator',
    subtitle: 'වාර්තා කළ දින 90ක මුදල් ප්‍රවාහ පුරෝකථනයට ගෙවීම් ප්‍රමාදයක් හෝ නව වියදමක් බලපාන ආකාරය බලන්න.',
    delay: 'ලැබීමක් ප්‍රමාද කරන්න',
    expense: 'එක්වර වියදමක් එක් කරන්න',
    receivable: 'හිඟ ලැබීමක් තෝරන්න',
    noReceivables: 'හිඟ ලැබීම් නැත. ගෙවීම් ප්‍රමාදයක් පරීක්ෂා කිරීමට පළමුව ලැබීමක් එක් කරන්න.',
    delayDays: 'ප්‍රමාද වන දින ගණන',
    days: 'දින',
    expenseAmount: 'වියදම් මුදල',
    expenseDay: 'ගෙවන දිනය',
    amountPlaceholder: 'මුදල ඇතුළත් කරන්න',
    baseline: 'වත්මන් පුරෝකථන අවසන් ශේෂය',
    scenarioEnding: 'මෙම තත්ත්වයේ අවසන් ශේෂය',
    lowest: 'මෙම තත්ත්වයේ අඩුම ශේෂය',
    on: 'දිනය',
    impact: 'දින 90ක මුදල් ශේෂය',
    baselineLegend: 'වත්මන් පුරෝකථනය',
    scenarioLegend: 'What-if තත්ත්වය',
    action: 'මෙයින් අදහස් වන්නේ',
    risk: (date, amount) => `${date} දින ඔබේ පුරෝකථන මුදල් ශේෂය බිංදුවට පහළ ගොස් ${amount} දක්වා අඩු වේ. ලැබීම් පසු විපරම් කිරීම හෝ ගෙවීමක් නැවත සැලසුම් කිරීම සලකා බලන්න.`,
    safe: 'මෙම තත්ත්වය තුළ පුරෝකථනය කළ ශේෂය මුළු කාලය පුරාම බිංදුවට ඉහළින් පවතී. තීරණයක් ගැනීමට පෙර උපකල්පන පරීක්ෂා කරන්න.',
    note: 'මෙය අනුකරණයක් පමණි; ඔබේ මූල්‍ය වාර්තා වෙනස් කිරීමක් හෝ සුරැකීමක් සිදු නොවේ. පුරෝකථනය වාර්තා කළ දින සහ මුදල් මත රඳා පවතී.',
    loading: 'ඔබේ පුරෝකථනය සහ හිඟ ලැබීම් පූරණය වෙමින්…',
    missing: 'දින 90ක පුරෝකථනයක් තවම නොමැත. මූල්‍ය වාර්තා එක් කර නැවත උත්සාහ කරන්න.',
    error: 'මෙම අනුකරණයට අවශ්‍ය දත්ත පූරණය කළ නොහැකි විය.',
    enterValid: 'සැසඳීම ක්‍රියාත්මක කිරීමට බිංදුවට වඩා වැඩි වියදමක් ඇතුළත් කරන්න, නැතහොත් හිඟ ලැබීමක් තෝරන්න.',
    pending: 'හිඟයි',
  },
}

const isPending = (record) => !['paid', 'received'].includes(String(record.status).toLowerCase())

function projectPoints(comparison, key, min, range) {
  return comparison.map((point, index) => {
    const x = 12 + (index / Math.max(1, comparison.length - 1)) * 756
    const y = 196 - ((point[key] - min) / range) * 176
    return `${x},${y}`
  }).join(' ')
}

export default function WhatIfPage() {
  const { language, currency } = useTranslation()
  const copy = COPY[language] || COPY.en
  const [type, setType] = useState('expense')
  const [selectedId, setSelectedId] = useState('')
  const [delayDays, setDelayDays] = useState(7)
  const [expenseAmount, setExpenseAmount] = useState('25000')
  const [expenseDay, setExpenseDay] = useState(14)
  const fetch90DayForecast = useCallback(
    (signal) => fetchCashFlowForecast({ signal, params: { days: 90 } }),
    [],
  )
  const forecast = useApiResource(fetch90DayForecast)
  const receivables = useApiResource(fetchReceivables)
  const pendingReceivables = useMemo(
    () => (Array.isArray(receivables.data) ? receivables.data.filter(isPending) : []),
    [receivables.data],
  )
  const selectedReceivable = pendingReceivables.find((record) => String(record.id) === selectedId)
    || pendingReceivables[0]
  const scenario = useMemo(() => {
    if (!forecast.data?.days?.length) return null
    if (type === 'expense' && (!Number.isFinite(Number(expenseAmount)) || Number(expenseAmount) <= 0)) return null
    if (type === 'delay-receivable' && !selectedReceivable) return null
    return buildScenarioForecast(forecast.data, type === 'expense'
      ? { type, amount: expenseAmount, day: expenseDay }
      : { type, receivable: selectedReceivable, delayDays })
  }, [forecast.data, type, expenseAmount, expenseDay, selectedReceivable, delayDays])

  const hasError = Boolean(forecast.error || receivables.error)
  const loading = forecast.loading || receivables.loading
  const money = (amount) => formatCurrency(amount, language, currency)

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 py-28 text-sm text-slate-500" role="status">
        <LoaderCircle className="animate-spin text-indigo-500" size={20} />
        {copy.loading}
      </div>
    )
  }

  if (hasError || !forecast.data?.days?.length) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100" role="alert">
        <h1 className="font-bold">{copy.title}</h1>
        <p className="mt-2 text-sm">{hasError ? copy.error : copy.missing}</p>
        {(forecast.error || receivables.error) && (
          <p className="mt-2 text-xs opacity-80">{forecast.error || receivables.error}</p>
        )}
      </section>
    )
  }

  const values = scenario?.comparison.flatMap(({ baseline, scenario: projected }) => [baseline, projected]) ?? []
  const min = Math.min(0, ...values)
  const max = Math.max(0, ...values)
  const range = Math.max(1, max - min)
  const zeroY = 196 - ((0 - min) / range) * 176
  const baselinePoints = scenario ? projectPoints(scenario.comparison, 'baseline', min, range) : ''
  const scenarioPoints = scenario ? projectPoints(scenario.comparison, 'scenario', min, range) : ''
  const endDate = scenario?.comparison[scenario.comparison.length - 1].date
  const delayMode = type === 'delay-receivable'
  const advice = scenario?.firstShortage
    ? copy.risk(formatDate(scenario.firstShortage.date, language), money(scenario.firstShortage.scenario))
    : copy.safe

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <header className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-violet-100 p-6 shadow-sm dark:border-indigo-900/60 dark:from-slate-900 dark:via-indigo-950/50 dark:to-violet-950/40 sm:p-8">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">
          <Sparkles size={14} /> {copy.eyebrow}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{copy.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{copy.subtitle}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{copy.action}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={delayMode}
              onClick={() => setType('delay-receivable')}
              disabled={!pendingReceivables.length}
              className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${delayMode ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200' : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'}`}
            >
              <CalendarClock className="mb-2" size={17} />{copy.delay}
            </button>
            <button
              type="button"
              aria-pressed={!delayMode}
              onClick={() => setType('expense')}
              className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition-colors ${!delayMode ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200' : 'border-slate-200 text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300'}`}
            >
              <Wallet className="mb-2" size={17} />{copy.expense}
            </button>
          </div>

          {delayMode ? (
            <div className="mt-5 space-y-4">
              {pendingReceivables.length ? (
                <>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="what-if-receivable">{copy.receivable}</label>
                  <select
                    id="what-if-receivable"
                    value={String(selectedReceivable?.id ?? '')}
                    onChange={(event) => setSelectedId(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {pendingReceivables.map((record) => (
                      <option key={record.id} value={String(record.id)}>
                        {record.customerName || record.clientName || record.description || copy.pending} · {money(record.amount)} · {formatDate(String(record.dueDate).slice(0, 10), language)}
                      </option>
                    ))}
                  </select>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="what-if-delay">{copy.delayDays}: <span className="text-indigo-600 dark:text-indigo-300">{delayDays} {copy.days}</span></label>
                  <input id="what-if-delay" type="range" min="1" max="60" step="1" value={delayDays} onChange={(event) => setDelayDays(Number(event.target.value))} className="w-full accent-indigo-600" />
                </>
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{copy.noReceivables}</p>
              )}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="what-if-expense">{copy.expenseAmount}</label>
              <input id="what-if-expense" type="number" min="0.01" step="0.01" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} placeholder={copy.amountPlaceholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200" htmlFor="what-if-expense-day">{copy.expenseDay}: <span className="text-indigo-600 dark:text-indigo-300">{expenseDay} {copy.days}</span></label>
              <input id="what-if-expense-day" type="range" min="1" max={forecast.data.days.length} step="1" value={expenseDay} onChange={(event) => setExpenseDay(Number(event.target.value))} className="w-full accent-indigo-600" />
            </div>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
            <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-500" />{copy.note}
          </p>
        </div>

        <div className="space-y-6">
          {scenario ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label={copy.baseline} value={money(scenario.baselineClosing)} icon={ArrowUpRight} />
                <Metric label={copy.scenarioEnding} value={money(scenario.scenarioClosing)} icon={delayMode ? CalendarClock : ArrowDownRight} />
                <Metric label={copy.lowest} value={money(scenario.scenarioLowest.amount)} detail={`${copy.on} ${formatDate(scenario.scenarioLowest.date, language)}`} icon={scenario.scenarioLowest.amount < 0 ? AlertTriangle : Wallet} warning={scenario.scenarioLowest.amount < 0} />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">{copy.impact}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(scenario.comparison[0].date, language)} — {formatDate(endDate, language)}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] font-semibold text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 rounded bg-slate-400" />{copy.baselineLegend}</span>
                    <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-4 rounded bg-indigo-500" />{copy.scenarioLegend}</span>
                  </div>
                </div>
                <div className="mt-4 overflow-hidden">
                  <svg viewBox="0 0 780 220" className="h-56 w-full" role="img" aria-label={`${copy.impact}: ${copy.baselineLegend} and ${copy.scenarioLegend}`}>
                    {[0, 0.5, 1].map((ratio) => {
                      const y = 20 + ratio * 176
                      return <line key={ratio} x1="12" x2="768" y1={y} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 5" />
                    })}
                    {min < 0 && max > 0 && <line x1="12" x2="768" y1={zeroY} y2={zeroY} stroke="#f87171" strokeDasharray="5 5" />}
                    <polyline points={baselinePoints} fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={scenarioPoints} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </section>

              <section className={`rounded-2xl border p-5 ${scenario.firstShortage ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30' : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/25'}`} role="status">
                <h2 className={`flex items-center gap-2 text-sm font-extrabold ${scenario.firstShortage ? 'text-rose-800 dark:text-rose-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                  {scenario.firstShortage ? <AlertTriangle size={17} /> : <Sparkles size={17} />}{copy.action}
                </h2>
                <p className={`mt-2 text-xs leading-5 ${scenario.firstShortage ? 'text-rose-800/90 dark:text-rose-100/90' : 'text-emerald-800/90 dark:text-emerald-100/90'}`}>{advice}</p>
              </section>
            </>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300" role="status">{copy.enterValid}</p>
          )}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, icon: Icon, detail, warning = false }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${warning ? 'border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/90'}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold leading-4 text-slate-500 dark:text-slate-400">{label}</span>
        <Icon size={16} className={warning ? 'shrink-0 text-rose-500' : 'shrink-0 text-indigo-500'} />
      </div>
      <strong className={`mt-3 block break-words text-lg font-black tracking-tight ${warning ? 'text-rose-700 dark:text-rose-200' : 'text-slate-950 dark:text-white'}`}>{value}</strong>
      {detail && <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">{detail}</span>}
    </article>
  )
}
