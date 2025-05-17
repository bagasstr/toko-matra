'use client'

import { ThemeProvider, type ThemeProviderProps } from 'next-themes'
export default function ThemesProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>
}
