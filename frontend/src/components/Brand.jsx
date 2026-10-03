import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Brand({ light = false }) {
  return (
    <Link className={`brand${light ? ' brand-light' : ''}`} to="/" aria-label="NexFi home">
      <span className="brand-mark" aria-hidden="true"><TrendingUp size={19} strokeWidth={2.7} /></span>
      <span>NexFi</span>
    </Link>
  )
}