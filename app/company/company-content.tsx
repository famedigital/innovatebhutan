"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Users, MapPin, Calendar, CheckCircle2, ArrowRight, Star, Globe, TrendingUp } from "lucide-react";

const timeline = [
  { year: "2009", title: "Genesis", description: "Inception as a specialized IT node in Thimphu, mapping the kingdom's technological future." },
  { year: "2012", title: "Security Matrix", description: "Authorized partner for Hikvision. Bridging high-stakes surveillance into Bhutan's core security." },
  { year: "2015", title: "Nationwide Mesh", description: "Established operational presence across all 20 dzongkhags, ensuring 100% network reach." },
  { year: "2018", title: "Hospitality Cloud", description: "Exclusive Rancelab partnership. Revolutionizing luxury guest experience flows." },
  { year: "2020", title: "Operational Hub", description: "Activated state-of-the-art authorized diagnostics and service center in Thimphu." },
  { year: "2024", title: "Elite Talent Brokerage", description: "Pivoted to high-performance talent brokerage, linking 500+ enterprises with elite skillsets." },
];

const values = [
  { icon: Star, title: "Precision", description: "We broker excellence. Every skill, every node must be precision-engineered." },
  { icon: Globe, title: "Kingdom Logic", description: "Decades of deep-rooted understanding of Bhutan's unique operational terrain." },
  { icon: TrendingUp, title: "Infinite Growth", description: "Continuous evolution of our talent matrix to anticipate future market shifts." },
  { icon: Users, title: "Operational Link", description: "Your success is the heartbeat of our network. We are the link to your empire." },
];

const achievements = [
  { number: "500+", label: "Domains Linked", sub: "Operational Success" },
  { number: "20/20", label: "Dzongkhag Nodes", sub: "Network Coverage" },
  { number: "15+ Yrs", label: "Industry Cycles", sub: "Architectural Experience" },
  { number: "99%", label: "Uptime Logic", sub: "Client Satisfaction" },
  { number: "60+", label: "Luxury Hotels", sub: "PMS Integration" },
  { number: "250+", label: "POS Clusters", sub: "Hard-linked Units" },
];

export function CompanyContent() {
  return (
    <div className="pt-20 bg-[#020617]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-8 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                <Award className="w-4 h-4 text-[#39FF14]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#39FF14]">Established 2009</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                Architects of the <span className="text-[#39FF14]">Operational</span> Future
              </h1>
              
              <p className="text-xl text-white/50 mb-10 leading-relaxed font-medium">
                For over 15 years, we've brokered elite technical skills for Bhutan's mission-critical operations. 
                Our legacy is built on linking 500+ enterprises with high-performance operational infrastructure.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                  { icon: CheckCircle2, text: "500+ Hubs Operational" },
                  { icon: CheckCircle2, text: "Nationwide Node Mesh" },
                  { icon: CheckCircle2, text: "Authorized Tech Broker" },
                  { icon: CheckCircle2, text: "15+ Yr Industry Cycle" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/50 hover:text-[#39FF14] transition-colors">
                    <item.icon className="w-5 h-5 text-[#39FF14]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <a
                  href="https://wa.me/97517000000"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#39FF14] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                >
                  Initiate Link-up
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-[#39FF14]/10 rounded-full blur-[100px] opacity-50" />
              <div className="relative bg-[#0f172a] rounded-[48px] overflow-hidden border border-white/10 p-2">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
                  alt="Innovate Bhutan Strategy Hub"
                  className="w-full h-[500px] object-cover rounded-[40px] grayscale opacity-40 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent " />
                <div className="absolute bottom-10 left-10 right-10">
                  <p className="text-[#39FF14] text-xs font-bold uppercase tracking-[0.3em] mb-2">Operational Command</p>
                  <p className="text-white/80 font-medium">Strategic Hub Serving All Dzongkhags</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 bg-white/[0.03] border-b border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
            {achievements.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold font-mono text-white tracking-tighter mb-2">{stat.number}</div>
                <div className="text-[#39FF14] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                <div className="text-white/20 text-[8px] uppercase tracking-tighter">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-32 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tighter uppercase tracking-[0.2em]">Operational Purpose</h2>
            <div className="h-1 w-20 bg-[#39FF14] mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] p-12 border border-white/5 hover:border-[#39FF14]/20 transition-all duration-500"
            >
              <div className="w-20 h-20 bg-[#39FF14]/5 rounded-3xl flex items-center justify-center mb-10 border border-[#39FF14]/20">
                <Target className="w-10 h-10 text-[#39FF14]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 tracking-tighter uppercase">The Mission</h3>
              <p className="text-white/50 leading-relaxed text-lg font-medium">
                To link Bhutan's premier enterprises with high-performance technical talent, 
                architecting operational flows that define the modern kingdom. We are the link 
                between ambition and execution.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.02] backdrop-blur-3xl rounded-[40px] p-12 border border-white/5 hover:border-[#39FF14]/20 transition-all duration-500"
            >
              <div className="w-20 h-20 bg-[#39FF14]/5 rounded-3xl flex items-center justify-center mb-10 border border-[#39FF14]/20">
                <Eye className="w-10 h-10 text-[#39FF14]" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 tracking-tighter uppercase">The Vision</h3>
              <p className="text-white/50 leading-relaxed text-lg font-medium">
                To be the primary node for Bhutan's technological legacy—bridging global innovation 
                with deep-rooted kingdom logic. We envision an era where every infrastructure 
                is precision-engineered for excellence.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter uppercase tracking-[0.3em]">Core Directives</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/5 hover:border-[#39FF14]/20 transition-all group"
              >
                <div className="w-14 h-14 bg-[#39FF14]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-all">
                  <value.icon className="w-7 h-7 text-[#39FF14] group-hover:text-[#020617] transition-all" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">{value.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed font-medium uppercase tracking-tighter">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 bg-[#020617]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter uppercase tracking-[0.3em]">The Legacy Loop</h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-[#39FF14]/20" />
            
            <div className="space-y-24">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-8 border border-white/5 inline-block text-left w-full group hover:border-[#39FF14]/30 transition-all duration-500">
                      <div className="text-2xl font-bold font-mono text-[#39FF14] mb-2">{item.year}</div>
                      <div className="text-lg font-bold text-white uppercase tracking-tighter mb-2">{item.title}</div>
                      <div className="text-sm text-white/40 font-medium leading-relaxed">{item.description}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full relative z-10 shrink-0 mx-4 border-2 border-[#39FF14] bg-[#020617] shadow-[0_0_15px_rgba(57,255,20,0.5)]`} />
                  <div className="w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Matrix */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[#39FF14]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39FF14]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
            Forge Your <br/><span className="text-[#39FF14]">Operational</span> Future
          </h2>
          <p className="text-white/50 mb-12 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Join the link mesh of 500+ Bhutanese enterprises who have scaled with precision. 
            Initiate your legacy loop today.
          </p>
          <a
            href="https://wa.me/97517000000"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#39FF14] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-110 transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)]"
          >
            <ArrowRight className="w-5 h-5" />
            Connect With Architect
          </a>
        </div>
      </section>
    </div>
  );
}