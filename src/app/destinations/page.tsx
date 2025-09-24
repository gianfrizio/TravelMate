import React, { Suspense } from 'react';
import DestinationsClient from './DestinationsClient';

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="p-8">Caricamento destinazioni...</div>}>
      <DestinationsClient />
    </Suspense>
  );
}