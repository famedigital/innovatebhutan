"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, Calendar, Award, Users, Zap, Heart, ArrowRight, Building2, Sparkles, Target, Shield, X, CheckCircle } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useState } from "react";

const departments = [
  { id: "all", name: "All Departments", icon: Briefcase },
  { id: "technical", name: "Technical", icon: Target },
  { id: "development", name: "Development", icon: Zap },
  { id: "infrastructure", name: "Infrastructure", icon: Shield },
  { id: "support", name: "Support", icon: Users },
];

const openings = [
  {
    id: 1,
    title: "Senior ERP Consultant",
    department: "technical",
    location: "Thimphu",
    type: "Full-time",
    experience: "3+ years",
    salary: "Competitive",
    posted: "2 days ago",
    featured: true,
    description: "Lead Rancelab ERP implementations for enterprise clients across Bhutan. Provide expert guidance on system architecture, data migration, and user training.",
    responsibilities: [
      "Lead ERP implementation projects from scoping to deployment",
      "Provide technical consulting and system architecture guidance",
      "Conduct user training and change management sessions",
      "Collaborate with development team on customizations"
    ],
    requirements: [
      "Rancelab ERP Certification or equivalent experience",
      "3+ years of ERP implementation experience",
      "Strong presentation and communication skills",
      "Willingness to travel within Bhutan"
    ],
    benefits: ["Health Insurance", "Professional Development", "Performance Bonus", "Career Growth Opportunities"]
  },
  {
    id: 2,
    title: "Full-Stack Developer",
    department: "development",
    location: "Thimphu",
    type: "Full-time",
    experience: "2+ years",
    salary: "Nu. 30,000 - 80,000",
    posted: "1 week ago",
    featured: true,
    description: "Develop custom ERP solutions and modern web applications using cutting-edge technologies. Work on impactful projects for enterprise clients.",
    responsibilities: [
      "Design and develop scalable web applications",
      "Build RESTful APIs and database integrations",
      "Collaborate with UI/UX designers on implementation",
      "Write clean, maintainable code with proper documentation"
    ],
    requirements: [
      "Strong expertise in React/Next.js and TypeScript",
      "Experience with Node.js and PostgreSQL",
      "Knowledge of modern CSS and responsive design",
      "Understanding of cloud deployment (Vercel/AWS)"
    ],
    benefits: ["Remote Work Options", "Tech Stack Training", "Project Bonuses", "Health Coverage"]
  },
  {
    id: 3,
    title: "Network Engineer",
    department: "infrastructure",
    location: "Paro/Punakha",
    type: "Full-time",
    experience: "2+ years",
    salary: "Competitive",
    posted: "3 days ago",
    featured: false,
    description: "Design and deploy enterprise networking solutions. Handle structured cabling, WiFi implementation, and network security for clients across Bhutan.",
    responsibilities: [
      "Design network architecture for enterprise clients",
      "Install and configure network equipment and cabling",
      "Implement security protocols and firewalls",
      "Provide network troubleshooting and maintenance"
    ],
    requirements: [
      "CCNA/CCNP certification preferred",
      "Experience with enterprise network design",
      "Knowledge of security systems and protocols",
      "Physical capability for installation work"
    ],
    benefits: ["Transport Allowance", "Field Allowances", "Certification Support", "Equipment Provided"]
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "support",
    location: "Thimphu",
    type: "Full-time",
    experience: "2+ years",
    salary: "Competitive",
    posted: "5 days ago",
    featured: false,
    description: "Manage client relationships and ensure successful implementation of solutions. Provide ongoing support and identify opportunities for account growth.",
    responsibilities: [
      "Onboard new clients and ensure successful implementation",
      "Provide ongoing support and guidance to clients",
      "Identify opportunities for account expansion",
      "Act as primary point of contact for client concerns"
    ],
    requirements: [
      "2+ years of customer success or account management experience",
      "Strong technical aptitude and learning ability",
      "Fluency in Bhutanese languages and English",
      "Excellent problem-solving and communication skills"
    ],
    benefits: ["Performance Bonuses", "Career Advancement", "Training Programs", "Health Insurance"]
  },
  {
    id: 5,
    title: "Biometric Security Specialist",
    department: "technical",
    location: "Thimphu",
    type: "Full-time",
    experience: "1+ years",
    salary: "Competitive",
    posted: "1 day ago",
    featured: false,
    description: "Specialize in biometric system installation and maintenance. Work with cutting-edge security technology including facial recognition and fingerprint systems.",
    responsibilities: [
      "Install and configure biometric security systems",
      "Provide technical support for biometric implementations",
      "Train clients on system usage and maintenance",
      "Stay updated on latest security technologies"
    ],
    requirements: [
      "1+ years of security system experience",
      "Knowledge of biometric technology principles",
      "Strong technical troubleshooting skills",
      "Ability to explain technical concepts to non-technical users"
    ],
    benefits: ["Specialized Training", "Certification Support", "Equipment Allowance", "Performance Bonuses"]
  },
  {
    id: 6,
    title: "Junior Software Developer",
    department: "development",
    location: "Thimphu",
    type: "Full-time",
    experience: "Entry Level",
    salary: "Nu. 25,000 - 40,000",
    posted: "Just now",
    featured: false,
    description: "Start your career in software development with our team. Work on real projects and learn from experienced developers while building modern applications.",
    responsibilities: [
      "Assist in developing and maintaining web applications",
      "Learn and work with modern development tools",
      "Participate in code reviews and team discussions",
      "Contribute to documentation and testing"
    ],
    requirements: [
      "Bachelor's degree in Computer Science or related field",
      "Basic understanding of web development concepts",
      "Strong desire to learn and grow",
      "Good problem-solving skills"
    ],
    benefits: ["Mentorship Program", "Learning Opportunities", "Growth Path", "Friendly Team Environment"]
  }
];

