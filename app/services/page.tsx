import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { FooterSection } from '@/components/footer-section'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ServicesContent } from './services-content'

export const metadata: Metadata = {
  title: 'Technology Services in Bhutan | POS, CCTV, Biometric | INNOVATE BHUTAN',
  description: 'Leading technology solutions provider in Bhutan. Services include POS systems, CCTV surveillance, biometric access control, hotel management software, custom development, UPS & power solutions, and network infrastructure. Serving all 20 dzongkhags with authorized service centers.',
  keywords: 'POS system Bhutan, CCTV camera Thimphu, biometric attendance Bhutan, hotel software Bhutan, network infrastructure Bhutan, UPS inverter Bhutan, technology solutions Bhutan',
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
      <Navigation />
      <ServicesContent />
      <FooterSection />
      <WhatsAppButton />
    </main>
  )
}
