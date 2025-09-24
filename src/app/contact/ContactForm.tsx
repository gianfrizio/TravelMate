"use client"

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function validateEmail(e: string) {
    // Must contain '@' and at least one character after it
    const atIndex = e.indexOf('@')
    return atIndex > 0 && atIndex < e.length - 1
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateEmail(email)) {
      setError('Inserisci un indirizzo email valido (deve contenere @ e domini).')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Errore invio messaggio')
      }

      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      setError(err.message || 'Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-green-600">Messaggio inviato con successo. Ti risponderemo via email.</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-white/40 bg-white/50 dark:bg-slate-800 focus:ring-2 focus:ring-white/30 focus:border-white"
          placeholder="Il tuo nome"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-white/40 bg-white/50 dark:bg-slate-800 focus:ring-2 focus:ring-white/30 focus:border-white"
          placeholder="la@tuamail.com"
          type="email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Messaggio</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-white/40 bg-white/50 dark:bg-slate-800 focus:ring-2 focus:ring-white/30 focus:border-white"
          rows={5}
          placeholder="Scrivi qui il tuo messaggio"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white text-white rounded-lg bg-transparent hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : (
            // paper-plane icon
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          <span className="whitespace-nowrap">{loading ? 'Invio...' : 'Invia messaggio'}</span>
        </button>
      </div>
    </form>
  )
}
