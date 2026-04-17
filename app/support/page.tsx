import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { FooterSection } from '@/components/footer-section'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { SupportContent } from './support-content'

export const metadata: Metadata = {
  title: 'Support Hub | Premium Customer Support | innovates.bt',
  description: 'Premium customer support for Rancelab ERP, custom software, and all technology solutions. Day and night shift teams, WhatsApp support, and dedicated assistance across Bhutan.',
  keywords: 'customer support Bhutan, Rancelab support, WhatsApp support, technical support Thimphu, innovates.bt support',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navigation />
      <SupportContent />
      <FooterSection />
      <WhatsAppButton />
    </main>
  )
}
