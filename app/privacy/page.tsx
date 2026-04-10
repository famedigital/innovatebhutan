export const metadata: Metadata = {
  title: 'Compliance Protocols & Data Governance | INNOVATE BHUTAN',
  description: 'Operational governance, data protocols, and terms of engagement for the Innovate Bhutan talent brokerage network.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#020617] selection:bg-[#39FF14]/30">
      <Navigation />
      
      {/* Header */}
      <section className="pt-32 pb-16 bg-[#020617] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#39FF14]">Data Governance v2.4</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tighter uppercase leading-[0.9]">
            Compliance <br/><span className="text-[#39FF14]">Protocols</span>
          </h1>
          <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
            Last Synchronization: April 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-[#020617]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-20">
          {/* Privacy Policy */}
          <div className="relative">
            <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#39FF14] to-transparent hidden md:block" />
            <h2 className="text-3xl font-bold text-white mb-10 tracking-tighter uppercase tracking-[0.2em] flex items-center gap-4">
              <div className="w-8 h-[1px] bg-[#39FF14]" />
              Data Privacy
            </h2>
            
            <div className="space-y-12">
              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-[#39FF14]/20 transition-all group">
                <h3 className="text-xs font-bold text-[#39FF14] uppercase tracking-[0.3em] mb-4 font-mono">01_Telemetric Collection</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  We capture operational telemetry provided directly through the network, including identity signatures, 
                  comm-links, digital receipts, and mission logs transmitted via encrypted WhatsApp channels or the System Console.
                </p>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-[#39FF14]/20 transition-all group">
                <h3 className="text-xs font-bold text-[#39FF14] uppercase tracking-[0.3em] mb-4 font-mono">02_Deployment Usage</h3>
                <p className="text-white/40 leading-relaxed mb-6 font-medium">
                  Telemetry is utilized to:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Initialize mission responses",
                    "Architect skill brokerage clusters",
                    "Monitor node status and deployment",
                    "Optimize network intelligence",
                    "Maintain compliance with kingdom law"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-tighter">
                      <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-[#39FF14]/20 transition-all group">
                <h3 className="text-xs font-bold text-[#39FF14] uppercase tracking-[0.3em] mb-4 font-mono">03_Link Isolation</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  We enforce zero-leak protocols. Your operational data is never traded across external grids. 
                  Encrypted links are established only with verified hardware partners and mission-critical nodes.
                </p>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-[#39FF14]/20 transition-all group">
                <h3 className="text-xs font-bold text-[#39FF14] uppercase tracking-[0.3em] mb-4 font-mono">04_Encryption Layer</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  Multi-layer cryptographic shields protect every data packet. While we maintain Tier-1 resilience, 
                  the nature of the global internet grid means 100% absolute isolation is a theoretical limit.
                </p>
              </div>
            </div>
          </div>

          {/* Terms of Service */}
          <div className="relative">
            <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-teal-500 to-transparent hidden md:block" />
            <h2 className="text-3xl font-bold text-white mb-10 tracking-tighter uppercase tracking-[0.2em] flex items-center gap-4">
              <div className="w-8 h-[1px] bg-teal-500" />
              Engagement Terms
            </h2>
            
            <div className="space-y-12">
              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-teal-500/20 transition-all group">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em] mb-4 font-mono">Protocol_01: Agreement</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  Accessing the Innovate Bhutan Link Mesh constitutes full acceptance of the Deployment Protocols. 
                  Deviation from these terms may result in immediate node deactivation.
                </p>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-teal-500/20 transition-all group">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em] mb-4 font-mono">Protocol_02: The Grid</h3>
                <p className="text-white/40 leading-relaxed mb-6 font-medium">
                  Our network brokers elite talent for:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Master POS Clusters",
                    "Surveillance Optics Arrays",
                    "Identity Identity Mapping Nodes",
                    "Hospitality Cloud OS",
                    "Mission-Critical Network Core",
                    "Power Resilience Grids",
                    "Neural Software Architecture"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/30 text-xs font-bold uppercase tracking-tighter">
                      <div className="w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_8px_#14b8a6]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-teal-500/20 transition-all group">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em] mb-4 font-mono">Protocol_03: Link Quotas</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  All deployment schemas are valid for 30 cycles. Market volatility may trigger hardware node adjustment. 
                  Final mission parameters are locked during order initialization.
                </p>
              </div>

              <div className="bg-white/[0.02] rounded-3xl p-8 border border-white/5 hover:border-teal-500/20 transition-all group">
                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-[0.3em] mb-4 font-mono">Protocol_04: Resilience Guard</h3>
                <p className="text-white/40 leading-relaxed font-medium">
                  All nodes carry factory resilience guards. Our Command Architects provide troubleshooting for the 
                  duration of the link. Guardianship does not extend to misuse, unauthorized node modification, or 
                  natural system resets.
                </p>
              </div>

              <div className="bg-[#0f172a] rounded-[48px] p-12 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-[120px]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-[0.3em] mb-6 font-mono">Command Contact</h3>
                <div className="space-y-4">
                   <p className="text-lg font-bold text-white tracking-tighter uppercase mb-4">INNOVATE BHUTAN HUB</p>
                   <div className="space-y-2 text-sm text-white/40 font-medium">
                     <p>Operational Zone: Norzin Lam, Thimphu</p>
                     <p>Kingdom of Bhutan</p>
                     <p className="text-[#39FF14] font-mono">Node ID: +975 17 000 000</p>
                     <p className="text-[#39FF14] font-mono">Data Link: protocols@network.com</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <FooterSection />
      <WhatsAppButton />
    </main>
  );
}