"use client"

import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs"
import { ReactNode, Suspense } from "react"
import { dark } from "@clerk/themes"
import { useIsDarkMode } from "@/hooks/useIsDarkMode"

function ClerkProviderInner({ children }: { children: ReactNode }) {
  const isDarkMode = useIsDarkMode()
  return (
    <OriginalClerkProvider
      appearance={isDarkMode ? { baseTheme: [dark] } : undefined}
    >
      {children}
    </OriginalClerkProvider>
  )
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <OriginalClerkProvider>
        {children}
      </OriginalClerkProvider>
    }>
      <ClerkProviderInner>{children}</ClerkProviderInner>
    </Suspense>
  )
}
