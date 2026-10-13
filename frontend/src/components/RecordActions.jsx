import { PencilLine, Trash2 } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'

export default function RecordActions({ onEdit, onDelete, deleting }) {
    const { t } = useTranslation()

    return (
        <div className="inline-flex items-center gap-1">
            <button
                aria-label={t('actions.edit')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                onClick={onEdit}
                title={t('actions.edit')}
                type="button"
            >
                <PencilLine size={15} />
            </button>
            <button
                aria-label={t('actions.delete')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-wait"
                disabled={deleting}
                onClick={onDelete}
                title={t('actions.delete')}
                type="button"
            >
                <Trash2 size={15} />
            </button>
        </div>
    )
}