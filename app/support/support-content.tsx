"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Clock, 
  Shield, 
  Wrench,
  ChevronDown,
  ChevronUp,
  Send,
  MapPin,
  Zap,
  HeadphonesIcon,
  CalendarCheck
} from "lucide-react";

const faqs = [
  {
    question: "What is the Resilience Guard period?",
    answer: "Most nodes come with 1-3 year high-stakes protection. POS clusters typically have 1 year, Surveillance Optics 2-3 years, and Network Backbones up to 10 years. Extended resilience protocols are available via Annual Maintenance Links (AML)."
  },
  {
    question: "How do I initiate a priority support link?",
    answer: "Initiate via WhatsApp at +975 17 000 000, or deploy a request through our System Console. Response latency is typically 2-4 hours. Emergency overrides are available for Thimphu-based nodes within 60 minutes."
  },
  {
    question: "Is on-site diagnostic available across all 20 nodes?",
    answer: "Affirmative. We deploy mobile diagnostic units across all 20 dzongkhags. Same-day response for Thimphu, Paro, and Phuentsholing clusters. Remote troubleshooting is available 24/7."
  },
  {
    question: "What are the Operational Hours?",
    answer: "Our Command Center is active Monday to Saturday, 09:00 to 18:00 (BTT). Emergency support links are never dormant and can be triggered via our WhatsApp override."
  },
  {
    question: "Do you offer Operational Maintenance Contracts?",
    answer: "Yes, we offer Annual Maintenance Links (AML) for high-priority enterprises. AML protocols include scheduled node audits, zero-latency response, and shielded parts pricing."
  }
];

const serviceTypes = [
  { icon: Wrench, name: "Node Deployment", description: "Architectural setup & sync" },
  { icon: Shield, name: "Resilience Guard", description: "Warranty & shield claims" },
  { icon: CalendarCheck, name: "AML Protocol", description: "Annual maintenance links" },
  { icon: HeadphonesIcon, name: "Remote Diagnostics", description: "Zero-latency troubleshooting" },
  { icon: Zap, name: "Emergency Override", description: "24/7 urgent node repair" },
  { icon: MapPin, name: "On-site Audit", description: "Physical node verification" },
];

function ServiceRequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceType: "",
    location: "",
    description: ""
  });

  const dzongkhags = [
    "Thimphu", "Paro", "Punakha", "Wangdue Phodrang", "Phuentsholing", 
    "Bumthang", "Trongsa", "Zhemgang", "Bajoton", "Sarpang", 
    "Chhukha", "Dagana", "Tsirang", "Ha", "Samtse",
    "Gasa", "Lhuentse", "Mongar", "Tashigang", "Tromshoen", "Yongkha", "Zhongar"
  ];

  return (
    <form name="service-request" method="POST" data-netlify="true" className="space-y-6">
      <input type="hidden" name="form-name" value="service-request" />
      
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Identity Signature</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#39FF14] focus:border-transparent transition-all"
            placeholder="Operator Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Comm Link (Phone)</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#39FF14] focus:border-transparent transition-all"
            placeholder="+975 XXX XXX"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Data Receipt (Email)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#39FF14] focus:border-transparent transition-all"
            placeholder="operator@network.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Mission Protocol</label>
          <select
            required
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-[#39FF14] appearance-none transition-all"
          >
            <option value="" className="bg-[#0f172a]">Select Protocol</option>
            {serviceTypes.map((type) => (
              <option key={type.name} value={type.name} className="bg-[#0f172a]">{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Target Node (Dzongkhag)</label>
        <select
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-[#39FF14] appearance-none transition-all"
        >
          <option value="" className="bg-[#0f172a]">Select Target Zone</option>
          {dzongkhags.map((dz) => (
            <option key={dz} value={dz} className="bg-[#0f172a]">{dz}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] ml-2">Incident Log</label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#39FF14] resize-none transition-all"
          placeholder="Detailed system behavior description..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-5 bg-[#39FF14] text-[#020617] font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
      >
        <Send className="w-4 h-4" />
        Execute System Request
      </button>
    </form>
  );
}

export function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-20 bg-[#020617]">
      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-10 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
              <HeadphonesIcon className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#39FF14]">Command Center Active</span>
            </div>
            
            <h1 className="text-5xl sm:text-8xl font-bold text-white mb-8 tracking-tighter leading-[0.85]">
              Operational <br/><span className="text-[#39FF14]">Command </span> Support
            </h1>
            
            <p className="text-xl text-white/50 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              High-stakes diagnostic and maintenance arrays for the kingdom's technical infrastructure. 
              Our architects are on standby mapping your operational resilience.
            </p>

            <div className="flex flex-wrap justify-center gap-10">
              <div className="flex items-center gap-3 text-white font-mono">
                <Clock className="w-5 h-5 text-[#39FF14]" />
                <span className="text-sm tracking-widest uppercase">Latency: &lt; 240 MINS</span>
              </div>
              <div className="flex items-center gap-3 text-white font-mono">
                <Shield className="w-5 h-5 text-[#39FF14]" />
                <span className="text-sm tracking-widest uppercase">Coverage: 20/20 Dzongkhags</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Grid */}
      <section className="py-20 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { i: MessageCircle, t: "Override Link", d: "WhatsApp Protocol", v: "+975 17 000 000", c: "bg-[#39FF14]/5 text-[#39FF14]", h: "https://wa.me/97517000000" },
              { i: Phone, t: "Voice Comms", d: "Standard Link", v: "09:00 - 18:00 BTT", c: "bg-blue-500/5 text-blue-400", h: "tel:+97517000000" },
              { i: Mail, t: "Data Packet", d: "Direct Log", v: "support@network.com", c: "bg-purple-500/5 text-purple-400", h: "mailto:support@innovatebhutan.com" }
            ].map((link, i) => (
              <motion.a
                key={i}
                href={link.h}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0f172a] border border-white/5 rounded-[40px] p-10 text-center hover:border-[#39FF14]/30 transition-all group overflow-hidden relative"
              >
                <div className={`w-20 h-20 ${link.c} rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  <link.i className="w-10 h-10" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-2">{link.t}</h3>
                <p className="text-[#39FF14] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">{link.d}</p>
                <p className="text-white/40 text-xs font-mono group-hover:text-white transition-colors">{link.v}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Service Types Matrix */}
      <section className="py-32 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter uppercase tracking-[0.4em]">Support Protocols</h2>
            <div className="h-[1px] w-20 bg-[#39FF14] mx-auto opacity-50" />
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#white]/[0.02] border border-white/5 rounded-3xl p-8 hover:border-[#39FF14]/20 transition-all duration-300 flex items-start gap-6 group"
              >
                <div className="w-14 h-14 bg-[#39FF14]/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-[#39FF14] transition-all duration-500">
                  <type.icon className="w-7 h-7 text-[#39FF14] group-hover:text-[#020617] transition-all" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">{type.name}</h3>
                  <p className="text-xs text-white/30 uppercase tracking-tighter leading-relaxed">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Request Console */}
      <section className="py-32 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold text-white mb-10 tracking-tighter uppercase leading-[0.9]">
                System <br/><span className="text-[#39FF14]">Request</span> Console
              </h2>
              <p className="text-xl text-white/40 mb-12 leading-relaxed font-medium">
                Initiate a mission protocol through the encrypted console below. Our command architects 
                will verify the data stream and trigger response units within 240 minutes.
              </p>

              <div className="space-y-4">
                {[
                  { t: "Verified Response", d: "2-4 Hour Latency Window" },
                  { t: "Encryption Shield", d: "End-to-End Secure Request" },
                  { t: "Priority Link", d: "AML Tier 1 Active Response" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5">
                    <Zap className="w-5 h-5 text-[#39FF14]" />
                    <div>
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest">{item.t}</div>
                      <div className="text-[9px] text-[#39FF14] uppercase tracking-widest opacity-50">{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#0f172a] rounded-[48px] p-12 border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#39FF14]/5 rounded-bl-[160px]" />
              <ServiceRequestForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Response Metrics */}
      <section className="py-24 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0f172a] rounded-[40px] p-12 border border-white/5 text-center group">
              <div className="w-20 h-20 bg-[#39FF14]/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:bg-[#39FF14]">
                <Clock className="w-10 h-10 text-[#39FF14] group-hover:text-[#020617]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Command Hours</h3>
              <p className="text-white/40 text-xs font-mono tracking-widest">MON - SAT: 09:00 - 18:00 (BTT)</p>
              <p className="text-[#39FF14] text-[9px] font-bold uppercase tracking-[0.4em] mt-4">Emergency Overrides Active</p>
            </div>
            <div className="bg-[#0f172a] rounded-[40px] p-12 border border-white/5 text-center group">
              <div className="w-20 h-20 bg-teal-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transition-all group-hover:bg-teal-500">
                <Zap className="w-10 h-10 text-teal-400 group-hover:text-[#020617]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tighter">Latency Metrics</h3>
              <p className="text-white/40 text-xs font-mono tracking-widest">Standard Link: 120-240 Mins</p>
              <p className="text-[#39FF14] text-[9px] font-bold uppercase tracking-[0.4em] mt-4">Zero-Latency Remote Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Archive (FAQs) */}
      <section className="py-32 bg-[#020617]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tighter uppercase tracking-[0.3em]">Protocol Archive</h2>
            <div className="h-[1px] w-20 bg-[#39FF14] mx-auto opacity-50" />
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/[0.03] rounded-[32px] overflow-hidden border border-white/5 hover:border-[#39FF14]/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-10 text-left transition-colors"
                >
                  <span className="text-lg font-bold text-white uppercase tracking-tighter pr-8">{faq.question}</span>
                  <div className="shrink-0 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#39FF14]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-10 pb-10"
                    >
                      <p className="text-white/40 leading-relaxed font-medium">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}