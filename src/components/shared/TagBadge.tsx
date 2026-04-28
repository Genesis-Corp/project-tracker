interface Props {
  tag: string
  onRemove?: () => void
}

export function TagBadge({ tag, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="hover:text-red-400 transition-colors leading-none">
          ×
        </button>
      )}
    </span>
  )
}
