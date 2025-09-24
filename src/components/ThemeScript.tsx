"use client";

// ThemeScript è intenzionalmente un componente client no-op perché uno script inline in RootLayout
// imposta già il tema iniziale prima dell'hydration. Mantenere questo componente evita l'inserimento
// accidentale di script duplicati altrove.
export default function ThemeScript() {
  return null;
}