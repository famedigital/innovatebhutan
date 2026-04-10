import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { FooterSection } from '@/components/footer-section'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { BrandsContent } from './brands-content'

export const metadata: Metadata = {
  title: 'Strategic Partnership Matrix | Global Tech Nodes | INNOVATE BHUTAN',
  description: 'Official authorized brokerage for world-leading technology brands in Bhutan. Linking 500+ enterprises to global hardware nodes including Hikvision, ZKTeco, and Cisco.',
  keywords: 'Hikvision Bhutan authorized, ZKTeco identity nodes, Cisco network backbone, tech partnership Bhutan, talent brokerage hardware',
}

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-[#020617] selection:bg-[#39FF14]/30">
      <Navigation />
      <BrandsContent />
      <FooterSection />
      <WhatsAppButton />
    </main>
  )
}