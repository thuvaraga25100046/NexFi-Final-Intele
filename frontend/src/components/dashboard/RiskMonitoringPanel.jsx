import { useState } from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { formatCurrency } from '../../i18n/formatters.js'

export default function RiskMonitoringPanel({
  onRunSimulation,
  language = 'en',
  currency = 'LKR',
}) {
  const riskTiers = [
    {
      id: 'low-risk',
      tier: 'Low Risk',
      tone: 'emerald',
      score: 98,
      title: 'Operating Liquidity',
      shortageDate: 'None projected (45+ days)',
      amountAtRisk: 0,
      suggestedAction: 'Deploy $25,000 idle cash into overnight yield sweep account (~4.8% APY).',
      status: 'Fully Hedged',
      icon: ShieldCheck,
      borderColor: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      id: 'medium-risk',
      tier: 'Medium Risk',
      tone: 'amber',
      score: 72,
      title: 'Receivables Aging Delays',
      shortageDate: 'Potential dip at Day +22 if unpaid',
      amountAtRisk: 4850,
      suggestedAction: 'Send automated 1-click payment link to Bluebird Creative & Maple & Main.',
      status: 'Action Recommended',
      icon: AlertTriangle,
      borderColor: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'high-risk',
      tier: 'High Risk',
      tone: 'rose',
      score: 88,
      title: 'Credit & Obligation Shock',
      shortageDate: 'No shortage breach detected',
      amountAtRisk: 0,
      suggestedAction: 'Maintain current minimum liquidity reserve ($15,000) for month-end payroll.',
      status: 'Stress-Tested',
      icon: ShieldAlert,
      borderColor: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/10 text-rose-500',
    },
  ]

  return (
    <section aria-label="Risk Monitoring System" className="w-full mb-6">
      <div className="fintech-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Shield size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="fintech-kicker">Sentinel Defense Engine</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                  Real-time Monitored
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-0.5">
                Liquidity Risk Monitoring
              </h2>
            </div>
          </div>

          <button
            onClick={onRunSimulation}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            type="button"
          >
            <Play size={13} fill="currentColor" />
            <span>Simulate Extreme Shock (What-If)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskTiers.map((tier) => {
            const Icon = tier.icon
            return (
              <article
                key={tier.id}
                className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border ${tier.borderColor} flex flex-col justify-between hover:bg-white dark:hover:bg-slate-900/70 transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tier.badgeBg}`}>
                      {tier.tier}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      Score {tier.score}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                    {tier.title}
                  </h3>

                  <div className="space-y-2 mb-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5">
                      <span className="text-slate-400">Potential shortage date:</span>
                      <strong className="text-slate-900 dark:text-white font-semibold">
                        {tier.shortageDate}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5">
                      <span className="text-slate-400">Amount at risk:</span>
                      <strong className={tier.amountAtRisk > 0 ? 'text-amber-500 font-extrabold' : 'text-emerald-500 font-extrabold'}>
                        {formatCurrency(tier.amountAtRisk, language, currency)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Suggested Action:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {tier.suggestedAction}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
