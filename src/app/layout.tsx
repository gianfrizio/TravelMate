import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from '@/components/CookieBanner'
import Toast from '@/components/Toast'

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  // URL base per la risoluzione dei relativi (ad esempio le immagini Open Graph)
  metadataBase: new URL('https://travelmate.vercel.app'),
  title: {
    default: "TravelMate - La tua app di viaggio",
    template: "%s | TravelMate"
  },
  description: "Scopri destinazioni incredibili, pianifica i tuoi viaggi e salva i tuoi luoghi del cuore con TravelMate. Esplora il mondo con la nostra guida di viaggio intelligente.",
  keywords: ["viaggi", "destinazioni", "turismo", "vacanze", "itinerari", "travel", "guida viaggio"],
  authors: [{ name: "TravelMate Team" }],
  creator: "TravelMate",
  publisher: "TravelMate",
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://travelmate.vercel.app",
    title: "TravelMate - La tua app di viaggio",
    description: "Scopri destinazioni incredibili con TravelMate",
    siteName: "TravelMate",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TravelMate - La tua app di viaggio"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TravelMate - La tua app di viaggio",
    description: "Scopri destinazioni incredibili con TravelMate",
    creator: "@travelmate",
    images: ["/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "google-site-verification-code",
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Esclude lo zoom per migliorare l'esperienza mobile (accessibilità considerata)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Risorse per il caricamento anticipato */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://source.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openweathermap.org" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center" />
      </head>
      <body className={`${inter.variable} font-sans antialiased transition-colors duration-300`}>
        {/* Skip link per utenti tastiera */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white dark:bg-slate-900 text-sm px-3 py-2 rounded-md shadow"
        >
          Salta al contenuto
        </a>
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Inline script per impostare il tema iniziale */}
            <script
              dangerouslySetInnerHTML={{ __html: `(function(){try{const t=localStorage.getItem('travelmate-theme')||'light';if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}document.documentElement.style.colorScheme=t}catch(e){}})()` }}
            />
            <main id="content" className="flex-grow" tabIndex={-1}>
              {children}
            </main>
            <CookieBanner />
            <Footer />
            <Toast />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
