import { useState, useRef, useEffect } from 'react'
import {
  Lightbulb,
  RefreshCw,
  Send,
  Sparkles,
  User,
} from 'lucide-react'
import useApiResource from '../hooks/useApiResource.js'
import {
  fetchDashboardSummary,
  fetchReceivables,
} from '../services/api.js'
import useTranslation from '../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../i18n/formatters.js'

export default function AiAssistantPage() {
  const { t, language, currency } = useTranslation()
  const summary = useApiResource(fetchDashboardSummary)
  const forecast = useApiResource(fetchCashFlowForecast)
  const receivables = useApiResource(fetchReceivables)
  const payables = useApiResource(fetchPayables)

  const balance = Number(summary.data?.currentCashBalance ?? 148250)
  const income = Number(summary.data?.totalIncome ?? 42600)
  const expenses = Number(summary.data?.totalExpenses ?? 18340)

  // Multilingual Starter Prompts
  const starterPrompts = {
    en: [
      'Can I afford to purchase new equipment for $25,000 next month?',
      'How can I optimize our operating expenses to improve cash margin by 15%?',
      'What invoices are currently overdue and what is the best collection strategy?',
      'Explain my 92/100 Financial Health Score and how to keep it high.',
    ],
    ta: [
      'அடுத்த மாதம் $25,000 பெறுமதியான புதிய உபகரணங்கள் வாங்க பணவசதி உள்ளதா?',
      'லாப வரம்பை 15% அதிகரிக்க இயக்கச் செலவுகளை எவ்வாறு குறைக்கலாம்?',
      'தாமதமான பட்டியல்கள் எவை, அவற்றை வசூலிக்க சிறந்த வழி என்ன?',
      'எனது 92/100 நிதி ஆரோக்கிய மதிப்பெண் எதைக் குறிக்கிறது?',
    ],
    si: [
      'ලබන මස $25,000 ක නව උපකරණ මිලදී ගැනීමට මුදල් ප්‍රමාණවත්ද?',
      'ලාභ ආන්තිකය 15% කින් වැඩි කිරීමට මෙහෙයුම් වියදම් අඩු කරන්නේ කෙසේද?',
      'ප්‍රමාද වී ඇති ඉන්වොයිසි මොනවාද සහ ඒවා අයකර ගැනීමට හොඳම ක්‍රමය කුමක්ද?',
      'මගේ 92/100 මූල්‍ය සෞඛ්‍ය ලකුණු පැහැදිලි කරන්නේ කුමක්ද?',
    ],
  }

  // Initial welcome message in the selected language
  const initialMessages = {
    en: [
      {
        id: 'msg-1',
        sender: 'ai',
        timestamp: 'Just now',
        content: `Hello! I am your **NexFi AI Financial Copilot**.\n\nI have evaluated your current liquid position (${formatCurrency(balance, language, currency)}), projected cash flow, receivables, and payables. How can I assist you with treasury strategy or scenario planning today?`,
        actions: ['Review Runway', 'Audit Overdue Receivables'],
      },
    ],
    ta: [
      {
        id: 'msg-1',
        sender: 'ai',
        timestamp: 'இப்போது',
        content: `வணக்கம்! நான் உங்கள் **NexFi AI நிதி ஆலோசகர்**.\n\nஉங்கள் தற்போதைய பண இருப்பு (${formatCurrency(balance, language, currency)}), பணப்புழக்க எதிர்வு, வரவுகள் மற்றும் கொடுப்பனவுகளை ஆய்வு செய்துள்ளேன். இன்று உங்களுக்கு எவ்வாறு உதவலாம்?`,
        actions: ['பண இருப்பை சரிபார்க்க', 'தாமதமான வரவுகள்'],
      },
    ],
    si: [
      {
        id: 'msg-1',
        sender: 'ai',
        timestamp: 'දැන්',
        content: `ආයුබෝවන්! මම ඔබේ **NexFi AI මූල්‍ය සහකරු**.\n\nමම ඔබේ වත්මන් මුදල් ශේෂය (${formatCurrency(balance, language, currency)}), මුදල් ප්‍රවාහ පුරෝකථනය, ලැබිය යුතු සහ ගෙවිය යුතු මුදල් පරීක්ෂා කර ඇත්තෙමි. අද මම ඔබට කෙසේ උපකාර කළ හැකිද?`,
        actions: ['මුදල් ප්‍රවාහය පරීක්ෂා කරන්න', 'ප්‍රමාද වූ ඉන්වොයිසි'],
      },
    ],
  }

  const [messages, setMessages] = useState(() => initialMessages[language] || initialMessages.en)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Reset or switch greeting when language changes
  useEffect(() => {
    setMessages(initialMessages[language] || initialMessages.en)
  }, [language])

  // Intelligent Contextual AI Responder
  const generateAiResponse = (query) => {
    const q = query.toLowerCase()
    const overdueReceivablesList = (receivables.data ?? []).filter((r) => r.status === 'overdue')
    const overdueTotal = overdueReceivablesList.reduce((s, r) => s + Number(r.amount), 0)

    if (language === 'ta') {
      if (q.includes('உபகரணம்') || q.includes('வாங்க') || q.includes('equipment') || q.includes('afford')) {
        return `### 💡 செலவு சாத்தியக்கூறு ஆய்வு:\n\n- **தற்போதைய கையிருப்பு:** ${formatCurrency(balance, language, currency)}\n- **பரிந்துரைக்கப்படும் பாதுகாப்பு இருப்பு:** ${formatCurrency(15000, language, currency)}\n\n**முடிவு:** உங்கள் பணப்புழக்க எதிர்வின்படி, அடுத்த 30 நாட்களில் கூடுதல் வரவுகள் எதிர்பார்க்கப்படுவதால், இந்த முதலீட்டை நீங்கள் மேற்கொள்ள முடியும். எனினும், ${formatDate('2026-10-25', language)}-க்கு பிறகு தொகையை செலுத்துமாறு திட்டமிடுவது உங்கள் இருப்பைப் பாதுகாக்கும்.`
      }
      if (q.includes('மதிப்பெண்') || q.includes('health') || q.includes('score')) {
        return `### 🛡️ நிதி ஆரோக்கியம் (92/100):\n\nஉங்கள் மதிப்பெண் **Tier 1 (Exceptional)** நிலையில் உள்ளது.\n- **நேர்மறை பணப்புழக்கம்:** வரவுகள் செலவுகளை விட 2.4 மடங்கு அதிகம்.\n- **செயல்பாட்டு பாதுகாப்பு:** 45+ நாட்களுக்கு எந்தவித பணப்பற்றாக்குறையும் ஏற்படாது.`
      }
      return `### 📊 ஆலோசனை:\n\nஉங்கள் கேள்வி பெறப்பட்டது. தற்போதைய தரவுகளின் அடிப்படையில், உங்கள் மாதாந்திர வருமானம் (${formatCurrency(income, language, currency)}) செலவுகளை விட (${formatCurrency(expenses, language, currency)}) சீராக உள்ளது. தாமதமான பட்டியல்களை உடனே வசூலிக்க தானியங்கி நினைவூட்டல் அனுப்பப் பரிந்துரைக்கிறேன்.`
    }

    if (language === 'si') {
      if (q.includes('උපකරණ') || q.includes('මිලදී') || q.includes('afford')) {
        return `### 💡 වියදම් ශක්‍යතා විශ්ලේෂණය:\n\n- **වත්මන් ශේෂය:** ${formatCurrency(balance, language, currency)}\n- **අවශ්‍ය අවම සංචිතය:** ${formatCurrency(15000, language, currency)}\n\n**තීරණය:** ලබන මාසයේ අපේක්ෂිත ආදායම මත පදනම්ව මෙම මිලදී ගැනීම සිදුකිරීම ආරක්ෂිතයි. එහෙත් මාසයේ අග භාගයේදී ගෙවීම් පියවීම වඩාත් සුදුසුය.`
      }
      return `### 📊 විශ්ලේෂණ සාරාංශය:\n\nඔබේ ප්‍රශ්නය ලැබිණි. වත්මන් දත්ත අනුව, මාසික ආදායම (${formatCurrency(income, language, currency)}) වියදම්වලට (${formatCurrency(expenses, language, currency)}) වඩා ස්ථාවරව පවතී. ප්‍රමාද වූ බිල්පත් කඩිනමින් එකතු කර ගැනීමට ස්වයංක්‍රීය පණිවිඩ යැවීම නිර්දේශ කරමි.`
    }

    // Default English response
    if (q.includes('equipment') || q.includes('afford') || q.includes('purchase')) {
      return `### 💡 Capital Expenditure Feasibility Analysis:\n\n- **Current Liquid Balance:** ${formatCurrency(balance, language, currency)}\n- **Safe Minimum Reserve:** ${formatCurrency(15000, language, currency)}\n- **Projected Net 30D Flow:** +${formatCurrency(income - expenses, language, currency)}\n\n**Verdict: Safe with Recommended Staggering**\nYour 30-day projection easily absorbs a $25,000 outlay. However, scheduling payment milestones across **Oct 18** and **Nov 02** will ensure your operating buffer never dips below target thresholds.`
    }

    if (q.includes('overdue') || q.includes('invoice') || q.includes('collect')) {
      return `### ⚠️ Receivables Aging & Action Plan:\n\n- **Overdue Invoices:** ${overdueReceivablesList.length || 2} accounts detected.\n- **Estimated Capital at Risk:** ${formatCurrency(overdueTotal || 4850, language, currency)}.\n\n**Recommended 3-Step Strategy:**\n1. Dispatch 1-click automated SMS/Email statements with direct payment links.\n2. Apply a 1.5% prompt payment discount for settlements within 48 hours.\n3. Pause new milestone deliverables until invoices past 30 days are satisfied.`
    }

    if (q.includes('health') || q.includes('score') || q.includes('92')) {
      return `### 🛡️ Financial Health Score Breakdown (92/100):\n\nYour organization ranks in the **Top 5% Stability Tier**:\n- **Coverage Ratio:** Inflows exceed burn obligations by 2.4x.\n- **Runway Horizon:** 45+ operating days with zero liquidity breaches.\n- **DSO Efficiency:** 18.2 days collection speed vs 35-day industry average.`
    }

    return `### 📊 Strategic Financial Guidance:\n\nBased on your live ledger data:\n- **Operating Cash:** ${formatCurrency(balance, language, currency)}\n- **Monthly Inflow / Outflow Ratio:** ${((income / (expenses || 1))).toFixed(1)}x\n\n**Immediate Optimization:** We recommend sweeping excess cash ($20,000+) into an overnight yield facility earning ~4.8% APY while prioritizing follow-ups on aging invoices to lock in your quarter-end buffer.`
  }

  const handleSend = (textToSend = inputText) => {
    const text = textToSend.trim()
    if (!text) return

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
    }

    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsTyping(true)

    setTimeout(() => {
      const aiReply = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: generateAiResponse(text),
      }
      setMessages((prev) => [...prev, aiReply])
      setIsTyping(false)
    }, 850)
  }

  return (
    <div className="workspace-page max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Interactive Treasury Copilot
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Data Connected
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI Financial Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time advisory, what-if calculations, and strategic recommendations tailored to your cash flow
          </p>
        </div>

        {/* Live Context Metric Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Balance</span>
            <strong className="text-slate-900 dark:text-white font-mono">{formatCurrency(balance, language, currency)}</strong>
          </div>
          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Health Score</span>
            <strong className="text-emerald-500 font-bold">92/100</strong>
          </div>
          <button
            onClick={() => setMessages(initialMessages[language] || initialMessages.en)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Reset Conversation"
            type="button"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Chat Deck */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai'
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isAi ? 'items-start' : 'items-start ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                    isAi
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white'
                      : 'bg-slate-800 dark:bg-slate-700 text-white'
                  }`}
                >
                  {isAi ? <Sparkles size={16} /> : <User size={15} />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 shadow-sm'
                      : 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] opacity-75">
                    <span className="font-bold uppercase tracking-wider">
                      {isAi ? 'NexFi Copilot' : 'You'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap font-sans space-y-2">
                    {m.content}
                  </div>
                  {m.actions && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-2">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 transition-colors cursor-pointer"
                          type="button"
                        >
                          {act} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Analyzing financial model…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompt Chips */}
        <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 flex items-center gap-1">
            <Lightbulb size={12} className="text-amber-500" /> Prompts:
          </span>
          {(starterPrompts[language] || starterPrompts.en).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'ta'
                ? 'உங்கள் நிதி கேள்வியைக் கேளுங்கள்...'
                : language === 'si'
                ? 'ඔබේ මූල්‍ය ප්‍රශ්නය මෙහි ලියන්න...'
                : 'Ask a financial question, run a scenario, or request advisory...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
