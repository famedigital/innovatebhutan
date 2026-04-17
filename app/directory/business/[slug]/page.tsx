"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star, Award, Building2, Phone, MessageSquare, Globe, MapPin,
  CheckCircle, Clock, Calendar, ChevronRight, Share2, Heart,
  Mail, Navigation as NavigationIcon, X
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";
import Link from "next/link";

// 🏪 Sample business data (will be replaced with API data)
const businessData: Record<string, any> = {
  "tech-solutions-bhutan": {
    id: 1,
    name: "Tech Solutions Bhutan",
    slug: "tech-solutions-bhutan",
    tagline: "Premier IT Services Provider",
    description: "Complete enterprise IT solutions including networking, security, and software development. We specialize in delivering cutting-edge technology solutions tailored for Bhutanese businesses.",
    longDescription: "With over 10 years of experience in the Bhutanese IT sector, Tech Solutions Bhutan has established itself as a trusted partner for businesses seeking digital transformation. Our team of certified professionals delivers enterprise-grade solutions in networking, cybersecurity, cloud infrastructure, and custom software development.",
    logoUrl: "https://ui-avatars.com/api/?name=Tech+Solutions&background=10B981&color=fff&size=200",
    coverImageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop",
    phone: "+975 17268753",
    whatsapp: "+975 17268753",
    email: "info@techsolutions.bt",
    website: "https://techsolutions.bt",
    address: "Changangkha Lhakhang Road, Thimphu, Bhutan",
    coordinates: { lat: 27.4712, lng: 89.6391 },
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    isFeatured: true,
    categoryName: "IT Services",
    locationName: "Thimphu",
    establishedYear: 2014,
    employees: 45,
    businessHours: [
      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
      { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
      { day: "Sunday", hours: "Closed" }
    ],
    services: [
      "Network Infrastructure & Security",
      "Cloud Solutions & Migration",
      "Custom Software Development",
      "IT Consulting & Support",
      "Cybersecurity Audits",
      "Data Analytics & BI"
    ],
    certifications: ["ISO 27001", "Microsoft Partner", "Cisco Certified"],
    gallery: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop"
    ],
    reviews: [
      {
        id: 1,
        customerName: "Dorji Wangmo",
        rating: 5,
        title: "Excellent IT Support",
        comment: "Tech Solutions Bhutan transformed our entire network infrastructure. Their team was professional, knowledgeable, and delivered on time. Highly recommended!",
        date: "2024-03-15",
        verified: true
      },
      {
        id: 2,
        customerName: "Karma Tshering",
        rating: 4,
        title: "Reliable Service Provider",
        comment: "We've been working with them for 3 years now. Consistent quality and good response times for support issues.",
        date: "2024-02-20",
        verified: true
      },
      {
        id: 3,
        customerName: "Pema Lhamo",
        rating: 5,
        title: "Professional Team",
        comment: "Great communication throughout our software development project. They understood our requirements perfectly.",
        date: "2024-01-10",
        verified: false
      }
    ]
  }
};

// 📝 Sample reviews data
const getReviewsForBusiness = (slug: string) => {
  const business = businessData[slug];
  return business?.reviews || [];
};

