import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, SendHorizontal } from 'lucide-react'
import useTranslation from '../../i18n/useTranslation.js'
import { formatCurrency, formatDate } from '../../i18n/formatters.js'
import {
    fetchPayables,
    fetchReceivables,
    fetchTransactions,
    RESOURCE_CHANGED_EVENT,
} from '../../services/api.js'
import { buildAssistantReply } from '../../services/aiAssistant.js'

const GREETING =
    "Hi! 👋 I'm NexFi AI. Ask me about your balance, cash flow forecast, receivables or payables, or whether you can afford a purchase."

const SUGGESTIONS = ['My balance', 'Cash flow forecast', 'Overdue items', 'Can I afford 25,000?']

const toList = (value) => (Array.isArray(value) ? value : [])

export default function AiChatCard({ healthScore = 0, balance = 0, income = 0, expenses = 0, forecast = null }) {
    const { t, language, currency } = useTranslation()
    const [records, setRecords] = useState({ receivables: [], payables: [], transactions: [] })
    const [messages, setMessages] = useState([{ id: 0, role: 'assistant', text: GREETING }])
    const [input, setInput] = useState('')
    const [typing, setTyping] = useState(false)
    const scrollRef = useRef(null)
    const timerRef = useRef(null)
    const nextId = useRef(1)

    const loadRecords = useCallback(async () => {
        try {
            const [receivables, payables, transactions] = await Promise.all([
                fetchReceivables(),
                fetchPayables(),
                fetchTransactions(),
            ])
            setRecords({
                receivables: toList(receivables),
                payables: toList(payables),
                transactions: toList(transactions),
            })
        } catch {
            // The assistant simply answers with whatever data it already has
        }
    }, [])

    useEffect(() => {
        loadRecords()
        window.addEventListener(RESOURCE_CHANGED_EVENT, loadRecords)
        return () => window.removeEventListener(RESOURCE_CHANGED_EVENT, loadRecords)
    }, [loadRecords])

    // Always answer with the newest numbers, even if they changed while the assistant was "typing"
    const latest = useRef({})
    latest.current = { healthScore, balance, income, expenses, forecast, records, language, currency }

    useEffect(() => () => clearTimeout(timerRef.current), [])

    useEffect(() => {
        const box = scrollRef.current
        if (box) box.scrollTop = box.scrollHeight
    }, [messages, typing])

    const send = (rawText) => {
        const text = rawText.trim()
        if (!text || typing) return

        setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text }])
        setInput('')
        setTyping(true)

        timerRef.current = setTimeout(() => {
            const data = latest.current
            const reply = buildAssistantReply(text, {
                balance: data.balance,
                income: data.income,
                expenses: data.expenses,
                healthScore: data.healthScore,
                forecast: data.forecast,
                receivables: data.records.receivables,
                payables: data.records.payables,
                transactions: data.records.transactions,
                today: new Date().toLocaleDateString('en-CA'),
                money: (amount) => formatCurrency(Number(amount) || 0, data.language, data.currency),
                date: (value) => (value ? formatDate(value, data.language) : 'an unknown date'),
            })
            setMessages((prev) => [...prev, { id: nextId.current++, role: 'assistant', text: reply }])
            setTyping(false)
        }, 550)
    }

    return (
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/40 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                        <Bot size={17} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t('dashboard.aiTitle')}</h2>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">{t('dashboard.aiTier')}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-slate-950 dark:text-white">{healthScore}</span>
                    <span className="text-xs font-bold text-slate-500">/100</span>
                </div>
            </div>

            {/* Conversation */}
            <div
                ref={scrollRef}
                role="log"
                aria-live="polite"
                aria-label="AI chat"
                className="flex-1 min-h-[190px] max-h-[260px] overflow-y-auto space-y-2.5 pr-1"
            >
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[88%] px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line rounded-2xl ${
                                message.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-md font-semibold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md font-medium'
                            }`}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-slate-100 dark:bg-slate-800 flex items-center gap-1" aria-label="NexFi AI is typing">
                            {[0, 1, 2].map((dot) => (
                                <span
                                    key={dot}
                                    className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                                    style={{ animationDelay: `${dot * 150}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick questions */}
            <div className="flex flex-wrap gap-1.5 mt-3">
                {SUGGESTIONS.map((suggestion) => (
                    <button
                        key={suggestion}
                        type="button"
                        onClick={() => send(suggestion)}
                        disabled={typing}
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>

            {/* Message box */}
            <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(event) => {
                    event.preventDefault()
                    send(input)
                }}
            >
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about your cash flow…"
                    aria-label="Ask NexFi AI"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || typing}
                    aria-label="Send message"
                    className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendHorizontal size={16} />
                </button>
            </form>

            <Link
                to="/ai-assistant"
                className="mt-3 w-full py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
                <span>{t('dashboard.askAiCopilotCta')}</span>
                <ArrowRight size={14} />
            </Link>
        </div>
    )
}