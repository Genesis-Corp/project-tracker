import { useState, useEffect } from 'react'
import { getSecondsRemaining, formatCountdown, getCountdownColorClass } from '../../lib/countdown'

interface Props {
  resetAt: string | null
}

export function CountdownTimer({ resetAt }: Props) {
  const [seconds, setSeconds] = useState(() => getSecondsRemaining(resetAt))

  useEffect(() => {
    if (!resetAt) return
    const id = setInterval(() => setSeconds(getSecondsRemaining(resetAt)), 1000)
    return () => clearInterval(id)
  }, [resetAt])

  const label = formatCountdown(seconds)
  const colorClass = getCountdownColorClass(seconds)

  return (
    <span className={`text-xs font-mono ${colorClass}`}>
      {label === 'Ready' ? '✓ Ready to use' : `Resets in ${label}`}
    </span>
  )
}
