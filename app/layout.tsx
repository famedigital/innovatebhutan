import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const oswald = Oswald({ 
  subsets: ["latin"],
  variable: '--font-oswald',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Innovate Bhutan | The Ultimate Talent & Technology Brokerage',
    template: '%s | Innovate Bhutan'
  },
  description: "Bhutan's premier bridge to elite talents, technical experts, and futuristic business solutions. We broker top-tier skills in POS, AI Surveillance, Biometrics, and Custom Enterprise Development for shops, restaurants, and homeowners.",
  generator: 'Innovate Bhutan Portal',
  keywords: [
    'talent broker Bhutan', 'skill brokerage', 'best technical experts Bhutan', 
    'POS installation', 'CCTV experts Thimphu', 'biometric security', 
    'Bhutan tech directory', 'hire developers Bhutan', 'IT consulting Bhutan',
    'hospitality software experts', 'low-voltage technicians'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_BT',
    url: 'https://innovatebhutan.com',
    siteName: 'Innovate Bhutan',
    title: 'Innovate Bhutan | Talent & Technology Brokerage',
    description: 'Bridging the gap between world-class talent and Bhutanese business needs.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  icons: {
    icon: '/innovate-favicon.png',
    apple: '/innovate-favicon.png', /* update apple icon to same png or fallback */
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable} dark`}>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}