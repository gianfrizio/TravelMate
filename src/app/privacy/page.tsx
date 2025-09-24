import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - TravelMate',
  description: 'Informativa sulla privacy di TravelMate: come raccogliamo, usiamo e proteggiamo i tuoi dati.',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">Questa informativa descrive come TravelMate raccoglie, utilizza e protegge i tuoi dati personali.</p>
      </header>

      <section className="mb-8 space-y-6">
        <article>
          <h2 className="text-2xl font-semibold mb-2">1. Titolare del trattamento</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Il titolare del trattamento è TravelMate. Per qualsiasi richiesta relativa alla privacy puoi contattarci all'indirizzo <a className="text-primary-600" href="mailto:privacy@travelmate.com">privacy@travelmate.com</a>.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">2. Tipologie di dati raccolti</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Raccogliamo dati forniti volontariamente (es. nome, email e messaggi inviati tramite form), dati tecnici (indirizzo IP, dati di navigazione) e, quando necessario, dati per la prenotazione dei servizi (con il tuo consenso o tramite partner).</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">3. Finalità del trattamento</h2>
          <ul className="list-disc pl-6 text-sm text-slate-600 dark:text-slate-300">
            <li>Fornire e migliorare i servizi offerti sul sito.</li>
            <li>Rispondere a richieste di contatto e assistenza.</li>
            <li>Inviare comunicazioni informative e commerciali previo consenso.</li>
            <li>Adempiere obblighi legali e fiscali.</li>
          </ul>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">4. Base giuridica del trattamento</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">La base giuridica comprende il consenso dell'interessato, l'esecuzione di un contratto, adempimenti legali e gli interessi legittimi di TravelMate per fornire e migliorare il servizio.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">5. Conservazione dei dati</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">I dati vengono conservati per il tempo necessario alle finalità per cui sono stati raccolti e in conformità alla normativa vigente. Per richieste di cancellazione contatta <a className="text-primary-600" href="mailto:privacy@travelmate.com">privacy@travelmate.com</a>.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">6. Condivisione e terze parti</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Potremmo condividere i dati con fornitori di servizi (es. hosting, strumenti di email, partner per prenotazioni) che agiscono come responsabili del trattamento. Non vendiamo i tuoi dati a terzi.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">7. Cookie e tecnologie simili</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Utilizziamo cookie tecnici per il funzionamento del sito e cookie di analisi/marketing previo consenso. Per maggiori dettagli consulta la sezione cookie o le impostazioni del tuo browser.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">8. Diritti dell'interessato</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Hai il diritto di accedere, rettificare, cancellare, limitare il trattamento, opporti al trattamento e richiedere la portabilità dei dati. Per esercitare i diritti contatta <a className="text-primary-600" href="mailto:privacy@travelmate.com">privacy@travelmate.com</a>.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">9. Misure di sicurezza</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Adottiamo misure tecniche e organizzative per proteggere i dati personali da accessi non autorizzati, perdita o divulgazione.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">10. Modifiche a questa informativa</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Potremmo aggiornare questa informativa. La data di ultima revisione è riportata nel sito. Ti invitiamo a controllare periodicamente questa pagina.</p>
        </article>

        <article>
          <h2 className="text-2xl font-semibold mb-2">Contatti</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Per domande relative alla privacy contatta <a className="text-primary-600" href="mailto:privacy@travelmate.com">privacy@travelmate.com</a> o visita la nostra <Link href="/support" className="text-primary-600">pagina supporto</Link>.</p>
        </article>
      </section>
    </main>
  )
}
