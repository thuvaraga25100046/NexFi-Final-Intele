import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Flame,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'

function HealthRadialGauge({ score = 92 }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
        {/* Track */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-800/80"
          strokeWidth="9"
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="url(#aiGaugeGrad)"
          strokeWidth="9"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
        />
        <defs>
          <linearGradient id="aiGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
          {score}
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          / 100
        </span>
        <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider mt-1 px-1.5 py-0.5 bg-emerald-500/10 rounded-full">
          Tier 1
        </span>
      </div>
    </div>
  )
}

export default function AiInsightsPanel({ onOpenSimulator, onOpenGuidance }) {
  const [activeTab, setActiveTab] = useState('insights')
  const [copiedNotification, setCopiedNotification] = useState(false)

  const insights = [
    {
      id: 'stable',
      type: 'positive',
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      title: 'Cash flow remains stable',
      desc: 'Inflows comfortably exceed projected monthly obligations by 2.4x with zero liquidity strains.',
      tag: 'Optimized',
    },
    {
      id: 'no-shortage',
      type: 'positive',
      icon: ShieldCheck,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
      title: 'No shortage predicted this month',
      desc: '30-day forward simulations maintain a healthy buffer above the minimum safety threshold ($15,000).',
      tag: 'Safe',
    },
    {
      id: 'invoices',
      type: 'warning',
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      title: '3 invoices require follow up',
      desc: 'Totaling $4,850 in receivables aging past 20 days. Auto-generated reminder drafts are queued.',
      tag: 'Action Required',
      action: 'Send Reminders',
    },
    {
      id: 'expenses',
      type: 'caution',
      icon: Flame,
      color: '#f43f5e',
      bg: 'rgba(244, 63, 94, 0.1)',
      title: 'Expenses increased by 12%',
      desc: 'Concentrated in cloud computing infrastructure & marketing ad spend over the trailing 14 days.',
      tag: 'Monitoring',
    },
  ]

  const handleCopyBrief = () => {
    setCopiedNotification(true)
    setTimeout(() => setCopiedNotification(false), 2500)
  }

  return (
    <section aria-label="AI Intelligence Panel" className="w-full mb-6">
      <div className="fintech-ai-panel">
        <div className="fintech-ai-pulse-bar" />

        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 p-[1px] flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center text-teal-300">
                <Sparkles size={20} className="animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  NexFi Intelligence Core
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  v4.2 Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autonomous real-time cash flow optimization engine & anomaly detection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenGuidance}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <Bot size={14} className="text-indigo-400" />
              <span>Ask Copilot</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              type="button"
            >
              <Zap size={14} />
              <span>Run Scenario Analysis</span>
            </button>
          </div>
        </div>

        {/* Panel Body: Gauge on Left + 4 Key Insights Grid on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
          {/* Health Score Card */}
          <div className="lg:col-span-4 bg-white/60 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Financial Health Score
            </span>
            <HealthRadialGauge score={92} />
            <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              Top 5% Stability Rating · Liquidity Index 0.94
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[210px]">
              Strongest working capital posture in trailing 6 quarters.
            </p>
          </div>

          {/* 4 AI Insights Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {insights.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.id}
                  className="bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 rounded-xl p-3.5 flex items-start gap-3 hover:border-indigo-400/30 transition-all hover:bg-white/90 dark:hover:bg-slate-800/70"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <Icon size={17} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ backgroundColor: item.bg, color: item.color }}
                      >
                        {item.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Footer recommendation strip */}
        <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lightbulb size={15} className="text-amber-400" />
            <span>
              <strong>Strategic Recommendation:</strong> Settle cloud hosting invoices prior to the 15th to capture $240 early-pay credit.
            </span>
          </div>
          <button
            onClick={handleCopyBrief}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            type="button"
          >
            <span>{copiedNotification ? '✓ Brief Copied to Clipboard' : 'Copy Executive AI Brief'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </section>
  )
}