const culture = [
  { icon: Award, title: "Growth & Development", description: "Continuous learning opportunities, mentorship programs, and career advancement paths" },
  { icon: Users, title: "Collaborative Culture", description: "Work with industry experts in a supportive, team-oriented environment" },
  { icon: Zap, title: "Innovation Focus", description: "Cutting-edge projects with leading technologies and creative problem-solving" },
  { icon: Heart, title: "Work-Life Balance", description: "Flexible scheduling, remote options, and respect for personal time" },
  { icon: Building2, title: "Modern Workplace", description: "Professional office environment with the latest tools and equipment" },
  { icon: Sparkles, title: "Impactful Work", description: "Build solutions that make a real difference for businesses across Bhutan" }
];

function CareersContent() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedJob, setSelectedJob] = useState<typeof openings[0] | null>(null);

  const filteredOpenings = selectedDepartment === "all"
    ? openings
    : openings.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Header Section */}
      <section className="pt-20 pb-8 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight dark:neon-text">
              Careers at{" "}
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Innovate.bt
              </span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Build your career with a team that's transforming technology across Bhutan
            </p>
          </motion.div>
        </div>
      </section>

      {/* Department Filter */}
      <section className="py-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap gap-3 justify-center">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider transition-all ${
                  selectedDepartment === dept.id
                    ? "bg-primary text-black"
                    : "bg-card text-foreground/60 hover:text-primary border border-border hover:border-primary/30"
                }`}
              >
                <dept.icon className="w-4 h-4 inline mr-2" />
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Positions */}
      {selectedDepartment === "all" && (
        <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-primary">Featured Opportunities</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {openings.filter(job => job.featured).map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-6 border-2 border-primary/30 hover:border-primary transition-all relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-wider rounded-full">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2">{job.title}</h3>
                  <p className="text-foreground/60 text-sm mb-4 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-xs font-medium text-primary">
                      {job.location}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-xs font-medium text-blue-500">
                      {job.type}
                    </span>
                    <span className="px-3 py-1 bg-green-500/5 border border-green-500/20 rounded-full text-xs font-medium text-green-500">
                      {job.salary}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-primary text-sm font-black uppercase tracking-wider hover:underline"
                  >
                    View Details →
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Positions */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-foreground mb-2">
              {selectedDepartment === "all" ? "All Open Positions" : departments.find(d => d.id === selectedDepartment)?.name + " Positions"}
            </h2>
            <p className="text-foreground/60 text-sm">{filteredOpenings.length} positions available</p>
          </div>

          <div className="space-y-4">
            {filteredOpenings.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      {job.featured && (
                        <span className="px-2 py-1 bg-primary/10 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-wider text-primary shrink-0 ml-2">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/50 text-sm mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground/40">
                        <Calendar className="w-3 h-3" />
                        {job.experience}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredOpenings.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <p className="text-foreground/40">No positions available in this department</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-foreground mb-3 dark:neon-text">Why Work With Us</h2>
            <p className="text-foreground/60">Join a team that values innovation and growth</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culture.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 transition-all"
              >
                <item.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-black text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-12 border border-border"
          >
            <Briefcase className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-black text-foreground mb-4 dark:neon-text">
              Don't See the Right Fit?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <a
              href="https://wa.me/97517268753?text=Hi, I'd like to submit my resume for future job opportunities"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
            >
              Submit Resume
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white dark:bg-card rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="shrink-0 bg-white dark:bg-card border-b border-border p-6 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-black text-foreground mb-2">{selectedJob.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-xs font-medium text-primary">
                    {selectedJob.location}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-xs font-medium text-blue-500">
                    {selectedJob.type}
                  </span>
                  <span className="px-3 py-1 bg-green-500/5 border border-green-500/20 rounded-full text-xs font-medium text-green-500">
                    {selectedJob.salary}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="shrink-0 p-2 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-foreground/40" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-card">
              <div>
                <h3 className="text-lg font-black text-foreground mb-3">About the Role</h3>
                <p className="text-foreground/60 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground mb-3">Key Responsibilities</h3>
                <ul className="space-y-2">
                  {selectedJob.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/60">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/60">
                      <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground mb-3">Benefits & Perks</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 bg-white dark:bg-card border-t border-border p-6">
              <a
                href={`https://wa.me/97517268753?text=Hi, I'm interested in the ${encodeURIComponent(selectedJob.title)} position`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                Apply via WhatsApp
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function CareersPage() {
  return (
    <>
      <Navigation />
      <CareersContent />
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}