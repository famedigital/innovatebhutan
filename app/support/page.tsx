import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { FooterSection } from '@/components/footer-section'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { SupportContent } from './support-content'

export const metadata: Metadata = {
  title: 'Operational Command Center | Technical Nodes & AML Protocol | INNOVATE BHUTAN',
  description: 'Mission-critical technical support for Bhutan\'s infrastructure. AML protocols, node diagnostics, and emergency overrides across all 20 dzongkhags.',
  keywords: 'technical command Bhutan, AML protocol, node diagnostics Thimphu, infrastructure support Bhutan, emergency tech override',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#020617] selection:bg-[#39FF14]/30">
      <Navigation />
      <SupportContent />
      <FooterSection />
      <WhatsAppButton />
    </main>
  )
}