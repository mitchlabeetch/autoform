'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider';

export function ClientRootProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <RootProvider>{children}</RootProvider>;
}
