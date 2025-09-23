import React from 'react';
import Link from 'next/link';
import { Target, HeartHandshake, Users } from 'lucide-react';

export const metadata = {
  title: 'Azienda - TravelMate',
  description: "Chi siamo, carriere e partnership di TravelMate.",
};

export default function AziendaPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Azienda</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Scopri la nostra missione, i valori e le persone dietro TravelMate.</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5"/> La nostra missione</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Rendere il viaggio accessibile e autentico, aiutando le persone a esplorare il mondo con informazioni affidabili e strumenti semplici.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><HeartHandshake className="w-5 h-5"/> I nostri valori</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Trasparenza</div>
            <div className="text-sm text-slate-500">Informazioni chiare e verificate.</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Sostenibilità</div>
            <div className="text-sm text-slate-500">Promuoviamo scelte di viaggio responsabili.</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Comunità</div>
            <div className="text-sm text-slate-500">Supportiamo e valorizziamo realtà locali.</div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5"/> Team</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Siamo un piccolo team distribuito con competenze in prodotto, viaggi, design e ingegneria.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">gianfrizio — CEO</div>
            <div className="text-sm text-slate-500">Fondatore e product lead</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Giovanni — CTO</div>
            <div className="text-sm text-slate-500">Architetture e infrastrutture</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
            <div className="font-semibold">Sara — Head of Content</div>
            <div className="text-sm text-slate-500">Guide e partnership locali</div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Carriere</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">Crediamo nella crescita: se vuoi unirti a noi, controlla le posizioni aperte e inviaci il tuo CV.</p>
        <Link href="/careers" className="text-primary-600">Opportunità</Link>
      </section>

      <footer className="text-center">
        <Link href="/contact" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">Lavora con noi</Link>
      </footer>
    </main>
  );
}
