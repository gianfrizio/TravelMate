"use client";

import React, { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Search, MapPin, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import LocationSearch from '@/components/LocationSearch';
import dynamic from "next/dynamic";

// Lazy-load non-critical components to reduce initial bundle size
const LiveDestinations = dynamic(() => import("../components/LiveDestinations"), {
  ssr: false,
  loading: () => <div className="py-16">Loading...</div>,
});

const SurpriseMe = dynamic(() => import("../components/SurpriseMe"), {
  ssr: false,
  loading: () => <div className="py-8">Loading...</div>,
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/destinations?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Image (next/image for optimized LCP) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&h=1080&fit=crop&crop=center"
            alt="Hero background"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            Scopri il{' '}
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent font-extrabold">
              Mondo
            </span>
            <br />
            con TravelMate
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-white">
            La tua app di viaggio per esplorare destinazioni incredibili, 
            salvare itinerari e scoprire i migliori consigli di viaggio.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Suspense fallback={<div className="h-12" />}>
                <LocationSearch onSelect={(s) => { window.location.href = `/destinations?search=${encodeURIComponent(s.name)}`; }} />
              </Suspense>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/destinations">
              <Button size="lg" className="w-full sm:w-auto">
                Esplora Destinazioni
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20">
                Leggi il Blog
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-white rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Destinazioni in Evidenza
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Scopri alcune delle destinazioni più amate dai nostri viaggiatori con dati in tempo reale
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="grid grid-cols-3 gap-6 py-12">{Array.from({length:3}).map((_,i)=>(<div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl h-80"/>))}</div>}>
              <LiveDestinations maxItems={3} variant="hero" />
            </Suspense>
            <SurpriseMe />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20"
              onClick={() => {
                // Generate a short random seed and navigate
                const seed = `${Date.now().toString(36)}-${Math.floor(Math.random() * 100000).toString(36)}`;
                window.location.href = `/destinations?seed=${encodeURIComponent(seed)}`;
              }}
            >
              Vedi Tutte le Destinazioni
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 dark:bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-xl">Destinazioni</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-xl">Viaggiatori Felici</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <div className="text-4xl font-bold mb-2">4.8</div>
              <div className="text-xl">Rating Medio</div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
