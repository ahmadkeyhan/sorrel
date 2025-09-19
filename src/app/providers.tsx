"use client"

import type React from "react"
import ServiceWorkerRegistration from "@/components/serviceWorkerRegistration"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServiceWorkerRegistration />
      {children}
    </SessionProvider>
  )
}

