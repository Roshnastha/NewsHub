'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      enableColorScheme={false}
      storageKey="news-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}