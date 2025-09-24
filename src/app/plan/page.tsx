import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Currency } from 'lucide-react';

export const metadata = {
	title: 'Pianifica Viaggio - TravelMate',
	description: 'Crea il tuo itinerario personalizzato con TravelMate.',
};

export default function PlanPage() {
	return (
		<main className="max-w-4xl mx-auto px-4 py-12">
			<header className="mb-6">
				<h1 className="text-3xl font-bold mb-2 flex items-center gap-2"><MapPin className="w-6 h-6"/> Pianifica il tuo viaggio</h1>
				<p className="text-lg text-slate-600 dark:text-slate-300">Strumento semplice per creare itinerari giornalieri, stimare budget e salvare i tuoi piani.</p>
			</header>

			<section className="grid gap-6 md:grid-cols-3 mb-8">
				<div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
					<div className="font-semibold mb-2 flex items-center gap-2"><Calendar className="w-5 h-5"/> Durata</div>
					<div className="text-sm text-slate-500">Scegli il numero di giorni e ottieni una proposta di itinerario.</div>
				</div>
				<div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
					<div className="font-semibold mb-2 flex items-center gap-2"><MapPin className="w-5 h-5"/> Destinazioni</div>
					<div className="text-sm text-slate-500">Aggiungi tappe e punti di interesse da includere nell'itinerario.</div>
				</div>
				<div className="p-4 bg-white/50 dark:bg-slate-800 rounded-lg border">
					  <div className="font-semibold mb-2 flex items-center gap-2"><Currency className="w-5 h-5"/> Budget</div>
					<div className="text-sm text-slate-500">Stima dei costi per trasporti, alloggio e attività.</div>
				</div>
			</section>

			<section className="mb-8">
				<h2 className="text-2xl font-semibold mb-4">Inizia</h2>
				<p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Per ora questa è una versione iniziale del pianificatore. Puoi comunque creare un piano di prova.</p>
				<div className="flex gap-3">
					<Link href="/destinations" className="px-4 py-2 bg-primary-600 text-white rounded-lg">Scegli Destinazioni</Link>
					<Link href="/contact" className="px-4 py-2 border rounded-lg">Richiedi Supporto</Link>
				</div>
			</section>

			<footer className="text-sm text-slate-500">Questa pagina verrà ampliata con funzionalità interattive nelle prossime release.</footer>
		</main>
	);
}
