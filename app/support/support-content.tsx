"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
    answer: "Initiate via WhatsApp at +975 17268753, or deploy a request through our System Console. Response latency is typically 2-4 hours. Emergency overrides are available for Thimphu-based nodes within 60 minutes."
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dzongkhags = [
    "Thimphu", "Paro", "Punakha", "Wangdue Phodrang", "Phuentsholing",
    "Bumthang", "Trongsa", "Zhemgang", "Bajoton", "Sarpang",
    "Chhukha", "Dagana", "Tsirang", "Ha", "Samtse",
    "Gasa", "Lhuentse", "Mongar", "Tashigang", "Tromshoen", "Yongkha", "Zhongar"
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: formData.serviceType,
          message: formData.description,
          formType: 'service-request'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('System Request Executed!', {
          description: 'Your service request has been logged. Our team will contact you shortly.'
        });
        setFormData({
          name: "",
          phone: "",
          email: "",
          serviceType: "",
          location: "",
          description: ""
        });
      } else {
        toast.error('Request Failed', {
          description: result.error || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      toast.error('Network Error', {
        description: 'Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Identity Signature</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="Operator Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Comm Link (Phone)</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="+975 XXX XXX"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Data Receipt (Email)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="operator@network.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Mission Protocol</label>
          <select
            required
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
          >
            <option value="">Select Protocol</option>
            {serviceTypes.map((type) => (
              <option key={type.name} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Target Node (Dzongkhag)</label>
        <select
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
        >
          <option value="">Select Target Zone</option>
          {dzongkhags.map((dz) => (
            <option key={dz} value={dz}>{dz}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Incident Log</label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
          placeholder="Detailed system behavior description..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-5 bg-primary text-[#020617] font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Processing...' : 'Execute System Request'}
      </button>
    </form>
  );
}

export function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-16 bg-background text-foreground transition-colors duration-500">
      {/* 🚀 COMPACT HERO SECTION */}
      <section className="relative py-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <HeadphonesIcon className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Command Hub Active</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter leading-none dark:neon-text">
              Operational <span className="text-primary">Command</span> Center
            </h1>
            
            <p className="text-base text-foreground/60 mb-10 leading-relaxed max-w-xl mx-auto">
              Institutional-grade diagnostic and maintenance protocols for Bhutan's technical infrastructure. 
              Our systems are on standby mapping your operational resilience.
            </p>

            <div className="flex flex-wrap justify-center gap-8 border-t border-border pt-8">
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">Latency: <span className="text-foreground">&lt; 240 MINS</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">Coverage: <span className="text-foreground">Total Matrix</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📡 COMPACT CONTACT GRID */}
      <section className="py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { i: MessageCircle, t: "Override Link", d: "WhatsApp Protocol", v: "+975 17 268 753", c: "bg-primary/10 text-primary", h: "https://wa.me/97517268753" },
              { i: Phone, t: "Voice Comms", d: "Standard Link", v: "09:00 - 18:00 BTT", c: "bg-blue-500/10 text-blue-400", h: "tel:+97517268753" },
              { i: Mail, t: "Data Packet", d: "Direct Log", v: "support@innovatebhutan.com", c: "bg-purple-500/10 text-purple-400", h: "mailto:support@innovatebhutan.com" }
            ].map((link, i) => (
              <motion.a
                key={i}
                href={link.h}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-3xl p-6 text-center hover:border-primary/40 hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className={`w-14 h-14 ${link.c} rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all group-hover:scale-110`}>
                  <link.i className="w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1">{link.t}</h3>
                <p className="text-primary text-[9px] font-black uppercase tracking-widest mb-3">{link.d}</p>
                <p className="text-foreground/40 text-[11px] font-mono group-hover:text-foreground transition-colors">{link.v}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* 🧩 PROTOCOL MATRIX */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">Support Protocols</h2>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {serviceTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all flex items-start gap-5 group"
              >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 border border-border group-hover:bg-primary transition-all duration-300">
                  <type.icon className="w-5 h-5 text-primary group-hover:text-black transition-all" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-wider mb-2">{type.name}</h3>
                  <p className="text-[11px] text-foreground/40 leading-relaxed">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 💻 SYSTEM CONSOLE */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-8 tracking-tighter uppercase leading-none">
                System <span className="text-primary">Request</span> Console
              </h2>
              <p className="text-lg text-foreground/40 mb-10 leading-relaxed font-medium max-w-xl">
                Initiate a mission protocol through our encrypted manifold. Response units are deployed within 240 minutes of authentication.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Verified Response", d: "2-4 Hour Latency Window" },
                  { t: "Encryption Shield", d: "Secure Data Requests" },
                  { t: "Priority Link", d: "AML Tier 1 Active Response" },
                  { t: "Node Awareness", d: "Global Cluster Tracking" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-[10px] font-black text-foreground uppercase tracking-widest">{item.t}</div>
                      <div className="text-[9px] text-primary/50 uppercase tracking-widest font-bold">{item.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-[32px] p-8 border border-border relative overflow-hidden shadow-2xl"
            >
              <ServiceRequestForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📚 FAQ ARCHIVE */}
      <section className="py-20 border-t border-border bg-muted/20">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">Protocol Archive</h2>
            <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-[13px] font-black text-foreground uppercase tracking-tight pr-6">{faq.question}</span>
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-primary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-foreground/30" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-[13px] text-foreground/50 leading-relaxed font-medium border-t border-border/50 pt-4"
                    >
                      {faq.answer}
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
