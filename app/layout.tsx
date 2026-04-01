import type { Metadata, Viewport } from 'next'
import { DM_Sans, Montserrat } from 'next/font/google'

import { Providers } from '@/components/providers'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-syne' })

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
    <html lang="en" className={`${montserrat.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-[#080808] text-[#f0f0f0]"><Providers>{children}</Providers></body>
    </html>
  )
}
