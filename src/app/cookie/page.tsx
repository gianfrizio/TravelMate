import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy - TravelMate',
  description: 'Informativa sui cookie utilizzati da TravelMate e come gestirli.',
}

export default function CookiePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Questa pagina descrive i cookie utilizzati dal sito e come gestirli.</p>
      </header>

      <section className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
        <h2 className="text-xl font-semibold">Cosa sono i cookie</h2>
        <p>I cookie sono piccoli file di testo memorizzati nel tuo dispositivo per migliorare l'esperienza di navigazione.</p>

        <h2 className="text-xl font-semibold">Tipologie di cookie</h2>
        <ul className="list-disc pl-6">
          <li><strong>Cookie tecnici:</strong> necessari per il funzionamento del sito.</li>
          <li><strong>Cookie di analisi:</strong> raccolgono informazioni aggregate sull'uso del sito.</li>
          <li><strong>Cookie di marketing:</strong> usati per personalizzare contenuti pubblicitari (previo consenso).</li>
        </ul>

        <h2 className="text-xl font-semibold">Gestione dei cookie</h2>
        <p>Puoi gestire o disabilitare i cookie tramite le impostazioni del browser. Disabilitare alcuni cookie potrebbe influire sulle funzionalità del sito.</p>

        <h2 className="text-xl font-semibold">Contatti</h2>
        <p>Per domande sulla cookie policy contatta <a className="text-primary-600" href="mailto:privacy@travelmate.com">privacy@travelmate.com</a> o visita la <Link href="/privacy" className="text-primary-600">Privacy Policy</Link>.</p>
      </section>
    </main>
  )
}
