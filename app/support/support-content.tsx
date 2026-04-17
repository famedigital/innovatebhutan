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
  CalendarCheck,
  Users,
  MessageSquare,
  Award
} from "lucide-react";

const supportServices = [
  {
    icon: MessageSquare,
    title: "Rancelab Support",
    description: "Dedicated WhatsApp support with staff teams for comprehensive ERP assistance",
    href: "/support/help",
    features: ["Day & Night Teams", "WhatsApp Groups", "Staff + Client + Accounts", "Real-time Response"]
  },
  {
    icon: Shield,
    title: "Warranty Coverage",
    description: "Product warranty coverage and extended warranty options for all products",
    href: "/support/warranty",
    features: ["Hardware Warranty", "Software Support", "Extended Plans", "Quick Claims"]
  },
  {
    icon: Wrench,
    title: "Service Request",
    description: "Submit service requests with priority levels and tracking",
    href: "/support/service",
    features: ["Priority Levels", "Quick Response", "Status Tracking", "Expert Team"]
  }
];

const faqs = [
  {
    question: "What support options are available for Rancelab ERP?",
    answer: "We provide dedicated WhatsApp support with specialized staff teams. Our service includes day-time and late-night shift teams, WhatsApp groups with staff, client, and accounts representatives, and real-time response for urgent issues."
  },
  {
    question: "Where is your support center located?",
    answer: "Our support center is located at Express Highway, next to Green Kitchen in Thimphu. We're easily accessible and provide both on-site and remote support."
  },
  {
    question: "What are your support hours?",
    answer: "Our dedicated support teams operate day and night shifts. Daytime team covers standard business hours while our late-night team ensures after-hours support for emergencies. WhatsApp support is available 24/7."
  },
  {
    question: "How do I request warranty service?",
    answer: "You can request warranty service through our Service Request portal or contact us directly via WhatsApp. Our team will guide you through the warranty claim process and provide quick resolution."
  },
  {
    question: "Do you offer support outside Thimphu?",
    answer: "Yes, we provide support across Bhutan with remote troubleshooting available nationwide. For on-site support, we prioritize Thimphu, Paro, and Punakha with quick response times."
  }
];

const serviceTypes = [
  { icon: Wrench, name: "Technical Support", description: "Rancelab ERP & Software" },
  { icon: Shield, name: "Warranty Service", description: "Hardware & Software Claims" },
  { icon: CalendarCheck, name: "Annual Maintenance", description: "Preventive Maintenance" },
  { icon: HeadphonesIcon, name: "Remote Support", description: "WhatsApp & TeamViewer" },
  { icon: Zap, name: "Emergency Support", description: "24/7 Urgent Assistance" },
  { icon: Users, name: "On-site Service", description: "Technical Visits" },
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
        toast.success('Support Request Submitted!', {
          description: 'Your support request has been received. Our team will contact you shortly.'
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
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="Your Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Phone Number</label>
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
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            placeholder="your@email.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Service Type</label>
          <select
            required
            value={formData.serviceType}
            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
          >
            <option value="">Select Service Type</option>
            {serviceTypes.map((type) => (
              <option key={type.name} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Location</label>
        <select
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none transition-all"
        >
          <option value="">Select Your Location</option>
          {dzongkhags.map((dz) => (
            <option key={dz} value={dz}>{dz}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">Issue Description</label>
        <textarea
          required
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
          placeholder="Please describe your issue or request..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-5 bg-primary text-[#020617] font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <Send className="w-4 h-4" />
        {isSubmitting ? 'Processing...' : 'Submit Request'}
      </button>
    </form>
  );
}

export function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-16 bg-background text-foreground transition-colors duration-500">
      {/* 🚀 HERO SECTION */}
      <section className="relative py-20 overflow-hidden border-b border-border">
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
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">24/7 Support Hub</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter leading-none dark:neon-text">
              Premium <span className="text-primary">Support</span> Center
            </h1>

            <p className="text-base text-foreground/60 mb-10 leading-relaxed max-w-xl mx-auto">
              At <strong className="text-primary">Innovate.bt</strong>, we understand that reliable after-sales support is crucial.
              Our dedicated support teams provide comprehensive assistance for Rancelab ERP, custom software, and all our technology solutions.
            </p>

            <div className="flex flex-wrap justify-center gap-8 border-t border-border pt-8">
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">Response: <span className="text-foreground">Within 2 Hours</span></span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">Coverage: <span className="text-foreground">All Bhutan</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📡 SUPPORT SERVICES GRID */}
      <section className="py-16 bg-card/30">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-foreground mb-3">Our Support Services</h2>
            <p className="text-foreground/60">Comprehensive support solutions for your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {supportServices.map((service, i) => (
              <motion.a
                key={i}
                href={service.href}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-3xl p-8 text-center hover:border-primary/40 hover:shadow-2xl transition-all group relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-all group-hover:scale-110 group-hover:bg-primary">
                  <service.icon className="w-8 h-8 text-primary group-hover:text-black transition-all" />
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">{service.title}</h3>
                <p className="text-foreground/50 text-sm mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center justify-center gap-2 text-xs text-foreground/40">
                      <Award className="w-3 h-3 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* 🧩 SUPPORT FEATURES */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">Why Choose Our Support</h2>
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

      {/* 💻 SUPPORT HIGHLIGHTS */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-8 tracking-tighter uppercase leading-none">
                Dedicated <span className="text-primary">Support</span> Teams
              </h2>
              <p className="text-lg text-foreground/40 mb-10 leading-relaxed font-medium max-w-xl">
                Our Rancelab support features dedicated staff teams operating day and night shifts. WhatsApp groups include staff,
                client representatives, and accounts team for comprehensive assistance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Day & Night Teams", d: "Round-the-clock coverage" },
                  { t: "WhatsApp Groups", d: "Staff + Client + Accounts" },
                  { t: "Quick Response", d: "Within 2 hours response" },
                  { t: "Professional Team", d: "Experienced technical staff" }
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-8 bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground mb-1">Visit Our Support Center</h3>
                    <p className="text-foreground/50 text-sm">
                      Located at <strong className="text-primary">Express Highway, next to Green Kitchen</strong>, Thimphu
                    </p>
                  </div>
                </div>
              </motion.div>
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

      {/* 📚 FAQ SECTION */}
      <section className="py-20 border-t border-border bg-muted/20">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">Frequently Asked Questions</h2>
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
