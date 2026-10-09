import { Link } from 'react-router-dom'
import useTranslation from '../i18n/useTranslation.js'
import Logo from './Logo.jsx'

export default function Brand({ light = false }) {
  const { t } = useTranslation()
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label={t('brand.homeAria')}>
      <Logo decorative />
    </Link>
  )
}