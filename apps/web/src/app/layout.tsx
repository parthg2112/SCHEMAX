"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"
import { LoadingScreen } from "@/components/loading-screen"
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <LoadingScreen />
        </body>
      </html>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col h-screen overflow-hidden`}>
        <Providers>
          <Header />
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
