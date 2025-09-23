# 🌍 TravelMate - La tua app di viaggio

TravelMate è un'applicazione web moderna per viaggiatori che permette di esplorare destinazioni incredibili, salvare itinerari personalizzati e scoprire consigli di viaggio.

## ✨ Funzionalità Principali

### 🏠 Homepage Accattivante
- **Hero section** con immagini mozzafiato e call-to-action
- **Search bar** per trovare destinazioni rapidamente
- **Sezione destinazioni in evidenza** con le mete più popolari
- **Statistiche** sui viaggiatori e le destinazioni

### 🔍 Ricerca Destinazioni Avanzata
- **Grid responsive** con card delle destinazioni
# 🌍 TravelMate

TravelMate è un'app Next.js (App Router) per esplorare destinazioni, salvare itinerari e leggere consigli di viaggio.

Questo README è pensato per sviluppatori e manutentori: trova qui setup rapido, comandi utili, note su performance e debug rapido.

---

## Requisiti
- Node.js 18+ (consigliato LTS)
- npm (o yarn/pnpm)

## Setup rapido (development)

1. Clona il repository

```bash
git clone <repository-url>
cd TravelMate
```

2. Installa dipendenze

```bash
npm install
```

3. Crea il file `.env.local` in radice (vedi sezione Variabili d'ambiente)

4. Avvia in development

```bash
npm run dev
# Visita http://localhost:3000
```

## Comandi principali
- `npm run dev` — avvia Next.js in sviluppo
- `npm run build` — crea la build di produzione
- `npm start` — avvia il server di produzione (dopo `build`)
- `npm run lint` — esegue ESLint (se abilitato)

## Variabili d'ambiente

Copiale in `.env.local` (non committare):

```env
GEOAPIFY_API_KEY=your_geoapify_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Struttura principale del progetto

Principali cartelle:

- `src/app` — pagine e layout (App Router)
- `src/components` — componenti React riutilizzabili
- `src/context` — React Context globali
- `src/hooks` — custom hooks (es. `useWeather`)
- `src/lib` — utility e helper (es. `logger`)
- `src/data` — dati mock per development

## Performance & Lighthouse (note pratiche)

Queste ottimizzazioni sono implementate o raccomandate nel progetto:

- Usa `next/image` per le immagini critiche (hero/LCP) e configura `remotePatterns` in `next.config.ts`.
- Preconnect e preload per host di immagini e Google Fonts sono inseriti in `src/app/layout.tsx`.
- Lazy-load dei componenti non critici con `next/dynamic` (es. `LiveDestinations`, `SurpriseMe`).
- Evita script inline non necessari e concentrare la logica client solo dove serve per ridurre TBT.

Suggerimenti per misurare e migliorare rapidamente:

- Esegui Lighthouse in modalità mobile (Device: Moto G4, 3G) e verifica LCP/TBT.
- Se LCP è alto: assicurati che la hero image abbia `priority` e dimensioni corrette (`sizes`).
- Se TBT è alto: cerca bundle pesanti (framer-motion, grandi dipendenze) e lazy-loadli.

Comandi utili:

```bash
# Build e start per testare Lighthouse in produzione
npm run build
npm start

# Apri Chrome -> DevTools -> Lighthouse -> Mobile
```

## Debug e DevTips

- Console warnings: usa `src/lib/logger.ts` per evitare `console.*` in produzione.
- Errori API (timeout) possono apparire durante il runtime se le chiavi API mancano o i servizi rate-limitano. Controlla `.env.local`.
- Per analizzare bundle: aggiungi `@next/bundle-analyzer` e genera report (opzionale).

## Deployment

- Raccomandazione: Vercel (App Router supportato nativamente). Configurazione di base già pronta.

## Contribuire

1. Fork → branch feature → PR
2. Segui la convenzione di commit e aggiungi test/minimi quando modifichi logica condivisa

## Note sulla sicurezza e Best Practices

- Content Security Policy e headers di sicurezza sono configurati in `next.config.ts`.
- Evita di includere script di terze parti che impostano cookie senza consenso esplicito.

---

Se vuoi, posso aggiungere una sezione automatica che spiega come eseguire Lighthouse CI, come generare il bundle-analyzer, o creare una breve checklist di ottimizzazione per LCP/TBT che puoi seguire prima di ogni deploy.

Buon lavoro! 🚀
### Design System
