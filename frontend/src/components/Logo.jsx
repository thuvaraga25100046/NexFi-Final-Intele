export default function Logo({ variant = 'full', className = '', decorative = false }) {
  const isCompact = variant === 'compact'
  const classes = ['nexfi-logo', `nexfi-logo-${variant}`, className].filter(Boolean).join(' ')

  return (
    <svg
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : 'NexFi'}
      className={classes}
      role={decorative ? undefined : 'img'}
      viewBox={isCompact ? '0 0 40 40' : '0 0 144 40'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="14" fill="#113B2E" />
      <path
        d="M8.5 28 16 21l5 3 10-12"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M24 12h7v7"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <circle cx="31" cy="12" r="2.5" fill="#A7F3D0" />
      {!isCompact && (
        <text
          fill="#113B2E"
          fontFamily="Manrope, 'Arial Rounded MT Bold', sans-serif"
          fontSize="27"
          fontWeight="800"
          letterSpacing="-1.3"
          x="50"
          y="29"
        >
          Nex<tspan fill="#16A34A">Fi</tspan>
        </text>
      )}
    </svg>
  )
}
