import { Clock, User, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { blogPosts } from '@/data/destinations';
import Button from '@/components/ui/Button';

// Questa è una Server Component per il SSG
export default function BlogPage() {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Blog di Viaggio
          </h1>
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-2xl mx-auto">
            Scopri consigli, guide e storie di viaggio dai nostri esperti
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image */}
              <div className="h-64 lg:h-full min-h-[300px] relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${featuredPost.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute top-6 left-6">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    In Evidenza
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredPost.publishedAt).toLocaleDateString('it-IT')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime} min</span>
                  </div>
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {featuredPost.title}
                </h2>

                <p className="text-gray-800 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center space-x-4 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 dark:bg-gray-700 text-blue-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link href={`/blog/${featuredPost.slug}`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    Leggi Articolo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Other Posts Grid */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Altri Articoli
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundImage: `url('${post.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} min</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-800 dark:text-gray-300 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-gray-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button size="sm" variant="ghost">
                        Leggi
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Vuoi condividere la tua esperienza di viaggio?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Raccontaci la tua storia e ispira altri viaggiatori!
          </p>
          <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-blue-50">
            Scrivi per noi
          </Button>
        </div>
      </div>
    </div>
  );
}

// Questa funzione genera le pagine staticamente al build time
export async function generateStaticParams() {
  return [];
}