export default function BusinessPage({ params }: { params: { slug: string } }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [liked, setLiked] = useState(false);

  const business = businessData[params.slug] || businessData["tech-solutions-bhutan"];
  const reviews = getReviewsForBusiness(params.slug);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : business.rating;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
        {/* Cover Image */}
        <div className="relative h-80 lg:h-96 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20" />
          <img
            src={business.coverImageUrl}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          {/* Back Button */}
          <Link
            href="/directory"
            className="absolute top-24 left-5 inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white hover:bg-black/70 transition-all z-10"
          >
            <NavigationIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Directory</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-5 -mt-32 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Business Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-3xl p-8 border border-border shadow-2xl"
              >
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 p-2"
                  />

                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h1 className="text-3xl font-black text-foreground dark:neon-text">
                        {business.name}
                      </h1>
                      {business.isVerified && (
                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-lg text-foreground/60 mb-4">{business.tagline}</p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(parseFloat(averageRating))
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-foreground">{averageRating}</span>
                        <span className="text-sm text-foreground/40">({business.reviewCount} reviews)</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <MapPin className="w-4 h-4" />
                        <span>{business.locationName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setLiked(!liked)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl text-foreground font-medium transition-all"
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="text-sm">{liked ? 'Saved' : 'Save'}</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-xl text-foreground font-medium transition-all">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>

                <p className="text-foreground/70 leading-relaxed mb-6">
                  {business.longDescription}
                </p>

                {/* Business Stats */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary mb-1">{business.establishedYear}</div>
                    <div className="text-xs text-foreground/40">Established</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary mb-1">{business.employees}+</div>
                    <div className="text-xs text-foreground/40">Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-primary mb-1">{business.reviewCount}</div>
                    <div className="text-xs text-foreground/40">Reviews</div>
                  </div>
                </div>
              </motion.div>

              {/* Services & Products */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-3xl p-8 border border-border shadow-2xl"
              >
                <h2 className="text-2xl font-black text-foreground mb-6 dark:neon-text">
                  Services & Products
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {business.services.map((service: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border"
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{service}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Gallery */}
              {business.gallery && business.gallery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-3xl p-8 border border-border shadow-2xl"
                >
                  <h2 className="text-2xl font-black text-foreground mb-6 dark:neon-text">
                    Photo Gallery
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {business.gallery.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${business.name} ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Reviews Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-3xl p-8 border border-border shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-foreground dark:neon-text">
                    Reviews & Ratings
                  </h2>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="px-6 py-3 bg-primary text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-white hover:scale-105 transition-all"
                  >
                    Write Review
                  </button>
                </div>

                {/* Rating Summary */}
                <div className="flex items-center gap-8 p-6 bg-background/50 rounded-xl border border-border mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-black text-primary mb-2">{averageRating}</div>
                    <div className="flex items-center gap-1 justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(parseFloat(averageRating))
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-foreground/40">{business.reviewCount} reviews</div>
                  </div>

                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter((r: any) => r.rating === stars).length;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-foreground/60 w-12">{stars} ★</span>
                          <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-foreground/40 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review: any, index: number) => (
                    <div
                      key={review.id}
                      className="p-6 bg-background/50 rounded-xl border border-border"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-foreground">{review.customerName}</h4>
                            {review.verified && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 border border-primary/30 rounded-full text-[8px] font-black uppercase tracking-wider text-primary">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-foreground/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-foreground/40">{review.date}</span>
                      </div>

                      <h5 className="font-semibold text-foreground mb-2">{review.title}</h5>
                      <p className="text-sm text-foreground/70 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-3xl p-6 border border-border shadow-2xl sticky top-24"
              >
                <h3 className="text-xl font-black text-foreground mb-6 dark:neon-text">
                  Contact Information
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-foreground/40">Phone</div>
                      <div className="font-medium text-foreground">{business.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-foreground/40">Email</div>
                      <div className="font-medium text-foreground text-sm">{business.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-xs text-foreground/40">Address</div>
                      <div className="font-medium text-foreground text-sm">{business.address}</div>
                    </div>
                  </div>

                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-xs text-foreground/40">Website</div>
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary text-sm hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                    WhatsApp Now
                  </a>

                  <a
                    href={`tel:${business.phone.replace(/\D/g, '')}`}
                    className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground font-black uppercase text-xs tracking-widest rounded-xl transition-all"
                  >
                    <Phone className="w-5 h-5" />
                    Call Business
                  </a>
                </div>

                {/* Business Hours */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Business Hours
                  </h4>
                  <div className="space-y-2">
                    {business.businessHours.map((hours: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-foreground/60">{hours.day}</span>
                        <span className="font-medium text-foreground">{hours.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {business.certifications && business.certifications.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {business.certifications.map((cert: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-wider text-primary"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
      <WhatsAppButton />

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-3xl p-8 max-w-lg w-full border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-foreground dark:neon-text">
                Write a Review
              </h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
                    >
                      <Star className="w-8 h-8 text-foreground/20 hover:text-yellow-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  placeholder="Summarize your experience"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Review
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your experience..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/30 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border text-foreground font-black uppercase text-xs tracking-widest rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-white hover:scale-105 transition-all shadow-lg"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}