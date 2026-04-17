"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Filter, Star, Award, Building2, Clock,
  CheckCircle, ChevronRight, Phone, MessageSquare, Globe, ArrowLeft
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import Link from "next/link";

// 📍 Location-specific data (will be replaced with API data)
const locationData: Record<string, {
  name: string;
  district: string;
  description: string;
  stats: { businesses: number; categories: number; reviews: number };
}> = {
  thimphu: {
    name: "Thimphu",
    district: "Thimphu District",
    description: "Bhutan's capital city and largest business hub, home to numerous tech companies, government offices, and commercial enterprises.",
    stats: { businesses: 85, categories: 12, reviews: 1240 }
  },
  paro: {
    name: "Paro",
    district: "Paro District",
    description: "Historic town known for tourism and traditional crafts, with growing modern business sector.",
    stats: { businesses: 23, categories: 8, reviews: 340 }
  },
  punakha: {
    name: "Punakha",
    district: "Punakha District",
    description: "Ancient capital with thriving agriculture and eco-tourism businesses.",
    stats: { businesses: 18, categories: 7, reviews: 210 }
  },
  wangdue: {
    name: "Wangdue",
    district: "Wangdue Phodrang",
    description: "Gateway town connecting western and central Bhutan with diverse business services.",
    stats: { businesses: 12, categories: 6, reviews: 180 }
  }
};

// 🏪 Sample businesses (will be replaced with API data)
const getBusinessesForLocation = (location: string) => [
  {
    id: 1,
    name: "Tech Solutions Bhutan",
    tagline: "Premier IT Services Provider",
    description: "Complete enterprise IT solutions including networking, security, and software development.",
    logoUrl: "https://ui-avatars.com/api/?name=Tech+Solutions&background=10B981&color=fff",
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    isFeatured: true,
    categoryName: "IT Services",
    locationName: locationData[location]?.name || "Thimphu",
    phone: "+975 17268753",
    whatsapp: "+975 17268753",
  },
  {
    id: 2,
    name: "Digital Transformations",
    tagline: "Custom Software Development",
    description: "Bespoke software solutions for Bhutanese businesses, from ERP to mobile apps.",
    logoUrl: "https://ui-avatars.com/api/?name=Digital+Transformations&background=8B5CF6&color=fff",
    rating: 4.9,
    reviewCount: 89,
    isVerified: true,
    isFeatured: true,
    categoryName: "Software",
    locationName: locationData[location]?.name || "Thimphu",
    phone: "+975 17268753",
    whatsapp: "+975 17268753",
  }
];

export default function LocationPage({ params }: { params: { location: string } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const location = locationData[params.location] || locationData.thimphu;
  const businesses = getBusinessesForLocation(params.location);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery, "in", location.name);
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
        {/* Location Hero */}
        <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-br from-background to-card">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-5">
            {/* Back Button */}
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Directory</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-primary" />
                <h1 className="text-5xl lg:text-6xl font-black text-foreground dark:neon-text tracking-tight">
                  {location.name}
                </h1>
              </div>

              <p className="text-xl text-foreground/60 max-w-3xl mb-8">
                {location.description}
              </p>

              {/* Location Stats */}
              <div className="flex flex-wrap gap-8 mb-8">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-foreground/80 font-medium">
                    <span className="text-primary font-bold">{location.stats.businesses}</span> Businesses
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-foreground/80 font-medium">
                    <span className="text-primary font-bold">{location.stats.categories}</span> Categories
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-foreground/80 font-medium">
                    <span className="text-primary font-bold">{location.stats.reviews}</span> Reviews
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search businesses in ${location.name}...`}
                    className="w-full pl-16 pr-6 py-5 bg-card border-2 border-border rounded-2xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/30 text-lg shadow-2xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Businesses Grid */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-black text-foreground mb-2 dark:neon-text">
                Featured Businesses in{" "}
                <span className="text-primary">{location.name}</span>
              </h2>
              <p className="text-lg text-foreground/60">
                Top-rated service providers in {location.district}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <div className="profile-card bg-background/80 backdrop-blur-xl border border-border hover:border-primary/30 rounded-3xl overflow-hidden transition-all duration-500 h-full">
                    {/* Card Header */}
                    <div className="relative p-6 pb-4">
                      {business.isVerified && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          <span className="text-[8px] font-black uppercase tracking-wider text-primary">Verified</span>
                        </div>
                      )}

                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-1 mb-4">
                        <img
                          src={business.logoUrl}
                          alt={business.name}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      </div>

                      <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-foreground/50 mb-3">{business.tagline}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(business.rating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-foreground">{business.rating}</span>
                        <span className="text-xs text-foreground/40">({business.reviewCount} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider text-primary">
                          {business.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="px-6 pb-6 pt-4 border-t border-border">
                      <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                          className="order-node flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </a>
                        <a
                          href={`tel:${business.phone.replace(/\D/g, '')}`}
                          className="order-node flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                      </div>
                    </div>
                  </div>
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
              className="bg-card rounded-3xl p-12 border border-border shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="relative">
                <Building2 className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl lg:text-4xl font-black text-foreground mb-4 dark:neon-text">
                  List Your Business in {location.name}
                </h2>
                <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                  Join the premium business directory and connect with customers in {location.district}.
                  Showcase your products and services to a targeted local audience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/97517268753?text=Hi, I'm interested in listing my business"
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Get Started
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}