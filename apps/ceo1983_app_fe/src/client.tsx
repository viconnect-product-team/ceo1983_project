import * as React from 'react';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';

// Global safeguard: expose React on window and globalThis to guarantee ReferenceError: React is not defined never occurs
if (typeof window !== 'undefined') {
  (window as any).React = React;
}
if (typeof globalThis !== 'undefined') {
  (globalThis as any).React = React;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
