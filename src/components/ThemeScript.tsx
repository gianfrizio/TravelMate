'use client';

// ThemeScript is intentionally a no-op client component because an inline script in RootLayout
// already sets the initial theme before hydration. Keeping this component avoids accidental
// duplicate script injection elsewhere.
export default function ThemeScript() {
  return null;
}