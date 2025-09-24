import React from 'react';
import Link from 'next/link';
import { MapPin, BookOpen, ShieldCheck, Star, Users, LifeBuoy } from 'lucide-react';

export const metadata = {
  title: 'Servizi - TravelMate',
  description: 'Scopri i servizi offerti da TravelMate: pianificazione, guide, assicurazioni e molto altro.',
};

export default function ServicesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Servizi</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">TravelMate offre servizi pensati per coprire ogni fase del viaggio: dalla pianificazione alle esperienze locali.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><MapPin className="w-5 h-5"/> Pianifica Viaggio</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Crea itinerari su misura con tappe giornaliere, timing e stime di costo. Perfetto per viaggiatori che vogliono ottimizzare tempo e budget.</p>
          <Link href="/plan" className="text-primary-600">Vai a Pianifica</Link>
        </article>

        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5"/> Guide di Viaggio</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Guide curate per ogni destinazione con consigli pratici, suggerimenti su ristoranti e attrazioni meno note.</p>
          <Link href="/guides" className="text-primary-600">Esplora Guide</Link>
        </article>

        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> Assicurazione & Sicurezza</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Partnership e informazioni sulle polizze consigliate per viaggiare sereni, con supporto in caso di emergenze.</p>
          <Link href="/insurance" className="text-primary-600">Dettagli Assicurazione</Link>
        </article>

        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Star className="w-5 h-5"/> Esperienze Locali</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Attività selezionate da operatori locali: tour enogastronomici, laboratori e visite guidate fuori dai circuiti turistici.</p>
          <Link href="/experiences" className="text-primary-600">Scopri Esperienze</Link>
        </article>

        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Users className="w-5 h-5"/> Recensioni e Feedback</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Leggi le esperienze degli altri viaggiatori e condividi la tua opinione per migliorare i servizi.</p>
          <Link href="/reviews" className="text-primary-600">Vedi Recensioni</Link>
        </article>

        <article className="p-6 border rounded-lg bg-white/50 dark:bg-slate-800">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><LifeBuoy className="w-5 h-5"/> Consulenze Personalizzate</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Pacchetti a pagamento con consulenti che aiutano a creare itinerari complessi o viaggi su misura.</p>
          <Link href="/contact" className="text-primary-600">Richiedi Consulenza</Link>
        </article>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Perché scegliere TravelMate</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Personalizzazione</div>
            <div className="text-sm text-slate-500">Servizi modellati sui tuoi interessi e preferenze.</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Supporto</div>
            <div className="text-sm text-slate-500">Assistenza durante tutto il viaggio, quando serve.</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Affidabilità</div>
            <div className="text-sm text-slate-500">Partner selezionati e informazioni verificate.</div>
          </div>
        </div>
      </section>

      {/* Le FAQ sono state spostate nella pagina /faq */}

      <footer className="text-center">
        <Link href="/contact" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Contattaci per maggiori informazioni</Link>
      </footer>
    </main>
  );
}
