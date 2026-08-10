"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ContactInfo {
  id: number;
  info_type: string;
  label: string;
  value: string;
  display_order: number;
}

interface GroupedContacts {
  phone?: ContactInfo[];
  email?: ContactInfo[];
  address?: ContactInfo[];
  working_hours?: ContactInfo[];
}

export function ContactSectionDynamic() {
  const [contactInfo, setContactInfo] = useState<GroupedContacts>({
    phone: [
      { id: 1, info_type: "phone", label: "Thimphu Office", value: "+975 17268753", display_order: 1 }
    ],
    email: [
      { id: 2, info_type: "email", label: "General Inquiries", value: "info@innovatebhutan.com", display_order: 1 }
    ],
    address: [
      { id: 3, info_type: "address", label: "Main Office", value: "Norzin Lam, Thimphu, Bhutan", display_order: 1 }
    ],
    working_hours: [
      { id: 4, info_type: "working_hours", label: "Weekdays", value: "Mon - Sat: 9AM - 6PM", display_order: 1 }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const response = await fetch("/api/website/contact");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setContactInfo(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContactInfo();
  }, []);

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

  if (loading) {
    return (
      <section id="contact" className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-12 bg-slate-200 rounded w-2/3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const phones = contactInfo.phone || [];
  const emails = contactInfo.email || [];
  const addresses = contactInfo.address || [];
  const workingHours = contactInfo.working_hours || [];

  // Get primary contact info for display
  const primaryPhone = phones[0]?.value || "+975 17268753";
  const primaryEmail = emails[0]?.value || "info@innovatebhutan.com";
  const primaryAddress = addresses[0]?.value || "Norzin Lam, Thimphu, Bhutan";
  const primaryHours = workingHours[0]?.value || "Mon - Sat: 9AM - 6PM";

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
              CONTACT US
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-semibold text-[#030712] mb-4"
            >
              Let's Transform Your Business
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[#6B7280] mb-8"
            >
              Request a consultation, technical assessment, or proposal. Our enterprise solutions team
              delivers comprehensive technology strategies tailored to your operational requirements.
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
                <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="font-medium text-[#030712] hover:text-[#16A34A] transition-colors">
                  {primaryPhone}
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
                <a href={`mailto:${primaryEmail}`} className="font-medium text-[#030712] hover:text-[#16A34A] transition-colors">
                  {primaryEmail}
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
                  {primaryAddress}
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
                  {primaryHours}
                </div>
              </motion.div>
            </div>

            {/* Email + WhatsApp CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                href={`mailto:${primaryEmail}?subject=Inquiry%20from%20innovates.bt`}
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white text-[#030712] font-medium rounded-xl border border-[#E5E7EB] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email us
              </motion.a>
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
                href={`https://wa.me/${primaryPhone.replace(/\D/g, '')}?text=Hi, I'd like to inquire about your services`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-[#14532D] text-white font-medium rounded-xl hover:bg-[#166534] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Chat on WhatsApp
                <span className="text-sm text-[#86EFAC]">Fastest Response</span>
              </motion.a>
            </div>
          </div>

          {/* Right - Quick Inquiry Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-lg shadow-black/5"
          >
            <h3 className="text-xl font-semibold text-[#030712] mb-6">Request Consultation</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Contact Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+975 17 XX XX XX"
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Solution Required</label>
                <select name="service" className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent">
                  <option value="">Select a solution</option>
                  <option value="pos">POS Systems</option>
                  <option value="cctv">CCTV & Surveillance</option>
                  <option value="biometric">Biometric Access Control</option>
                  <option value="hospitality">Hospitality Management</option>
                  <option value="software">Custom Development</option>
                  <option value="network">Network Infrastructure</option>
                  <option value="other">Other Solutions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Project Details</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Describe your requirements..."
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#030712] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#14532D] text-white font-medium rounded-xl hover:bg-[#166534] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Submit Request'}
              </button>

              <p className="text-xs text-center text-[#9CA3AF]">
                For immediate assistance, contact us via{" "}
                <a href={`https://wa.me/${primaryPhone.replace(/\D/g, '')}`} className="text-[#16A34A] hover:underline">
                  WhatsApp
                </a>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
