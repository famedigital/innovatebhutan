"use client";

import { motion } from "framer-motion";
import { Wrench, Clock, AlertCircle, CheckCircle, MessageSquare, Phone, MapPin, FileText, Users, Zap } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

const requestTypes = [
  {
    icon: AlertCircle,
    title: "Technical Support",
    description: "Report technical issues, bugs, or system malfunctions requiring immediate attention",
    priority: "High",
    responseTime: "Within 2 hours",
    examples: ["System crashes", "Data synchronization issues", "Login problems", "Performance degradation"]
  },
  {
    icon: Wrench,
    title: "Maintenance Request",
    description: "Schedule preventive maintenance or request on-site servicing",
    priority: "Medium",
    responseTime: "Within 24 hours",
    examples: ["Regular maintenance", "Equipment servicing", "System optimization", "Health checks"]
  },
  {
    icon: Zap,
    title: "Feature Enhancement",
    description: "Request new features, customizations, or system modifications",
    priority: "Low",
    responseTime: "Within 48 hours",
    examples: ["New module development", "UI customizations", "Report generation", "Integration requests"]
  },
  {
    icon: Users,
    title: "Training & Consultation",
    description: "Request additional training or expert consultation",
    priority: "Medium",
    responseTime: "Within 24 hours",
    examples: ["User training sessions", "Admin consultation", "Best practices review", "Process optimization"]
  }
];

const requestProcess = [
  {
    step: "01",
    title: "Submit Request",
    description: "Fill out the service request form with details about your issue or requirement"
  },
  {
    step: "02",
    title: "Confirmation",
    description: "Receive immediate confirmation with ticket number and expected response time"
  },
  {
    step: "03",
    title: "Assessment",
    description: "Our team reviews your request and may contact you for additional information"
  },
  {
    step: "04",
    title: "Resolution",
    description: "Issue resolved or scheduled based on priority and complexity"
  },
  {
    step: "05",
    title: "Follow-up",
    description: "We ensure complete satisfaction and document the resolution"
  }
];

const priorityLevels = [
  {
    level: "Critical",
    color: "text-red-500",
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    description: "System down, critical business impact",
    response: "Within 1 hour"
  },
  {
    level: "High",
    color: "text-orange-500",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
    description: "Major functionality affected",
    response: "Within 4 hours"
  },
  {
    level: "Medium",
    color: "text-yellow-500",
    bg: "bg-yellow-500/5",
    border: "border-yellow-500/20",
    description: "Partial functionality or workaround available",
    response: "Within 24 hours"
  },
  {
    level: "Low",
    color: "text-green-500",
    bg: "bg-green-500/5",
    border: "border-green-500/20",
    description: "Minor issues or enhancement requests",
    response: "Within 48 hours"
  }
];

function ServiceRequestContent() {
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
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Quick Support</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-6 dark:neon-text tracking-tight">
              Service Request{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Portal
              </span>
            </h1>

            <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed mb-8">
              Submit service requests, report issues, or request enhancements. Our team at <strong className="text-primary">Innovate.bt</strong> is
              committed to rapid response and resolution.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/97517268753?text=Hi, I need technical support"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
              >
                <MessageSquare className="w-5 h-5" />
                Quick WhatsApp Support
              </a>
              <a
                href="tel:+97517268753"
                className="inline-flex items-center gap-3 px-8 py-4 bg-card border-2 border-border text-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:border-primary/30 hover:text-primary transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Emergency Line
              </a>
            </div>
          </motion.div>

          {/* Request Types */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {requestTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <type.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-black text-foreground mb-2">{type.title}</h3>
                <p className="text-sm text-foreground/50 mb-4 leading-relaxed">{type.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/30">Priority</span>
                    <span className="font-black text-primary">{type.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/30">Response</span>
                    <span className="font-black text-foreground">{type.responseTime}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Priority Levels */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Clock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Priority Response Times</h2>
            <p className="text-lg text-foreground/60">We prioritize based on business impact</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {priorityLevels.map((level, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 border ${level.border} ${level.bg} hover:scale-105 transition-all`}
              >
                <div className={`text-xs font-black uppercase tracking-widest mb-2 ${level.color}`}>{level.level}</div>
                <p className="text-sm text-foreground/60 mb-3 leading-relaxed">{level.description}</p>
                <div className="text-lg font-black text-foreground">{level.response}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Process */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <FileText className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">How It Works</h2>
            <p className="text-lg text-foreground/60">Streamlined process for quick resolution</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {requestProcess.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="text-3xl font-black text-primary/20 shrink-0">{step.step}</div>
                  <div className="flex-1 bg-card rounded-xl p-6 border border-border group-hover:border-primary/30 transition-all">
                    <h3 className="text-lg font-black text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-foreground/50">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background rounded-3xl p-12 border border-border text-center"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4 dark:neon-text">
              Need Immediate Assistance?
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              For urgent issues, contact us directly via WhatsApp or phone for fastest response
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <a
                href="https://wa.me/97517268753"
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-black text-foreground mb-1">WhatsApp</h3>
                <p className="text-xs text-foreground/40">Instant Response</p>
              </a>
              <a
                href="tel:+97517268753"
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <Phone className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-black text-foreground mb-1">Phone</h3>
                <p className="text-xs text-foreground/40">+975 17268753</p>
              </a>
              <div className="bg-card rounded-xl p-6 border border-border">
                <MapPin className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-black text-foreground mb-1">Office</h3>
                <p className="text-xs text-foreground/40">Express Highway</p>
              </div>
            </div>

            <div className="text-sm text-foreground/50">
              <p className="mb-2">Office Hours: Sunday - Friday, 9:00 AM - 6:00 PM</p>
              <p>Emergency Support: Available 24/7 for critical issues</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What to Include */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-foreground mb-8 text-center dark:neon-text">What to Include in Your Request</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-black text-foreground mb-4">Required Information</h3>
                <ul className="space-y-3">
                  {["Company name and contact person", "Product or service name", "Detailed description of issue", "Priority level", "Screenshots (if applicable)"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/60">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-black text-foreground mb-4">Helpful Information</h3>
                <ul className="space-y-3">
                  {["When did the issue start?", "Steps to reproduce the problem", "Error messages received", "Recent changes or updates", "Impact on business operations"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/60">
                      <Zap className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function ServiceRequestPage() {
  return (
    <>
      <Navigation />
      <ServiceRequestContent />
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}