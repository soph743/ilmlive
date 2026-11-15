import { Link } from '../router.jsx'

export function BrandMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#f3d579" />
      <path d="M21 6c-1 5 0 7 4 10-1 3-3 4-6 4-2 0-4-1-5-3 4-4 5-6 5-11h2Z" fill="#762b3c" />
      <path d="M20 15c8 0 14 8 14 17H6c0-9 6-17 14-17Z" fill="#762b3c" />
    </svg>
  )
}

export function Brand({ to = '/home', light = false }) {
  return (
    <Link to={to} className={`brand ${light ? 'brand--light' : ''}`}>
      <BrandMark />
      <span className="brand__name">ilmlive</span>
    </Link>
  )
}