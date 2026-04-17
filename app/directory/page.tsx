"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Filter, Star, Award, Building2, Clock,
  CheckCircle, ChevronRight, Phone, MessageSquare, Globe,
  TrendingUp, Users, Zap, Shield, Code, Monitor, Database, Camera
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

// 🎯 Category Data (static for now, will be replaced with API data)
const categories = [
  { id: 1, name: "IT Services", icon: Zap, slug: "it-services", count: 45 },
  { id: 2, name: "Networking", icon: Globe, slug: "networking", count: 32 },
  { id: 3, name: "Security", icon: Shield, slug: "security", count: 28 },
  { id: 4, name: "Software", icon: Code, slug: "software", count: 19 },
  { id: 5, name: "Hardware", icon: Monitor, slug: "hardware", count: 15 },
  { id: 6, name: "Consulting", icon: Users, slug: "consulting", count: 12 },
];

// 📍 Location Data (static for now, will be replaced with API data)
const locations = [
  { id: 1, name: "Thimphu", district: "Thimphu District", count: 85 },
  { id: 2, name: "Paro", district: "Paro District", count: 23 },
  { id: 3, name: "Punakha", district: "Punakha District", count: 18 },
  { id: 4, name: "Wangdue", district: "Wangdue Phodrang", count: 12 },
  { id: 5, name: "Other Locations", district: "Various", count: 8 },
];

// 🏪 Sample Business Data (will be replaced with API data)
const sampleBusinesses = [
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
    type: "client",
    categoryName: "IT Services",
    locationName: "Thimphu",
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
    type: "client",
    categoryName: "Software",
    locationName: "Paro",
    phone: "+975 17268753",
    whatsapp: "+975 17268753",
  },
  {
    id: 3,
    name: "SecureNet Bhutan",
    tagline: "Security & Surveillance Experts",
    description: "CCTV installation, security systems, and surveillance solutions for businesses.",
    logoUrl: "https://ui-avatars.com/api/?name=SecureNet+Bhutan&background=F59E0B&color=fff",
    rating: 4.7,
    reviewCount: 67,
    isVerified: true,
    isFeatured: false,
    type: "external",
    categoryName: "Security",
    locationName: "Punakha",
    phone: "+975 17268753",
    whatsapp: "+975 17268753",
  },
];

// 🎨 Icon Mapping
const iconMap: Record<string, any> = {
  Zap, Shield, Code, Monitor, Users, Globe, Building2, Award, CheckCircle
};

function DirectoryHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-br from-background to-card">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full mb-8">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
              Premium Business Directory
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-6 dark:neon-text tracking-tight">
            Discover{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Exceptional
            </span>{" "}
            Businesses
          </h1>

          <p className="text-xl text-foreground/60 max-w-3xl mx-auto leading-relaxed mb-12">
            Explore Bhutan's finest businesses and service providers. From tech innovators to traditional craftsmen,
            find verified professionals across Thimphu, Paro, Punakha, and beyond.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, services, or categories..."
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

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none px-6 py-3 bg-card border-2 border-border rounded-xl text-foreground text-sm font-black uppercase tracking-wider focus:outline-none focus:border-primary/30 cursor-pointer pr-12"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id.toString()}>
                    {location.name} ({location.count})
                  </option>
                ))}
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none px-6 py-3 bg-card border-2 border-border rounded-xl text-foreground text-sm font-black uppercase tracking-wider focus:outline-none focus:border-primary/30 cursor-pointer pr-12"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">150+</div>
            <div className="text-[10px] uppercase tracking-widest text-foreground/40">Verified Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">5</div>
            <div className="text-[10px] uppercase tracking-widest text-foreground/40">Major Cities</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">12+</div>
            <div className="text-[10px] uppercase tracking-widest text-foreground/40">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-1">4.8★</div>
            <div className="text-[10px] uppercase tracking-widest text-foreground/40">Avg Rating</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CategoryGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black text-foreground mb-4 dark:neon-text">
            Browse by{" "}
            <span className="text-primary">Category</span>
          </h2>
          <p className="text-lg text-foreground/60">
            Find the perfect service provider for your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon] || Building2;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                {/* Category Icon Wrapper with Animation */}
                <div className="category-icon-wrapper relative w-full aspect-square bg-card rounded-2xl border-2 border-border hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center p-4 shadow-lg hover:shadow-2xl">
                  {/* Background Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon */}
                  <div className="relative mb-3">
                    <Icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  {/* Category Name */}
                  <h3 className="text-xs font-black text-foreground text-center uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {/* Count */}
                  <p className="text-[10px] text-foreground/40 text-center">
                    {category.count} listings
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedBusinesses() {
  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-black text-foreground mb-2 dark:neon-text">
              Featured{" "}
              <span className="text-primary">Businesses</span>
            </h2>
            <p className="text-lg text-foreground/60">
              Handpicked premium service providers
            </p>
          </div>
          <a
            href="/directory"
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-background border-2 border-border rounded-xl text-foreground font-black uppercase text-xs tracking-wider hover:border-primary/30 hover:text-primary transition-all"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleBusinesses.map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              {/* Premium Business Card */}
              <div className="profile-card bg-background/80 backdrop-blur-xl border border-border hover:border-primary/30 rounded-3xl overflow-hidden transition-all duration-500 h-full">
                {/* Card Header */}
                <div className="relative p-6 pb-4">
                  {/* Verified Badge */}
                  {business.isVerified && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full">
                      <CheckCircle className="w-3 h-3 text-primary" />
                      <span className="text-[8px] font-black uppercase tracking-wider text-primary">Verified</span>
                    </div>
                  )}

                  {/* Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-1 mb-4">
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>

                  {/* Business Info */}
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-sm text-foreground/50 mb-3">{business.tagline}</p>

                  {/* Rating */}
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

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider text-primary">
                      {business.categoryName}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-blue-500">
                      {business.locationName}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6 pt-4 border-t border-border">
                  <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                    {business.description}
                  </p>

                  {/* Contact Buttons */}
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
  );
}

export default function DirectoryPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
        <DirectoryHero />
        <CategoryGrid />
        <FeaturedBusinesses />

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
                  List Your Business
                </h2>
                <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
                  Join Bhutan's premium business directory and connect with thousands of potential customers.
                  Showcase your products and services to a targeted audience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/97517268753?text=Hi, I'm interested in listing my business"
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Get Started
                  </a>
                  <a
                    href="/support"
                    className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-background border-2 border-border text-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:border-primary/30 hover:text-primary transition-all"
                  >
                    Learn More
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