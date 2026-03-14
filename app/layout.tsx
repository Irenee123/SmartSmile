import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'

import { Providers } from '@/components/providers'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'SmartSmile – Preventive Oral Health Screening with AI',
  description: 'Upload a smartphone photo of your teeth and get instant, AI-powered preventive insights — no dentist appointment needed.',
}

export const viewport: Viewport = {
  themeColor: '#080808',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#080808] text-[#f0f0f0]"><Providers>{children}</Providers></body>
    </html>
  )
}
