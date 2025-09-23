'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Plane, 
  Heart, 
  MapPin,
  BookOpen,
  Mail,
  Building,
  Briefcase
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { state } = useApp();

  const navItems = [
    { name: 'Home', href: '/', icon: Plane },
    { name: 'Destinazioni', href: '/destinations', icon: MapPin },
  { name: 'Servizi', href: '/services', icon: Briefcase },
    { name: 'Supporto', href: '/support', icon: Mail },
    { name: 'Azienda', href: '/azienda', icon: Building },
    { name: 'Blog', href: '/blog', icon: BookOpen },
  ];

  const isActive = (href: string) => pathname === href;

  return (
  <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/98 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-800/50"
    >
  <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" aria-label="TravelMate home">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg"
            >
              <Plane className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
              TravelMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-900 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.name}</span>
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-md -z-10"
                    initial={false}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Favorites & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Favorites Count Badge */}
            <Link href="/favorites" className="relative" aria-label="Vai ai preferiti">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Heart className="w-5 h-5" />
                {state.favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {state.favorites.length}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-900 dark:text-gray-300"
              aria-label={isOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-blue-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Navbar;