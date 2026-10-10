import React from 'react'
import useTranslation from '../i18n/useTranslation.js'
import { LayoutDashboard, Microscope, ShieldCheck, Database, TrendingUp, FileText, Clock, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

function AiCopilotPage() {
  const { t } = useTranslation()

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-lg border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-6">
          <LayoutDashboard size={32} className="text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('aiAssist.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {t('aiAssist.subtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* AI Financial Insights Card */}
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-3">
              <Microscope size={24} className="text-indigo-500" />
              <div>
                <h3 className="font-medium text-slate-300 dark:text-slate-400">AI Financial Insights</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('aiAssist.insightsSubtitle')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              {t('aiAssist.insightsDescription')}
            </p>
          </div>

          {/* Cash Flow Forecast Card */}
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-emerald-500" />
              <div>
                <h3 className="font-medium text-slate-300 dark:text-slate-400">Cash Flow Forecast</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('aiAssist.forecastSubtitle')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              {t('aiAssist.forecastDescription')}
            </p>
          </div>

          {/* Upcoming Bills Card */}
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-indigo-500" />
              <div>
                <h3 className="font-medium text-slate-300 dark:text-slate-400">Upcoming Bills</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('aiAssist.billsSubtitle')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              {t('aiAssist.billsDescription')}
            </p>
          </div>

          {/* Investment Insights Card */}
          <div className="rounded-2xl bg-slate-900/50 p-4">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-emerald-500" />
              <div>
                <h3 className="font-medium text-slate-300 dark:text-slate-400">Investment Analytics</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {t('aiAssist.investmentSubtitle')}
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              {t('aiAssist.investmentDescription')}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('aiAssist.poweredBy')}
          </p>
          <Link
            to="/dashboard"
            className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-500"
          >
            {t('aiAssist.dashboardLink')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AiCopilotPage