import { BlogPost } from '@/types';

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Consigli per Viaggiare con un Budget Limitato',
    slug: 'viaggiare-budget-limitato',
    excerpt: 'Scopri come esplorare il mondo senza spendere una fortuna con questi consigli pratici.',
    content: 'Viaggiare non deve necessariamente costare una fortuna. Con un po\' di pianificazione e alcuni trucchi...',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop',
    author: 'Marco Rossi',
    publishedAt: '2024-01-15',
    readTime: 8,
    tags: ['budget', 'consigli', 'risparmio']
  },
  {
    id: '2',
    title: 'Le Destinazioni Più Instagrammabili del 2024',
    slug: 'destinazioni-instagrammabili-2024',
    excerpt: 'I luoghi più fotogenici che faranno brillare il tuo feed Instagram.',
    content: 'Nell\'era dei social media, molti viaggiatori cercano destinazioni che offrano...',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    author: 'Laura Bianchi',
    publishedAt: '2024-01-10',
    readTime: 6,
    tags: ['instagram', 'fotografia', 'social']
  },
  {
    id: '3',
    title: 'Guida Completa al Viaggio Sostenibile',
    slug: 'viaggio-sostenibile-guida',
    excerpt: 'Come ridurre l\'impatto ambientale dei tuoi viaggi e viaggiare in modo responsabile.',
    content: 'Il turismo sostenibile sta diventando sempre più importante. Ecco come puoi...',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    author: 'Francesco Verde',
    publishedAt: '2024-01-05',
    readTime: 12,
    tags: ['sostenibilità', 'ambiente', 'ecoturismo']
  }
];