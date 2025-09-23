import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, User, Calendar, Share2 } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '@/data/destinations';
import Button from '@/components/ui/Button';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

// Funzione per generare i parametri statici
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Funzione per generare i metadati
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = blogPosts.find((post) => post.slug === params.slug);
  
  if (!post) {
    return {
      title: 'Articolo non trovato',
    };
  }

  return {
    title: `${post.title} | TravelMate Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = blogPosts.find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Articoli correlati (escluso quello corrente)
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header con breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="inline-flex items-center text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna al Blog
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${post.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          
          <div className="absolute bottom-8 left-8 text-white">
            <div className="flex items-center space-x-4 text-sm mb-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min di lettura</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Excerpt */}
          <div className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8 p-6 bg-blue-50 dark:bg-gray-700 rounded-2xl border-l-4 border-primary-500">
            {post.excerpt}
          </div>

          {/* Mock Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Viaggiare è una delle esperienze più arricchenti che possiamo vivere. Ogni destinazione 
              offre qualcosa di unico e speciale, dalla cultura locale ai paesaggi mozzafiato, 
              dal cibo tradizionale alle avventure indimenticabili.
            </p>

            <h2>Perché viaggiare è importante</h2>
            <p>
              Il viaggio non è solo spostarsi da un luogo all'altro, ma è un'esperienza 
              trasformativa che ci permette di:
            </p>
            
            <ul>
              <li>Scoprire nuove culture e tradizioni</li>
              <li>Uscire dalla nostra zona di comfort</li>
              <li>Creare ricordi indimenticabili</li>
              <li>Incontrare persone straordinarie</li>
              <li>Sviluppare una maggiore apertura mentale</li>
            </ul>

            <h2>Come pianificare il viaggio perfetto</h2>
            <p>
              La pianificazione è fondamentale per un viaggio di successo. Ecco alcuni 
              consigli essenziali:
            </p>

            <h3>1. Ricerca e preparazione</h3>
            <p>
              Prima di partire, dedica del tempo alla ricerca sulla destinazione. 
              Informati sul clima, sulla cultura locale, sui documenti necessari 
              e sulle attrazioni principali.
            </p>

            <h3>2. Budget e risparmio</h3>
            <p>
              Stabilisci un budget realistico e cerca modi creativi per risparmiare. 
              Considera opzioni come i voli low-cost, gli alloggi alternativi e 
              i pasti locali economici.
            </p>

            <h3>3. Documenti e assicurazioni</h3>
            <p>
              Assicurati di avere tutti i documenti necessari (passaporto, visti, 
              patente internazionale) e considera l'acquisto di un'assicurazione di viaggio.
            </p>

            <blockquote>
              "Non tutti quelli che vagano sono perduti" - J.R.R. Tolkien
            </blockquote>

            <h2>Consigli per viaggiatori esperti</h2>
            <p>
              Dopo anni di esperienza nel settore dei viaggi, abbiamo raccolto 
              questi consigli preziosi che possono fare la differenza:
            </p>

            <ol>
              <li><strong>Viaggia leggero:</strong> Porta solo l'essenziale e lascia spazio per i souvenirs</li>
              <li><strong>Sii flessibile:</strong> I piani possono cambiare, e va bene così</li>
              <li><strong>Interagisci con i locali:</strong> Sono la migliore fonte di consigli autentici</li>
              <li><strong>Documenta tutto:</strong> Foto, video e diari di viaggio per preservare i ricordi</li>
              <li><strong>Rispetta l'ambiente:</strong> Viaggia in modo sostenibile e responsabile</li>
            </ol>

            <p>
              Il mondo è pieno di destinazioni incredibili che aspettano di essere esplorate. 
              Con TravelMate, puoi scoprire nuovi luoghi, pianificare i tuoi itinerari 
              e condividere le tue esperienze con una comunità di viaggiatori appassionati.
            </p>
          </div>

          {/* Share buttons */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Condividi questo articolo:
              </span>
              <div className="flex space-x-3">
                <Button size="sm" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Condividi
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Articoli Correlati
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundImage: `url('${relatedPost.image}')` }}
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-2">
                      {relatedPost.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{relatedPost.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}