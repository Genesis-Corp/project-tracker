export function getSecondsRemaining(resetAt: string | null): number {
  if (!resetAt) return Infinity
  return Math.max(0, Math.floor((new Date(resetAt).getTime() - Date.now()) / 1000))
}

export function formatCountdown(seconds: number): string {
  if (seconds === Infinity || seconds <= 0) return 'Ready'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function getCountdownColorClass(seconds: number): string {
  if (seconds <= 0 || seconds === Infinity) return 'text-green-400'
  if (seconds < 900) return 'text-red-400 animate-pulse'
  if (seconds < 7200) return 'text-amber-400'
  return 'text-white'
}
