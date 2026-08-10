"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HeadphonesIcon,
  MapPin,
  MonitorSmartphone,
  Send,
  Shield,
  Wrench,
  Zap,
} from "lucide-react";

const faqs = [
  {
    question: "What support options are available?",
    answer:
      "Choose Information Support for product guidance with visuals, or Technical Support when software/hardware is not working. Submit the form and our team reaches you within 2 hours during support hours.",
  },
  {
    question: "Where is your support center located?",
    answer:
      "Our support center is located at Express Highway, next to Green Kitchen in Thimphu. We're easily accessible and provide both on-site and remote support.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Support hours are 9:00 AM to 7:00 PM. One of our support executives will reach you within 2 hours. Requests after 7:00 PM are handled the next working day.",
  },
  {
    question: "Do you offer support outside Thimphu?",
    answer:
      "Yes — remote troubleshooting nationwide. On-site support prioritizes Thimphu, Paro, and Punakha with quick response times.",
  },
];

const informationTopics = [
  {
    id: "products",
    title: "Products & Solutions",
    description: "See what we install for hotels, shops, and offices",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "pricing",
    title: "Pricing & Packages",
    description: "Ask about quotes, AMC, and implementation costs",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "how-to",
    title: "How-to Guides",
    description: "Training, setup walkthroughs, and best practices",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "demo",
    title: "Demo / Walkthrough",
    description: "Request a live demo of POS, ERP, or CCTV systems",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
];

const technicalTopics = [
  {
    id: "software-down",
    title: "Software not working",
    description: "App crashes, blank screens, or features failing",
    icon: MonitorSmartphone,
  },
  {
    id: "login",
    title: "Login / Access issue",
    description: "Cannot sign in, password reset, or user permissions",
    icon: Shield,
  },
  {
    id: "pos",
    title: "POS / Billing issue",
    description: "Receipts, inventory sync, or payment problems",
    icon: Wrench,
  },
  {
    id: "hardware",
    title: "CCTV / Hardware",
    description: "Cameras offline, DVR, printers, or networking",
    icon: HeadphonesIcon,
  },
];

type Step = "identity" | "category" | "details" | "done";

function ProgressiveSupportForm() {
  const [step, setStep] = useState<Step>("identity");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<"information" | "technical" | "">(
    ""
  );
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canContinueIdentity =
    businessName.trim().length >= 2 && phone.trim().length >= 8;

  const submit = async () => {
    if (!category || !topic) {
      toast.error("Please select a support topic");
      return;
    }

    setIsSubmitting(true);
    try {
      const topicLabel =
        category === "information"
          ? informationTopics.find((t) => t.id === topic)?.title
          : technicalTopics.find((t) => t.id === topic)?.title;

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName.trim(),
          businessName: businessName.trim(),
          phone: phone.trim(),
          formType: "support-request",
          supportCategory: category,
          supportTopic: topicLabel || topic,
          service: topicLabel || topic,
          message:
            message.trim() ||
            `${category === "technical" ? "Technical" : "Information"} support request: ${topicLabel || topic}`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStep("done");
        toast.success("Support request submitted", {
          description: "Our team will reach you within 2 hours during support hours.",
        });
      } else {
        toast.error("Request failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep("identity");
    setBusinessName("");
    setPhone("");
    setCategory("");
    setTopic("");
    setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
        {[
          { id: "identity", label: "Business" },
          { id: "category", label: "Type" },
          { id: "details", label: "Details" },
        ].map((item, index) => {
          const order = ["identity", "category", "details", "done"];
          const current = order.indexOf(step);
          const active = order.indexOf(item.id) <= current;
          return (
            <div key={item.id} className="flex items-center gap-2">
              {index > 0 && <div className="h-px w-4 bg-border" />}
              <span className={active ? "text-primary" : ""}>{item.label}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === "identity" && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-5"
          >
            <div>
              <h3 className="text-lg font-black tracking-tight mb-1">
                Start your support request
              </h3>
              <p className="text-sm text-foreground/50">
                Enter your business name and mobile number first.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">
                Business Name
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="e.g. Silverpine Boutique"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                placeholder="+975 XXX XXXXX"
              />
            </div>

            <button
              type="button"
              disabled={!canContinueIdentity}
              onClick={() => setStep("category")}
              className="w-full py-4 bg-primary text-[#020617] font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {step === "category" && (
          <motion.div
            key="category"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight mb-1">
                  How can we help?
                </h3>
                <p className="text-sm text-foreground/50">
                  {businessName} · {phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("identity")}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => {
                  setCategory("information");
                  setTopic("");
                  setStep("details");
                }}
                className="text-left rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80"
                    alt="Information support"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">
                      <BookOpen className="w-3.5 h-3.5" /> Information Support
                    </div>
                    <p className="text-sm font-semibold">
                      Product info, pricing, demos — with clear visuals
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory("technical");
                  setTopic("");
                  setStep("details");
                }}
                className="text-left rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all group"
              >
                <div className="relative h-32 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
                    alt="Technical support"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
                      <Wrench className="w-3.5 h-3.5" /> Technical Support
                    </div>
                    <p className="text-sm font-semibold">
                      Software not working, login issues, POS, CCTV & more
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black tracking-tight mb-1">
                  {category === "information"
                    ? "Information Support"
                    : "Technical Support"}
                </h3>
                <p className="text-sm text-foreground/50">
                  Pick a topic, then add any details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("category")}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </div>

            {category === "information" ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {informationTopics.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTopic(item.id)}
                    className={`text-left rounded-xl border overflow-hidden transition-all ${
                      topic === item.id
                        ? "border-primary ring-1 ring-primary/30"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-full object-cover"
                    />
                    <div className="p-3">
                      <div className="text-sm font-semibold">{item.title}</div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-3">
                {technicalTopics.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTopic(item.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        topic === item.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.title}</div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-2">
                Extra details (optional)
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-5 py-4 bg-background border border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
                placeholder={
                  category === "technical"
                    ? "What stopped working? Any error message?"
                    : "What would you like to know?"
                }
              />
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/70 leading-relaxed">
              We respond within <strong className="text-foreground">2 hours</strong>{" "}
              during <strong className="text-primary">9:00 AM – 7:00 PM</strong>.
              After 7:00 PM we follow up the next working day.
            </div>

            <button
              type="button"
              disabled={!topic || isSubmitting}
              onClick={submit}
              className="w-full py-4 bg-primary text-[#020617] font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Sending..." : "Submit Support Request"}
            </button>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Request received</h3>
            <p className="text-sm text-foreground/60 max-w-sm mx-auto">
              Thanks, {businessName}. Our support team will contact {phone} soon.
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Submit another request
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-16 bg-background text-foreground transition-colors duration-500">
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
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                Support Hub
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter leading-none dark:neon-text">
              Premium <span className="text-primary">Support</span> Center
            </h1>

            <p className="text-base text-foreground/60 mb-6 leading-relaxed max-w-xl mx-auto">
              Start with your business name and mobile. Then choose Information
              Support (guided with images) or Technical Support (software not
              working and related issues).
            </p>

            <div className="flex flex-wrap justify-center gap-8 border-t border-border pt-8">
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Hours: <span className="text-foreground">9:00 AM – 7:00 PM</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Response: <span className="text-foreground">Within 2 Hours</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground/50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Coverage: <span className="text-foreground">All Bhutan</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl overflow-hidden border border-border relative min-h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80"
              alt="Information support"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative p-8 text-white h-full flex flex-col justify-end">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-2">
                <BookOpen className="w-4 h-4" /> Information Support
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                Clear answers with visuals
              </h2>
              <p className="text-sm text-white/75 max-w-md">
                Products, pricing, demos, and how-to guidance — shown with images
                so you know exactly what you&apos;re getting.
              </p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-border relative min-h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
              alt="Technical support"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative p-8 text-white h-full flex flex-col justify-end">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">
                <Wrench className="w-4 h-4" /> Technical Support
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">
                When systems stop working
              </h2>
              <p className="text-sm text-white/75 max-w-md">
                Software not working, login problems, POS billing issues, CCTV /
                hardware faults — we troubleshoot fast.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-[1fr_460px] gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-8 tracking-tighter uppercase leading-none">
                Dedicated <span className="text-primary">Support</span> Teams
              </h2>
              <p className="text-lg text-foreground/40 mb-10 leading-relaxed font-medium max-w-xl">
                Progressive intake keeps requests clear: business + mobile first,
                then Information or Technical support with the right details for
                fast follow-up.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Support Hours", d: "9:00 AM to 7:00 PM" },
                  { t: "WhatsApp Alerts", d: "CallMeBot to ops team" },
                  { t: "Quick Response", d: "Within 2 hours (during hours)" },
                  { t: "After Hours", d: "Next working day follow-up" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl"
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-[10px] font-black text-foreground uppercase tracking-widest">
                        {item.t}
                      </div>
                      <div className="text-[9px] text-primary/50 uppercase tracking-widest font-bold">
                        {item.d}
                      </div>
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
                    <h3 className="text-lg font-black text-foreground mb-1">
                      Visit Our Support Center
                    </h3>
                    <p className="text-foreground/50 text-sm">
                      Located at{" "}
                      <strong className="text-primary">
                        Express Highway, next to Green Kitchen
                      </strong>
                      , Thimphu
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-[32px] p-8 border border-border relative overflow-hidden shadow-2xl lg:sticky lg:top-20"
            >
              <ProgressiveSupportForm />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-muted/20">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">
              Frequently Asked Questions
            </h2>
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
                  <span className="text-[13px] font-black text-foreground uppercase tracking-tight pr-6">
                    {faq.question}
                  </span>
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
