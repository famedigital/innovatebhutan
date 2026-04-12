"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string || '',
        service: formData.get('service') as string,
        message: formData.get('message') as string,
        formType: 'contact-inquiry'
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Inquiry Sent!', {
          description: 'Thank you! We\'ll contact you soon.'
        });
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        toast.error('Submission Failed', {
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
    <section id="contact" className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Info */}
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-[#16A34A] mb-2 block"
            >
              GET IN TOUCH
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-semibold text-[#030712] mb-4"
            >
              Let&apos;s discuss your project
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#6B7280] mb-8"
            >
              Whether you need a quote, technical consultation, or after-sales support, 
              our team is ready to assist you. Reach out via WhatsApp for the fastest response.
            </motion.p>

            {/* Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-5 bg-white rounded-xl border border-[#E5E7EB]"
              >
                <Phone className="w-5 h-5 text-[#16A34A] mb-3" />
                <div className="text-sm text-[#6B7280] mb-1">Phone</div>
                <a href="tel:+97517268753" className="font-medium text-[#030712] hover:text-[#16A34A] transition-colors">
                  +975 17268753
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="p-5 bg-white rounded-xl border border-[#E5E7EB]"
              >
                <Mail className="w-5 h-5 text-[#16A34A] mb-3" />
                <div className="text-sm text-[#6B7280] mb-1">Email</div>
                <a href="mailto:info@innovatebhutan.com" className="font-medium text-[#030712] hover:text-[#16A34A] transition-colors">
                  info@innovatebhutan.com
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-5 bg-white rounded-xl border border-[#E5E7EB]"
              >
                <MapPin className="w-5 h-5 text-[#16A34A] mb-3" />
                <div className="text-sm text-[#6B7280] mb-1">Address</div>
                <div className="font-medium text-[#030712]">
                  Norzin Lam, Thimphu<br />Bhutan
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="p-5 bg-white rounded-xl border border-[#E5E7EB]"
              >
                <Clock className="w-5 h-5 text-[#16A34A] mb-3" />
                <div className="text-sm text-[#6B7280] mb-1">Working Hours</div>
                <div className="font-medium text-[#030712]">
                  Mon - Sat: 9AM - 6PM<br />Sun: Closed
                </div>
              </motion.div>
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              href="https://wa.me/97517268753?text=Hi, I'd like to inquire about your services"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 bg-[#14532D] text-white font-medium rounded-xl hover:bg-[#166534] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
              <span className="text-sm text-[#86EFAC]">Fastest Response</span>
            </motion.a>
          </div>

          {/* Right - Quick Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-lg shadow-black/5"
          >
            <h3 className="text-xl font-semibold text-[#030712] mb-6">Quick Inquiry</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+975 17 XXX XXX"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Service Interested In</label>
                <select name="service" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent">
                  <option value="">Select a service</option>
                  <option value="pos">POS Systems</option>
                  <option value="cctv">CCTV & Surveillance</option>
                  <option value="biometric">Biometric Access</option>
                  <option value="hospitality">Hospitality Software</option>
                  <option value="software">Custom Software</option>
                  <option value="power">Power Solutions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your requirements..."
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#14532D] text-white font-medium rounded-xl hover:bg-[#166534] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>

              <p className="text-xs text-center text-[#9CA3AF]">
                Or message us directly on{" "}
                <a href="https://wa.me/97517268753" className="text-[#16A34A] hover:underline">
                  WhatsApp
                </a>{" "}
                for instant response
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
