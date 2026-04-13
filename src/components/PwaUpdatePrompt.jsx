import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { getColors } from '../theme'

export function PwaUpdatePrompt({ theme = 'dark' }) {
  const c = getColors(theme)
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed:', error)
    },
  })

  useEffect(() => {
    if (!offlineReady) return
    const timeout = setTimeout(() => setOfflineReady(false), 3500)
    return () => clearTimeout(timeout)
  }, [offlineReady, setOfflineReady])

  if (!needRefresh && !offlineReady) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-[120] w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl p-3 shadow-2xl">
      <div
        className="rounded-lg border px-3 py-2.5"
        style={{ background: c.contextBg, borderColor: c.border }}
      >
        <div className="mb-2 flex items-start gap-2.5">
          <div
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${c.accent}22`, color: c.accent }}
          >
            <RefreshCw size={15} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold" style={{ color: c.textHeading }}>
              {needRefresh ? 'Update available' : 'Offline ready'}
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: c.textMuted }}>
              {needRefresh
                ? 'A new version of Kiroku is ready. Update now for the latest features.'
                : 'Kiroku is now ready to use offline.'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: c.iconMuted }}
            onClick={() => {
              setNeedRefresh(false)
              setOfflineReady(false)
            }}
            aria-label="Dismiss update notice"
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        </div>

        {needRefresh && (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors"
              style={{ color: c.textMuted, background: c.hover }}
              onClick={() => setNeedRefresh(false)}
            >
              Later
            </button>
            <button
              type="button"
              className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
              style={{ color: '#fff', background: c.accent }}
              onClick={() => updateServiceWorker(true)}
            >
              Update now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

PwaUpdatePrompt.propTypes = {
  theme: PropTypes.string,
}
