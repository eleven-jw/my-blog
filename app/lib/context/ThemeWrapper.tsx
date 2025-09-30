'use client';

import { ThemeProvider } from "next-themes"

type ThemeWrapperProps = {
  children: React.ReactNode
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
