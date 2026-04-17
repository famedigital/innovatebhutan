"use client";

import { motion } from "framer-motion";
import { HeadphonesIcon, MessageSquare, Phone, MapPin, Clock, Users, Shield, Award, CheckCircle, ArrowRight, Zap, Building2 } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

const supportFeatures = [
  {
    icon: MessageSquare,
    title: "Dedicated WhatsApp Support",
    description: "Rancelab ERP clients receive dedicated WhatsApp support with personalized groups including technical staff, accounts team, and client representatives for real-time assistance.",
    highlights: ["Real-time Responses", "Dedicated Groups", "Multi-department Access", "Screen Sharing Support"]
  },
  {
    icon: Users,
    title: "Round-the-Clock Coverage",
    description: "Our support team operates in strategic shifts to ensure coverage during business hours and after-hours emergencies. Daytime and night-shift teams guarantee uninterrupted assistance.",
    highlights: ["Day & Night Shifts", "24/7 Emergency", "Quick Response Time", "Continuous Monitoring"]
  },
  {
    icon: Shield,
    title: "Comprehensive Support Plans",
    description: "From Rancelab ERP troubleshooting to networking infrastructure and custom software development, we provide complete technical support for all our solutions and implementations.",
    highlights: ["All Products Covered", "Preventive Maintenance", "Remote & On-site", "Regular Updates"]
  },
  {
    icon: Award,
    title: "Bhutan's Most Reliable Support",
    description: "We understand that Bhutanese businesses prioritize reliable after-sales service. Our commitment to exceptional support has made us the trusted choice for 300+ businesses across the nation.",
    highlights: ["99% Satisfaction Rate", "Local Expertise", "Proven Track Record", "Client-Centric Approach"]
  }
];

const supportProcess = [
  {
    step: "01",
    title: "Instant Connection",
    description: "Reach out via WhatsApp, phone, or visit our office. Our team responds within minutes during business hours."
  },
  {
    step: "02",
    title: "Expert Assessment",
    description: "Our technical team analyzes your issue and determines the best solution approach."
  },
  {
    step: "03",
    title: "Rapid Resolution",
    description: "Most issues resolved remotely via WhatsApp with screen sharing. On-site support dispatched when needed."
  },
  {
    step: "04",
    title: "Follow-Up Care",
    description: "We ensure complete resolution and provide preventive guidance to avoid future issues."
  }
];

const supportTypes = [
  {
    category: "Rancelab ERP Support",
    icon: MessageSquare,
    description: "Dedicated WhatsApp groups with technical specialists, accounts team, and client representatives for comprehensive ERP support.",
    responseTime: "Within 1 hour",
    availability: "7 AM - 10 PM daily",
    features: ["Real-time troubleshooting", "Data backup assistance", "User guidance", "Account coordination"]
  },
  {
    category: "Software Development",
    icon: Zap,
    description: "Technical support for custom software applications including bug fixes, updates, and feature enhancements.",
    responseTime: "Within 4 hours",
    availability: "9 AM - 6 PM weekdays",
    features: ["Bug fixing", "Feature requests", "Performance optimization", "Security updates"]
  },
  {
    category: "Infrastructure & Security",
    icon: Shield,
    description: "Networking, CCTV, and security system support with both remote configuration and on-site maintenance services.",
    responseTime: "Emergency: 1 hour | Standard: 4 hours",
    availability: "24/7 emergency support",
    features: ["Network diagnostics", "CCTV troubleshooting", "Security system checks", "On-site repairs"]
  },
  {
    category: "General Inquiries",
    icon: Phone,
    description: "Sales consultations, project discussions, and general business inquiries via phone, email, or in-person meetings.",
    responseTime: "Within 2 hours",
    availability: "9 AM - 6 PM weekdays",
    features: ["Product information", "Quotation requests", "Project planning", "Technical consultations"]
  }
];

