import Link from 'next/link'

export const metadata = {
  title: "Termini di Servizio - TravelMate",
  description: "Termini e condizioni d'uso del sito TravelMate.",
}

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Termini di Servizio</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Questi termini regolano l'uso del sito TravelMate.</p>
      </header>

      <section className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-xl font-semibold">Accettazione dei termini</h2>
        <p>Utilizzando il sito accetti questi termini. Se non sei d'accordo, non utilizzare il sito.</p>

        <h2 className="text-xl font-semibold">Servizi e contenuti</h2>
        <p>Le informazioni fornite su TravelMate sono a scopo informativo. Non garantiamo la disponibilità o l'accuratezza delle offerte fornite da terzi.</p>

        <h2 className="text-xl font-semibold">Responsabilità</h2>
        <p>Non siamo responsabili per danni indiretti o perdite derivanti dall'uso del sito. Per prenotazioni e transazioni fare riferimento ai termini dei fornitori terzi.</p>

        <h2 className="text-xl font-semibold">Modifiche</h2>
        <p>Possiamo aggiornare questi termini. Eventuali modifiche saranno pubblicate su questa pagina.</p>

        <h2 className="text-xl font-semibold">Contatti</h2>
        <p>Per domande contatta <a className="text-primary-600" href="mailto:info@travelmate.com">info@travelmate.com</a> o visita la <Link href="/support" className="text-primary-600">pagina supporto</Link>.</p>
      </section>
    </main>
  )
}
