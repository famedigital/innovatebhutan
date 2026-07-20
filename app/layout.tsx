import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { PureThemeProvider } from "@/components/PureThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { NavigationDynamic } from "@/components/navigation-dynamic"
import { PwaProvider } from "@/components/pwa/pwa-provider"

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
  metadataBase: new URL('https://www.innovates.bt'),
  title: {
    default: 'INNOVATES BHUTAN | Full-Service IT & Digital Infrastructure Enterprise',
    template: '%s | INNOVATES BHUTAN'
  },
  description: "Bhutan's premier Full-Service IT Firm. We deliver end-to-end digital infrastructure, POS ecosystems, cloud architecture, and mission-critical enterprise software solutions for a high-performance economy.",
  generator: 'INNOVATES BHUTAN ERP',
  applicationName: 'Innovates Bhutan ERP',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Innovates ERP',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'IT Firm Bhutan', 'digital infrastructure', 'enterprise software Bhutan', 
    'POS systems Thimphu', 'IT consulting Bhutan', 'automation services',
    'full-service IT Thimphu', 'software development Bhutan'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_BT',
    url: 'https://innovatesbhutan.com',
    siteName: 'INNOVATES BHUTAN',
    title: 'INNOVATES BHUTAN | Full-Service IT Firm',
    description: 'Transforming Bhutanese business through elite digital infrastructure and 90% automated operations.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A5F4E' },
    { media: '(prefers-color-scheme: dark)', color: '#0A5F4E' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary" suppressHydrationWarning>
        <PureThemeProvider>
          <PwaProvider>
            <NavigationDynamic />
            {children}
          </PwaProvider>
        </PureThemeProvider>
        <Toaster position="bottom-right" theme="dark" closeButton />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
