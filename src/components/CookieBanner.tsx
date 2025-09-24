"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'travelmate_cookies_accepted'

export default function CookieBanner() {
  const [accepted, setAccepted] = useState<boolean | null>(null)
  const [showPrefs, setShowPrefs] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      setAccepted(v === '1')
    } catch (e) {
      setAccepted(null)
    }
  }, [])

  useEffect(() => {
    function onRevoke() {
      try {
        const v = localStorage.getItem(STORAGE_KEY)
        setAccepted(v === '1')
      } catch (e) {
        setAccepted(null)
      }
    }

    window.addEventListener('travelmate:cookie-revoke', onRevoke)
    return () => window.removeEventListener('travelmate:cookie-revoke', onRevoke)
  }, [])

  function accept() {
    try {
      const prefs = { analytics, marketing }
      localStorage.setItem(STORAGE_KEY, '1')
      localStorage.setItem(STORAGE_KEY + ':prefs', JSON.stringify(prefs))
    } catch (e) {}
    setAccepted(true)
    window.dispatchEvent(new CustomEvent('travelmate:toast', { detail: { message: 'Consenso cookie salvato', type: 'success' } }))
  }

  if (accepted) return null

  return (
    <div className="fixed left-4 right-4 bottom-6 z-50 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
          <div className="mb-2">Questo sito utilizza cookie tecnici e, con il tuo consenso, cookie di analisi e marketing. Leggi la nostra <Link href="/cookie" className="text-primary-600">Cookie Policy</Link>.</div>
          {showPrefs && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cookie tecnici</div>
                  <div className="text-xs text-slate-500">Necessari al funzionamento del sito.</div>
                </div>
                <div className="text-sm text-slate-500">Sempre attivi</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cookie analitici</div>
                  <div className="text-xs text-slate-500">Aiutano a capire come usi il sito.</div>
                </div>
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Cookie marketing</div>
                  <div className="text-xs text-slate-500">Usati per pubblicità personalizzata.</div>
                </div>
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 md:items-center md:flex-row">
          <button onClick={accept} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Accetta</button>
          <button onClick={() => setShowPrefs((s) => !s)} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm">Preferenze</button>
          <Link href="/cookie" className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm">Dettagli</Link>
        </div>
      </div>
    </div>
  )
}
