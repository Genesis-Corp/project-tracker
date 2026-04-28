interface Props {
  used: number
  total: number
  type: string
}

export function UsageBar({ used, total, type }: Props) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0
  const barColor =
    pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>
          {used} / {total} {type}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div
        className="h-1.5 bg-surface-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-label={`${used} of ${total} ${type} used (${Math.round(pct)}%)`}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
