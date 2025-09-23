"use client";

import dynamic from 'next/dynamic';
import React from 'react';

const LivePageClient = dynamic(() => import('./LivePageClient'), { ssr: false });

export default function LiveClientWrapper() {
  return <LivePageClient />;
}
