import { PencilLine, Trash2 } from 'lucide-react'
import useTranslation from '../i18n/useTranslation.js'

export default function RecordActions({ onEdit, onDelete, deleting }) {
  const { t } = useTranslation()

  return (
    <div className="record-actions">
      <button
        aria-label={t('actions.edit')}
        className="table-action-button"
        onClick={onEdit}
        title={t('actions.edit')}
        type="button"
      >
        <PencilLine size={15} />
      </button>
      <button
        aria-label={t('actions.delete')}
        className="table-action-button table-action-delete"
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
