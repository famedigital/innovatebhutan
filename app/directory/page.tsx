"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, ChevronRight, MapPin, Star, Phone, MessageSquare,
  Globe, ChevronDown, Filter, SlidersHorizontal, Heart, Share2,
  Building2, Zap, Shield, Code, Monitor, Database, Camera, Wrench,
  Smartphone, Users, Award, CheckCircle, Grid3x3, List
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// All predefined service types - comprehensive list
const allServiceTypes = [
  // Technology
  { id: "pos", name: "POS Systems", category: "Technology", icon: Zap },
  { id: "erp", name: "ERP Solutions", category: "Technology", icon: Database },
  { id: "crm", name: "CRM Software", category: "Technology", icon: Users },
  { id: "inventory", name: "Inventory Management", category: "Technology", icon: Grid3x3 },
  { id: "accounting", name: "Accounting Software", category: "Technology", icon: Monitor },
  { id: "hrms", name: "HR & Payroll", category: "Technology", icon: Users },
  { id: "bi", name: "Business Intelligence", category: "Technology", icon: Code },
  { id: "analytics", name: "Analytics & Reports", category: "Technology", icon: Database },

  // Development
  { id: "web-dev", name: "Web Development", category: "Development", icon: Code },
  { id: "mobile-app", name: "Mobile Apps", category: "Development", icon: Smartphone },
  { id: "custom-software", name: "Custom Software", category: "Development", icon: Code },
  { id: "saas", name: "SaaS Products", category: "Development", icon: Database },
  { id: "api", name: "API Integration", category: "Development", icon: Code },

  // Infrastructure
  { id: "networking", name: "Networking", category: "Infrastructure", icon: Globe },
  { id: "servers", name: "Server Setup", category: "Infrastructure", icon: Monitor },
  { id: "cloud", name: "Cloud Services", category: "Infrastructure", icon: Database },
  { id: "datacenter", name: "Data Center", category: "Infrastructure", icon: Database },
  { id: "cabling", name: "Structured Cabling", category: "Infrastructure", icon: Zap },

  // Security
  { id: "cctv", name: "CCTV & Surveillance", category: "Security", icon: Camera },
  { id: "access-control", name: "Access Control", category: "Security", icon: Shield },
  { id: "firewall", name: "Firewall & Security", category: "Security", icon: Shield },
  { id: "alarm", name: "Alarm Systems", category: "Security", icon: Shield },

  // Hardware
  { id: "computers", name: "Computers & Laptops", category: "Hardware", icon: Monitor },
  { id: "printers", name: "Printers & Scanners", category: "Hardware", icon: Monitor },
  { id: "ups", name: "UPS & Power", category: "Hardware", icon: Zap },
  { id: "servers-hardware", name: "Server Hardware", category: "Hardware", icon: Monitor },

  // Consulting
  { id: "it-consulting", name: "IT Consulting", category: "Consulting", icon: Users },
  { id: "digital-transformation", name: "Digital Transformation", category: "Consulting", icon: Zap },
  { id: "tech-advisory", name: "Technology Advisory", category: "Consulting", icon: Users },

  // Support
  { id: "maintenance", name: "IT Maintenance", category: "Support", icon: Wrench },
  { id: "helpdesk", name: "Help Desk Support", category: "Support", icon: Users },
  { id: "recovery", name: "Data Recovery", category: "Support", icon: Database },
];

// Categories from service types (computed once since data is static)
const categories = (() => {
  const cats = new Set(allServiceTypes.map(s => s.category));
  return Array.from(cats).map(cat => ({
    id: cat.toLowerCase(),
    name: cat,
    services: allServiceTypes.filter(s => s.category === cat)
  }));
})();

// Locations
const locations = [
  { id: "all", name: "All Bhutan" },
  { id: "thimphu", name: "Thimphu" },
  { id: "paro", name: "Paro" },
  { id: "punakha", name: "Punakha" },
  { id: "wangdue", name: "Wangdue" },
  { id: "mongar", name: "Mongar" },
  { id: "trashigang", name: "Trashigang" },
  { id: "bumthang", name: "Bumthang" },
  { id: "phuentsholing", name: "Phuentsholing" },
  { id: "gelephu", name: "Gelephu" },
  { id: "samdrup", name: "Samdrup Jongkhar" },
  { id: "other", name: "Other Dzongkhags" },
];

