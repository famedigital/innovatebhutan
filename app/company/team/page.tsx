"use client";

import { motion } from "framer-motion";
import { Users, Award, Shield, Zap, Code2, Camera, Network, Database, Mail, Phone, MapPin } from "lucide-react";
import { getMediaUrl } from "@/lib/cloudinary";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

const teamMembers = [
  {
    name: "Manish Sharma",
    role: "Founder & CEO",
    description: "Visionary leader with 12+ years of expertise in enterprise technology solutions. Pioneered Rancelab ERP implementations across Bhutan.",
    achievements: ["300+ ERP Deployments", "Industry Veteran", "Tech Innovator"],
    image: getMediaUrl('innovate_bhutan/services_main_hero', false, true),
    color: "from-primary to-blue-500"
  },
  {
    name: "Technical Team",
    role: "ERP & Software Specialists",
    description: "Certified professionals with deep expertise in Rancelab ERP, custom software development, and enterprise system architecture.",
    achievements: ["Rancelab Certified", "Full-Stack Experts", "Cloud Architects"],
    image: getMediaUrl('innovate_bhutan/software_dev', false, true),
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Infrastructure Team",
    role: "Network & Security Engineers",
    description: "Expert engineers specializing in CCTV installations, networking infrastructure, and enterprise security systems.",
    achievements: ["Security Certified", "Network Experts", "AI Analytics"],
    image: getMediaUrl('innovate_bhutan/security_ai_node', false, true),
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Support Team",
    role: "Customer Success Managers",
    description: "Dedicated support team available 24/7 to ensure seamless operations and client satisfaction across all services.",
    achievements: ["24/7 Available", "99% Satisfaction", "Rapid Response"],
    image: getMediaUrl('innovate_bhutan/network_flow', false, true),
    color: "from-green-500 to-emerald-500"
  }
];

const values = [
  { icon: Shield, title: "Expertise", description: "12+ years of industry experience" },
  { icon: Award, title: "Certified", description: "Rancelab authorized partners" },
  { icon: Zap, title: "Innovation", description: "Cutting-edge technology solutions" },
  { icon: Users, title: "Dedicated", description: "Client-focused approach" }
];

function TeamContent() {
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
              <Users className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Meet Our Team</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-foreground mb-6 dark:neon-text tracking-tight">
              The{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Innovate.bt
              </span>{" "}
              Team
            </h1>

            <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed">
              A passionate team of technology experts dedicated to transforming businesses across Bhutan
              with cutting-edge solutions and unwavering commitment to excellence.
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-all"
              >
                <value.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-2">{value.title}</h3>
                <p className="text-xs text-foreground/50">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-8">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-background rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} p-0.5 shrink-0`}>
                      <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                        <Users className="w-10 h-10 text-foreground" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-foreground mb-2">{member.name}</h3>
                      <div className={`inline-block px-4 py-1 bg-gradient-to-r ${member.color} rounded-full mb-4`}>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{member.role}</span>
                      </div>
                      <p className="text-sm text-foreground/60 leading-relaxed mb-4">{member.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {member.achievements.map((achievement, ai) => (
                      <span key={ai} className="px-3 py-1 bg-muted border border-border rounded-full text-[10px] font-black uppercase tracking-wider text-foreground/60">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-12 border border-border"
          >
            <Users className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4 dark:neon-text">
              Join Our Growing Team
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              We're always looking for talented individuals who share our passion for technology and innovation.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3 justify-center">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">info@innovate.bt</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">+975 17268753</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">Express Highway, Thimphu</span>
              </div>
            </div>

            <a
              href="https://wa.me/97517268753"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
            >
              Contact Us Today
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function TeamPage() {
  return (
    <>
      <Navigation />
      <TeamContent />
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}