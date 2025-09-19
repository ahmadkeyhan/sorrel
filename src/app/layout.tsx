import type React from "react"
import type { Viewport } from 'next'
import type { Metadata } from "next"
import { Vazirmatn, Markazi_Text } from "next/font/google"
import localFont from 'next/font/local'
import "./globals.css"
import { ToastProvider } from "@/components/ui/toastContext"
import { Providers } from "./providers"
import { Navbar } from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import RouteDialog from "@/components/routeDialog"

const vazir = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazir',
  display: 'swap'
})

const markazi = Markazi_Text({
  subsets: ['arabic'],
  variable: '--font-markazi',
  display: 'swap'
})

const doran = localFont({
  src: './fonts/Doran.woff',
  variable: '--font-doran',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#F59E0B',
}

export const metadata: Metadata = {
  title: "QQ Cafe",
  description: "وبسایت کافه‌رستری و فضای اشتراکی قوشاقاف",
  manifest: "/manifest.json",
  // themeColor: "#F59E0B",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QQ Cafe",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${doran.variable} ${markazi.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="QQ Cafe" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/qqicon.ico" sizes="any" />
      </head>
      <body>
        <Providers>
          <ToastProvider>
            <Navbar />
            {children}
            <RouteDialog />
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}

