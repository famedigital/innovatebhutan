"use client";

import { motion } from "framer-motion";
import { Shield, Award, Clock, CheckCircle, FileText, Users, HeadphonesIcon, Zap, Database, Camera, Network, Code2 } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

const warrantyPolicies = [
  {
    icon: Database,
    title: "Rancelab ERP Software",
    warranty: "12 Months Comprehensive Support",
    description: "Complete technical support for Rancelab ERP including bug fixes, updates, user training, and consultation. Coverage includes remote troubleshooting via WhatsApp and on-site support when necessary.",
    features: ["Free software updates", "User training sessions", "Data backup assistance", "Configuration optimization"],
    exclusions: ["Data migration from third-party systems", "Custom module development", "Hardware-related issues"]
  },
  {
    icon: Camera,
    title: "CCTV & Security Systems",
    warranty: "24 Months Hardware Warranty",
    description: "Manufacturer warranty for all CCTV cameras, DVRs, and security equipment. Includes free replacement for defective units and installation support. Extended warranty options available.",
    features: ["Hardware replacement", "Installation support", "Technical consultation", "Remote configuration"],
    exclusions: ["Physical damage", "Unauthorized modifications", "Natural disasters", "Power surge damage"]
  },
  {
    icon: Network,
    title: "Networking Infrastructure",
    warranty: "12 Months Installation Warranty",
    description: "Guaranteed performance for all network installations. Includes free troubleshooting and repair of installation-related issues. Coverage extends to cables, connectors, and configuration.",
    features: ["Free troubleshooting", "Cable replacement", "Configuration support", "Performance optimization"],
    exclusions: ["Physical damage to cables", "Equipment failure", "Third-party device issues", "Act of nature damage"]
  },
  {
    icon: Code2,
    title: "Custom Software Development",
    warranty: "6 Months Bug Fix Guarantee",
    description: "Comprehensive bug fixing and technical support for all custom-developed software. Includes free updates and patches for identified issues during the warranty period.",
    features: ["Free bug fixes", "Performance updates", "Security patches", "Minor feature adjustments"],
    exclusions: ["New feature development", "Third-party integration changes", "Server hosting costs", "Database modifications"]
  }
];

const warrantyProcess = [
  {
    step: "01",
    title: "Issue Identification",
    description: "Contact our support team via WhatsApp or phone to report warranty-related issues."
  },
  {
    step: "02",
    title: "Verification",
    description: "Our team verifies warranty coverage and assesses the issue nature."
  },
  {
    step: "03",
    title: "Resolution",
    description: "Free repair, replacement, or support provided according to warranty terms."
  },
  {
    step: "04",
    title: "Documentation",
    description: "Issue resolution documented for future reference and warranty tracking."
  }
];

const extendedWarranty = [
  {
    title: "Extended Hardware Warranty",
    description: "Additional 12 months of coverage for security systems and networking equipment",
    price: "15% of product value",
    benefits: ["Extended protection", "Priority support", "Free replacement parts", "Annual maintenance"]
  },
  {
    title: "Premium Software Support",
    description: "Enhanced support package for Rancelab ERP and custom software solutions",
    price: "Nu. 25,000/year",
    benefits: ["24/7 priority support", "Free version upgrades", "Dedicated account manager", "On-site training"]
  },
  {
    title: "Comprehensive Annual Maintenance",
    description: "Complete coverage for all systems including preventive maintenance",
    price: "Custom quote",
    benefits: ["Preventive maintenance visits", "Emergency support", "System health monitoring", "Discounted upgrades"]
  }
];

function WarrantyContent() {
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Peace of Mind</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-6 dark:neon-text tracking-tight">
              Comprehensive{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Warranty Coverage
              </span>
            </h1>

            <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed">
              At <strong className="text-primary">innovates.bt</strong>, we stand behind every product and service we deliver.
              Our warranty policies ensure your investment is protected and your operations run smoothly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Warranty Policies */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Product Warranty Coverage</h2>
            <p className="text-lg text-foreground/60">Comprehensive protection for every solution</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {warrantyPolicies.map((policy, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all"
              >
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                      <policy.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-foreground mb-2">{policy.title}</h3>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full mb-4">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider text-primary">{policy.warranty}</span>
                      </div>
                      <p className="text-sm text-foreground/50 leading-relaxed">{policy.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-primary mb-3">What's Covered</h4>
                      <ul className="space-y-2">
                        {policy.features.map((feature, fi) => (
                          <li key={fi} className="flex items-center gap-2 text-xs text-foreground/60">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground/30 mb-3">Exclusions</h4>
                      <ul className="space-y-2">
                        {policy.exclusions.map((exclusion, ei) => (
                          <li key={ei} className="flex items-center gap-2 text-xs text-foreground/40">
                            <span className="w-1.5 h-1.5 bg-foreground/20 rounded-full shrink-0" />
                            {exclusion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Process */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Claim Process</h2>
            <p className="text-lg text-foreground/60">Simple, straightforward warranty claims</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {warrantyProcess.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all h-full">
                  <div className="text-4xl font-black text-primary/20 mb-3">{step.step}</div>
                  <h3 className="text-lg font-black text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-foreground/50 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extended Warranty */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Award className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">Extended Warranty Options</h2>
            <p className="text-lg text-foreground/60">Enhanced protection for complete peace of mind</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {extendedWarranty.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border border-border hover:border-primary/30 transition-all"
              >
                <h3 className="text-xl font-black text-foreground mb-3">{plan.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed mb-6">{plan.description}</p>
                <div className="text-2xl font-black text-primary mb-6">{plan.price}</div>
                <ul className="space-y-2 mb-6">
                  {plan.benefits.map((benefit, bi) => (
                    <li key={bi} className="flex items-center gap-2 text-xs text-foreground/60">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://wa.me/97517268753?text=Hi, I'm interested in extended warranty"
                  className="block w-full text-center px-6 py-3 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white hover:scale-105 transition-all"
                >
                  Get Quote
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-12 border border-border"
          >
            <HeadphonesIcon className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4 dark:neon-text">
              Warranty Questions?
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              Our support team is ready to help you understand your warranty coverage and assist with any claims.
            </p>
            <a
              href="https://wa.me/97517268753"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
            >
              Contact Support Team
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function WarrantyPage() {
  return (
    <>
      <Navigation />
      <WarrantyContent />
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}