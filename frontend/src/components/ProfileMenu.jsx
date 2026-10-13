import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AtSign, CalendarDays, CircleUserRound, LogOut, Mail, User, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import useProfilePhoto from '../hooks/useProfilePhoto.js'
import useTranslation from '../i18n/useTranslation.js'
import ProfilePhotoPicker from './ProfilePhotoPicker.jsx'

function DetailRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">{value || '—'}</span>
            </div>
        </div>
    )
}

export default function ProfileMenu() {
    const { t } = useTranslation()
    const { user, logout } = useAuth()
    const { photo } = useProfilePhoto()
    const [open, setOpen] = useState(false)
    const [notice, setNotice] = useState('')

    useEffect(() => {
        if (!open) return undefined
        const onKey = (e) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        if (!notice) return undefined
        const id = setTimeout(() => setNotice(''), 3000)
        return () => clearTimeout(id)
    }, [notice])

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : ''

    return (
        <>
            <button
                type="button"
                aria-label={t('navigation.account')}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
                {photo ? (
                    <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                    <CircleUserRound size={22} />
                )}
            </button>

            {open &&
                createPortal(
                    <>
                        <div className="fixed inset-0 z-[70]" onClick={() => setOpen(false)} aria-hidden="true" />
                        <div
                            role="dialog"
                            aria-label="My profile"
                            className="fixed top-16 right-3 sm:right-8 z-[80] w-[340px] max-w-[calc(100vw-1.5rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Profile</h2>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close profile"
                                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <ProfilePhotoPicker name={user?.name || ''} onMessage={setNotice} />

                            {notice && (
                                <p className="text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">{notice}</p>
                            )}

                            <div className="space-y-2">
                                <DetailRow icon={User} label="Full Name" value={user?.name} />
                                <DetailRow icon={AtSign} label="Username" value={user?.username} />
                                <DetailRow icon={Mail} label="Email" value={user?.email} />
                                <DetailRow icon={CalendarDays} label="Member Since" value={memberSince} />
                            </div>

                            <button
                                type="button"
                                onClick={logout}
                                className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span>Sign out</span>
                            </button>
                        </div>
                    </>,
                    document.body,
                )}
        </>
    )
}