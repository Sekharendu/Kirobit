import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  if (!visible) return null

  const bg = type === 'error' ? 'bg-red-600' : 'bg-amber-600'

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bg} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm text-sm`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={() => { setVisible(false); onDismiss?.() }}
          className="ml-auto text-white/70 hover:text-white text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
