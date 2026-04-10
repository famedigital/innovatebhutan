import type { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { FooterSection } from '@/components/footer-section'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CompanyContent } from './company-content'

export const metadata: Metadata = {
  title: 'Operational Strategy & Legacy | INNOVATE BHUTAN Talent Brokerage',
  description: 'The architectural foundation of Bhutan\'s premier technology talent brokerage. Founded in 2009, we broker elite skills for high-stakes operations across 20 dzongkhags.',
  keywords: 'Innovate Bhutan strategy, technology brokerage, talent broker Thimphu, POS experts Bhutan, CCTV architects, IT talent Bhutan',
}

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[#020617] selection:bg-[#39FF14]/30">
      <Navigation />
      <CompanyContent />
      <FooterSection />
      <WhatsAppButton />
    </main>
  )
}