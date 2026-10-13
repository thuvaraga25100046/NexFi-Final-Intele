import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'

const tabBase = 'py-2.5 text-center text-sm font-medium rounded-lg transition-all'

function AuthShell({ subtitle, activeTab, children }) {
    const { t } = useTranslation()

    return (
        <div className="auth-shell relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080b17] px-4 py-10">
            {/* Stops the browser's light-blue autofill colour from breaking the dark inputs */}
            <style>{`
        .auth-shell input:-webkit-autofill,
        .auth-shell input:-webkit-autofill:hover,
        .auth-shell input:-webkit-autofill:focus {
          -webkit-text-fill-color: #f1f5f9;
          caret-color: #f1f5f9;
          box-shadow: 0 0 0 1000px #0f172a inset;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand header */}
                <div className="mb-8 text-center">
                    <Link to="/" className="mb-2 inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white!">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={20} />
            </span>
                        NexFi
                    </Link>
                    <p className="text-sm text-slate-400">{subtitle}</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl">
                    {/* Sign In / Sign Up tabs */}
                    <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
                        <Link
                            to="/signin"
                            className={`${tabBase} ${
                                activeTab === 'signin' ? 'bg-indigo-600 text-white! shadow-md' : 'text-slate-400! hover:text-slate-200!'
                            }`}
                        >
                            {t('auth.signIn')}
                        </Link>
                        <Link
                            to="/signup"
                            className={`${tabBase} ${
                                activeTab === 'signup' ? 'bg-indigo-600 text-white! shadow-md' : 'text-slate-400! hover:text-slate-200!'
                            }`}
                        >
                            {t('auth.signUp')}
                        </Link>
                    </div>

                    {children}
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="text-xs text-slate-500! transition-colors hover:text-slate-300!">
                        ← {t('navigation.backHome')}
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default AuthShell
