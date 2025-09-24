import Link from 'next/link'
import { Mail, Phone } from 'lucide-react'
import ContactForm from '@/app/contact/ContactForm'

export const metadata = {
  title: 'Contatti - TravelMate | TravelMate',
  description: 'Contatta TravelMate: email, telefono e orari di assistenza.',
}

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Contatti</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Hai bisogno di contattarci? Qui trovi i nostri canali e un semplice form per scriverci.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Mail className="w-5 h-5"/> Email</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Per richieste generali scrivi a:</p>
          <div className="text-sm text-slate-600 dark:text-slate-300">Email: <a className="text-primary-600" href="mailto:info@travelmate.com">info@travelmate.com</a></div>
        </div>

        <div className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Phone className="w-5 h-5"/> Telefono</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Linea assistenza e informazioni:</p>
          <div className="text-sm text-slate-600 dark:text-slate-300">Numero: <a className="text-primary-600" href="tel:+39000000000">+39 000 000 000</a></div>
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">Orari: lun-ven 9:00-18:00 (CET)</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Scrivici</h2>

        {/* Client-side form */}
        <ContactForm />
      </section>

      <footer className="text-center">
        <Link
          href="/support"
          className="inline-block px-4 py-2 border border-white text-white rounded-lg bg-transparent hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          Hai bisogno di supporto urgente? Vai al supporto
        </Link>
      </footer>
    </main>
  )
}