const whyChooseUs = [
  {
    icon: Users,
    title: "Dedicated Support Team",
    description: "Every client gets a dedicated support team familiar with their specific setup and requirements."
  },
  {
    icon: MessageSquare,
    title: "WhatsApp-First Approach",
    description: "Quick, convenient communication through WhatsApp with screen sharing for immediate issue resolution."
  },
  {
    icon: MapPin,
    title: "Strategic Location",
    description: "Our office at Express Highway, next to Green Kitchen, provides easy access for clients across Thimphu."
  },
  {
    icon: Shield,
    title: "Bhutanese Expertise",
    description: "Local team understands Bhutanese business context, regulations, and operational requirements."
  }
];

function HelpCenterContent() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full mb-8">
              <HeadphonesIcon className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">24/7 Support</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-6 dark:neon-text tracking-tight">
              Unmatched Customer{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Support Excellence
              </span>
            </h1>

            <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed mb-8">
              At <strong className="text-primary">innovates.bt</strong>, we understand that reliable after-sales support is the cornerstone of technology adoption.
              Our dedicated support team ensures your business operations never skip a beat.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/97517268753"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
              >
                <MessageSquare className="w-5 h-5" />
                WhatsApp Support
              </a>
              <a
                href="tel:+97517268753"
                className="inline-flex items-center gap-3 px-8 py-4 bg-card border-2 border-border text-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:border-primary/30 hover:text-primary transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
            </div>
          </motion.div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-black text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-foreground/50 mb-4 leading-relaxed">{feature.description}</p>
                <ul className="space-y-1">
                  {feature.highlights.map((highlight, hi) => (
                    <li key={hi} className="flex items-center gap-2 text-xs text-foreground/40">
                      <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Process */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Our Support Process</h2>
            <p className="text-lg text-foreground/60">Streamlined assistance designed for maximum efficiency</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {supportProcess.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-all h-full">
                  <div className="text-4xl font-black text-primary/20 mb-3">{step.step}</div>
                  <h3 className="text-lg font-black text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">{step.description}</p>
                </div>
                {i < supportProcess.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Comprehensive Support Coverage</h2>
            <p className="text-lg text-foreground/60">Specialized assistance for every product and service</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {supportTypes.map((support, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all"
              >
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <support.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-foreground mb-2">{support.category}</h3>
                      <p className="text-sm text-foreground/50 leading-relaxed mb-4">{support.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-[10px] uppercase tracking-wider text-foreground/30 mb-1">Response Time</p>
                      <p className="text-sm font-black text-primary">{support.responseTime}</p>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                      <p className="text-[10px] uppercase tracking-wider text-foreground/30 mb-1">Availability</p>
                      <p className="text-sm font-black text-foreground">{support.availability}</p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {support.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-xs text-foreground/50">
                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Why Businesses Trust Us</h2>
            <p className="text-lg text-foreground/60">The innovates.bt advantage in customer support</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-all"
              >
                <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-base font-black text-foreground uppercase tracking-wider mb-3">{item.title}</h3>
                <p className="text-xs text-foreground/50 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Location Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-background rounded-3xl p-8 border border-border"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black text-foreground mb-2">Visit Our Support Center</h3>
                <p className="text-foreground/60 leading-relaxed">
                  Located at <strong className="text-primary">Express Highway, next to Green Kitchen</strong>, our dedicated support center
                  is easily accessible for clients across Thimphu. Drop by for in-person consultations, technical support,
                  or to discuss your upcoming projects.
                </p>
              </div>
              <a
                href="https://wa.me/97517268753"
                className="shrink-0 px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-12 border border-border relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="relative">
              <MessageSquare className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4 dark:neon-text">
                Ready for Exceptional Support?
              </h2>
              <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                Join 300+ businesses across Bhutan who trust innovates.bt for reliable, professional, and responsive
                technical support. Experience the difference that dedicated customer service makes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/97517268753"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
                >
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp Us Now
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-background border-2 border-border text-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:border-primary/30 hover:text-primary transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                  Visit Our Office
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <>
      <Navigation />
      <HelpCenterContent />
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}