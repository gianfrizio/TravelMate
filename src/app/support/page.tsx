import React from 'react';
import Link from 'next/link';
import { LifeBuoy, Mail, Clock } from 'lucide-react';

export const metadata = {
  title: 'Supporto - TravelMate',
  description: 'Centro assistenza TravelMate: contatti, FAQ e aiuto per il tuo viaggio.',
};

export default function SupportPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Supporto</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Hai bisogno di aiuto? Qui trovi tutte le risorse e i canali per contattarci.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><LifeBuoy className="w-5 h-5"/> Centro Assistenza & FAQ</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Consulta le risposte alle domande più frequenti e cerca soluzioni immediate.</p>
          <Link href="/faq" className="text-primary-600">Vai alle FAQ</Link>
        </div>

        <div className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Mail className="w-5 h-5"/> Contatti & Orari</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Supporto via email e chat. Orari: lun-ven 9:00-18:00 (CET).</p>
          <div className="text-sm text-slate-600 dark:text-slate-300">Email: <a className="text-primary-600" href="mailto:info@travelmate.com">info@travelmate.com</a></div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Numero: <a className="text-primary-600" href="tel:+39000000000">+39 000 000 000</a></div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5"/> Supporto emergenze</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Se sei in viaggio e hai bisogno di assistenza urgente, contatta il nostro supporto telefonico e indica il tuo ID prenotazione se disponibile.</p>
        <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
          <div className="font-semibold">Linea emergenze</div>
          <div className="text-sm text-slate-600">+39 000 000 999 (24/7)</div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Guide utili</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Articoli e checklist per gestire cambi di volo, smarrimento bagagli e questioni sanitarie.</p>
        <Link href="/guides" className="text-primary-600">Leggi le guide</Link>
      </section>

      <footer className="text-center">
        <Link href="/contact" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Contattaci</Link>
      </footer>
    </main>
  );
}