// Sample Businesses
const sampleBusinesses = [
  {
    id: 1,
    name: "Tech Solutions Bhutan",
    tagline: "Premier IT Services Provider",
    description: "Complete enterprise IT solutions including networking, security, and software development.",
    logo: "https://ui-avatars.com/api/?name=TS&background=10B981&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    rating: 4.8,
    reviewCount: 124,
    verified: true,
    services: ["pos", "erp", "crm", "networking", "cctv"],
    location: "Thimphu",
    locationId: "thimphu",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://techsolutions.bt",
    since: "2018",
  },
  {
    id: 2,
    name: "Digital Transformations",
    tagline: "Custom Software Development",
    description: "Bespoke software solutions from ERP to mobile apps. Transform your business with cutting-edge technology.",
    logo: "https://ui-avatars.com/api/?name=DT&background=8B5CF6&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    rating: 4.9,
    reviewCount: 89,
    verified: true,
    services: ["web-dev", "mobile-app", "custom-software", "saas"],
    location: "Paro",
    locationId: "paro",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://digitaltransform.bt",
    since: "2019",
  },
  {
    id: 3,
    name: "SecureNet Bhutan",
    tagline: "Security & Surveillance Experts",
    description: "CCTV installation, security systems, and surveillance solutions for homes and businesses.",
    logo: "https://ui-avatars.com/api/?name=SN&background=F59E0B&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    rating: 4.7,
    reviewCount: 67,
    verified: true,
    services: ["cctv", "access-control", "firewall", "alarm"],
    location: "Punakha",
    locationId: "punakha",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://securenet.bt",
    since: "2020",
  },
  {
    id: 4,
    name: "CloudHub Technologies",
    tagline: "Cloud Solutions Provider",
    description: "AWS, Azure, and Google Cloud setup, migration, and management services.",
    logo: "https://ui-avatars.com/api/?name=CH&background=06B6D4&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    rating: 4.6,
    reviewCount: 45,
    verified: true,
    services: ["cloud", "servers", "networking", "datacenter"],
    location: "Thimphu",
    locationId: "thimphu",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://cloudhub.bt",
    since: "2021",
  },
  {
    id: 5,
    name: "RetailTech Bhutan",
    tagline: "POS & Retail Solutions",
    description: "Complete POS systems, inventory management, and retail automation.",
    logo: "https://ui-avatars.com/api/?name=RT&background=EC4899&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    rating: 4.5,
    reviewCount: 38,
    verified: false,
    services: ["pos", "inventory", "accounting", "crm"],
    location: "Wangdue",
    locationId: "wangdue",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://retailtech.bt",
    since: "2020",
  },
  {
    id: 6,
    name: "NetPro Systems",
    tagline: "Networking Infrastructure",
    description: "Structured cabling, fiber networks, WiFi setup, and enterprise networking.",
    logo: "https://ui-avatars.com/api/?name=NP&background=3B82F6&color=fff&size=200",
    banner: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
    rating: 4.4,
    reviewCount: 29,
    verified: true,
    services: ["networking", "cabling", "servers", "datacenter"],
    location: "Thimphu",
    locationId: "thimphu",
    phone: "+975 17268753",
    whatsapp: "97517268753",
    website: "https://netpro.bt",
    since: "2019",
  },
];

