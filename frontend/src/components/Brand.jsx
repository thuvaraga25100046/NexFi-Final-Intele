import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '../i18n/useTranslation.js'

export default function Brand({ light = false }) {
  const { t } = useTranslation()
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label={t('brand.homeAria')}>
      <span className="brand-mark" aria-hidden="true"><TrendingUp size={19} strokeWidth={2.7} /></span>
      <span>NexFi</span>
    </Link>
  )
}