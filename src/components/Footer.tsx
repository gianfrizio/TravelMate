'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Instagram, 
  Facebook, 
  Twitter, 
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import Newsletter from './Newsletter';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Destinazioni': [
      { name: 'Europa', href: '/destinations?continent=Europe' },
      { name: 'Asia', href: '/destinations?continent=Asia' },
      { name: 'America', href: '/destinations?continent=America' },
      { name: 'Africa', href: '/destinations?continent=Africa' },
    ],
    'Servizi': [
      { name: 'Pianifica Viaggio', href: '/plan' },
      { name: 'Guide Viaggio', href: '/guides' },
      { name: 'Assicurazione', href: '/insurance' },
      { name: 'Recensioni', href: '/reviews' },
    ],
    'Supporto': [
      { name: 'Centro Assistenza', href: '/help' },
      { name: 'Contatti', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    'Azienda': [
      { name: 'Chi Siamo', href: '/about' },
      { name: 'Carriere', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Partnership', href: '/partners' },
    ],
  };

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-400', external: true },
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: 'hover:text-blue-400', external: true },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-cyan-400', external: true },
    { name: 'Email', icon: Mail, href: 'mailto:info@travelmate.com', color: 'hover:text-green-400', external: false },
  ];

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TravelMate</span>
              </Link>
              <p className="text-slate-400 mb-6 max-w-sm">
                La tua compagna di viaggio per esplorare 
                destinazioni incredibili e creare ricordi indimenticabili.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4" />
                  <span>Via Roma 123, Milano, Italia</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4" />
                  <span>+39 02 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4" />
                  <span>info@travelmate.com</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-slate-800 dark:border-slate-700"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex space-x-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className={`text-slate-400 ${social.color} transition-colors duration-200`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                    {...(social.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </motion.a>
                );
              })}
            </div>
            
            <p className="text-slate-400 text-sm">
              Seguici sui social per le ultime novità e offerte esclusive
            </p>
          </div>
        </motion.div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-slate-800 dark:border-slate-700"
        >
          <div className="max-w-md">
            <Newsletter />
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-slate-950 dark:bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} TravelMate. Tutti i diritti riservati.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Termini di Servizio
              </Link>
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;