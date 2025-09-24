"use client"

import { useEffect, useState } from 'react'

type ToastItem = { id: number; message: string; type?: 'info' | 'success' | 'error' }

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function handler(e: Event) {
      const ce = e as CustomEvent
      const message = ce.detail?.message || 'Operazione completata'
      const type = ce.detail?.type || 'info'
      const id = Date.now()
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id))
      }, 4000)
    }

    window.addEventListener('travelmate:toast', handler as EventListener)
    return () => window.removeEventListener('travelmate:toast', handler as EventListener)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div key={t.id} className={`max-w-sm px-4 py-3 rounded-md shadow-lg text-sm ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