export default function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Advanced search with autocomplete
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    // Search in businesses
    const businessMatches = sampleBusinesses
      .filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tagline.toLowerCase().includes(query)
      )
      .map(b => ({ type: "business", ...b }));

    // Search in service types
    const serviceMatches = allServiceTypes
      .filter(s => s.name.toLowerCase().includes(query))
      .map(s => ({ type: "service", ...s }));

    return [...businessMatches, ...serviceMatches].slice(0, 8);
  }, [searchQuery]);

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return sampleBusinesses.filter((business) => {
      const matchesCategory = !selectedCategory ||
        allServiceTypes.some(s => s.id === business.services[0] && s.category === selectedCategory);
      const matchesService = !selectedService || business.services.includes(selectedService);
      const matchesLocation = selectedLocation === "all" || business.locationId === selectedLocation;
      const matchesRating = !selectedRating || business.rating >= selectedRating;

      return matchesCategory && matchesService && matchesLocation && matchesRating;
    });
  }, [selectedCategory, selectedService, selectedLocation, selectedRating]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = () => setShowSearchResults(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black">
      {/* iOS App Store Style Header */}
      <header className="bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-[#38383a] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">Directory</span>
            </Link>

            {/* Search Bar - iOS style */}
            <div className="flex-1 max-w-xl mx-4 relative" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search businesses, services..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1c1c1e] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Dropdown - iOS style */}
              <AnimatePresence>
                {showSearchResults && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-xl border border-gray-200 dark:border-[#38383a] overflow-hidden z-50"
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((result, idx) => (
                        <Link
                          key={idx}
                          href={result.type === "business" ? `/directory/business/${result.id}` : `/directory?service=${result.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] transition first:rounded-t-2xl last:rounded-b-2xl"
                          onClick={() => setShowSearchResults(false)}
                        >
                          {result.type === "business" ? (
                            <>
                              <Image
                                src={result.logo}
                                alt={result.name}
                                width={40}
                                height={40}
                                className="rounded-xl"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.tagline}</p>
                              </div>
                              <Star className="w-4 h-4 text-yellow-500" />
                            </>
                          ) : (
                            <>
                              <div className="w-10 h-10 bg-gray-100 dark:bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                                {result.icon && <result.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{result.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{result.category}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">No results found</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2c2c2e] rounded-xl transition">
                <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <Link
                href="/directory/register"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl text-sm font-medium transition"
              >
                <Building2 className="w-4 h-4" />
                List Your Business
              </Link>
            </div>
          </div>

          {/* Category Pills - Horizontal scroll (iOS style) */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedService(null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                !selectedCategory && !selectedService
                  ? "bg-[#10B981] text-white"
                  : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedService(null);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-[#10B981] text-white"
                    : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300 md:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop (iOS style) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Service Type Filter */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Services
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {allServiceTypes.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                        selectedService === service.id
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "hover:bg-gray-50 dark:hover:bg-[#2c2c2e]"
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-[#2c2c2e] rounded-lg flex items-center justify-center">
                        <service.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{service.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Location
                </h3>
                <div className="space-y-1">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                        selectedLocation === location.id
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "hover:bg-gray-50 dark:hover:bg-[#2c2c2e]"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{location.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Rating
                </h3>
                <div className="space-y-1">
                  {[4, 3, 2].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                        selectedRating === rating
                          ? "bg-[#10B981]/10 text-[#10B981]"
                          : "hover:bg-gray-50 dark:hover:bg-[#2c2c2e]"
                      }`}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Business Grid - iOS App Store style */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition ${viewMode === "grid" ? "bg-white dark:bg-[#1c1c1e] shadow-sm" : ""}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition ${viewMode === "list" ? "bg-white dark:bg-[#1c1c1e] shadow-sm" : ""}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Businesses Grid */}
            {filteredBusinesses.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
              }>
                {filteredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-12 text-center shadow-sm">
                <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No businesses found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Try adjusting your filters
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedService(null);
                    setSelectedLocation("all");
                    setSelectedRating(null);
                  }}
                  className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-sm font-medium transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Bottom Sheet - iOS style */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1c1c1e] rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center py-3 border-b border-gray-200 dark:border-[#38383a]">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {/* Services */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {allServiceTypes.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                          selectedService === service.id
                            ? "bg-[#10B981] text-white"
                            : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <service.icon className="w-4 h-4" />
                        <span className="truncate">{service.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          selectedLocation === location.id
                            ? "bg-[#10B981] text-white"
                            : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {location.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rating</h3>
                  <div className="flex gap-2">
                    {[4, 3, 2].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                          selectedRating === rating
                            ? "bg-[#10B981] text-white"
                            : "bg-gray-100 dark:bg-[#2c2c2e] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {rating}+ Stars
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="p-4 border-t border-gray-200 dark:border-[#38383a]">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-lg font-semibold transition"
                >
                  Show Results ({filteredBusinesses.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Business Card - iOS App Store style
function BusinessCard({ business, viewMode }: { business: typeof sampleBusinesses[0]; viewMode: "grid" | "list" }) {
  return (
    <Link
      href={`/directory/business/${business.id}`}
      className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm hover:shadow-md transition overflow-hidden group"
    >
      {viewMode === "grid" ? (
        // Grid View - iOS App Card Style
        <div className="p-4">
          {/* Header with Logo & Info */}
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl flex-shrink-0 relative overflow-hidden">
              <Image
                src={business.logo}
                alt={business.name}
                fill
                className="object-cover"
              />
              {business.verified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1 group-hover:text-[#10B981] transition">
                {business.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">{business.tagline}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{business.rating}</span>
                <span className="text-xs text-gray-400">({business.reviewCount})</span>
              </div>
            </div>
          </div>

          {/* Services Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {business.services.slice(0, 3).map((serviceId) => {
              const service = allServiceTypes.find(s => s.id === serviceId);
              return service ? (
                <span key={serviceId} className="px-2 py-1 bg-gray-100 dark:bg-[#2c2c2e] rounded-full text-xs text-gray-600 dark:text-gray-400">
                  {service.name}
                </span>
              ) : null;
            })}
            {business.services.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-400">+{business.services.length - 3}</span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="w-3 h-3" />
            {business.location}
          </div>

          {/* Contact Button */}
          <a
            href={`https://wa.me/${business.whatsapp}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </a>
        </div>
      ) : (
        // List View
        <div className="flex p-4 gap-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-[#2c2c2e] rounded-2xl flex-shrink-0 relative overflow-hidden">
            <Image
              src={business.logo}
              alt={business.name}
              fill
              className="object-cover"
            />
            {business.verified && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-[#10B981] transition">
              {business.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{business.tagline}</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-medium">{business.rating}</span>
                <span className="text-xs text-gray-400">({business.reviewCount})</span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {business.location}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {business.services.slice(0, 3).map((serviceId) => {
                const service = allServiceTypes.find(s => s.id === serviceId);
                return service ? (
                  <span key={serviceId} className="px-2 py-1 bg-gray-100 dark:bg-[#2c2c2e] rounded-full text-xs text-gray-600 dark:text-gray-400">
                    {service.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <a
            href={`https://wa.me/${business.whatsapp}`}
            onClick={(e) => e.stopPropagation()}
            className="self-start px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-sm font-medium flex items-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </a>
        </div>
      )}
    </Link>
  );
}
