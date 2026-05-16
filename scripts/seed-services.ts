import { db } from "../db";
import { servicesFull } from "../db/schema";

async function seedServices() {
  console.log("🌱 Starting to seed services...");

  const servicesData = [
    {
      title: "POS Solutions",
      slug: "pos-solutions",
      shortDescription: "Modern point-of-sale systems for retail and hospitality businesses",
      description: "Complete POS solutions including Retail POS, Restaurant POS with inventory management, sales tracking, and customer management.",
      iconName: "Store",
      iconColor: "#FF6B35",
      gradientFrom: "#FF6B35",
      gradientTo: "#DC2626",
      category: "POS Systems",
      features: ["Inventory Management", "Sales Analytics", "Customer Management", "Multi-store Support"],
      isActive: true,
      isFeatured: true,
      displayOrder: 1,
    },
    {
      title: "Hotel PMS",
      slug: "hotel-pms",
      shortDescription: "Complete property management solutions for hotels and resorts",
      description: "Comprehensive Hotel PMS with room booking, guest management, billing, housekeeping, and front desk operations.",
      iconName: "Hotel",
      iconColor: "#3B82F6",
      gradientFrom: "#3B82F6",
      gradientTo: "#4F46E5",
      category: "POS Systems",
      features: ["Room Booking", "Guest Management", "Housekeeping", "Billing & Invoicing"],
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
    },
    {
      title: "Web Development",
      slug: "web-development",
      shortDescription: "Custom web applications and software development",
      description: "Full-stack web development services including React, Next.js, Node.js applications tailored to your business needs.",
      iconName: "Code",
      iconColor: "#A855F7",
      gradientFrom: "#A855F7",
      gradientTo: "#EC4899",
      category: "Web/SaaS",
      features: ["React/Next.js", "Node.js", "Database Design", "API Development"],
      isActive: true,
      isFeatured: true,
      displayOrder: 3,
    },
    {
      title: "SaaS Development",
      slug: "saas-development",
      shortDescription: "Scalable SaaS platform development and deployment",
      description: "End-to-end SaaS development from concept to deployment, including architecture, development, and cloud infrastructure.",
      iconName: "Database",
      iconColor: "#8B5CF6",
      gradientFrom: "#8B5CF6",
      gradientTo: "#7C3AED",
      category: "Web/SaaS",
      features: ["Cloud Architecture", "Scalable Design", "Multi-tenant", "Subscription Management"],
      isActive: true,
      isFeatured: true,
      displayOrder: 4,
    },
    {
      title: "ERP Development",
      slug: "erp-development",
      shortDescription: "Custom ERP systems for business process automation",
      description: "Comprehensive ERP solutions covering finance, HR, inventory, projects, and more for business automation.",
      iconName: "LayoutGrid",
      iconColor: "#6366F1",
      gradientFrom: "#6366F1",
      gradientTo: "#2563EB",
      category: "Web/SaaS",
      features: ["Finance Module", "HR & Payroll", "Inventory Management", "Project Management"],
      isActive: true,
      isFeatured: true,
      displayOrder: 5,
    },
    {
      title: "Mobile App Development",
      slug: "mobile-app-development",
      shortDescription: "iOS and Android mobile application development",
      description: "Native and cross-platform mobile app development using React Native, Flutter, and modern frameworks.",
      iconName: "Smartphone",
      iconColor: "#14B8A6",
      gradientFrom: "#14B8A6",
      gradientTo: "#0891B2",
      category: "Web/SaaS",
      features: ["React Native", "Flutter", "iOS & Android", "App Store Deployment"],
      isActive: true,
      isFeatured: true,
      displayOrder: 6,
    },
    {
      title: "Infrastructure Solutions",
      slug: "infrastructure-solutions",
      shortDescription: "Complete IT infrastructure and networking setup",
      description: "Hardware solutions, network infrastructure, server setup, and power solutions for enterprise operations.",
      iconName: "Wrench",
      iconColor: "#64748B",
      gradientFrom: "#64748B",
      gradientTo: "#71717A",
      category: "Infrastructure",
      features: ["Network Setup", "Server Installation", "Hardware Solutions", "Power Management"],
      isActive: true,
      isFeatured: true,
      displayOrder: 7,
    },
    {
      title: "Security Systems",
      slug: "security-systems",
      shortDescription: "Advanced surveillance and access control systems",
      description: "Complete security solutions including CCTV, access control, alarm systems, and AI-powered surveillance.",
      iconName: "Shield",
      iconColor: "#EF4444",
      gradientFrom: "#EF4444",
      gradientTo: "#E11D48",
      category: "Security",
      features: ["CCTV Systems", "Access Control", "Alarm Systems", "AI Surveillance"],
      isActive: true,
      isFeatured: true,
      displayOrder: 8,
    },
    {
      title: "Technical Maintenance",
      slug: "technical-maintenance",
      shortDescription: "24/7 technical support and maintenance services",
      description: "Round-the-clock technical maintenance, support services, and system monitoring for business continuity.",
      iconName: "Zap",
      iconColor: "#22C55E",
      gradientFrom: "#22C55E",
      gradientTo: "#10B981",
      category: "Maintenance",
      features: ["24/7 Support", "Preventive Maintenance", "System Monitoring", "Emergency Response"],
      isActive: true,
      isFeatured: true,
      displayOrder: 9,
    },
    {
      title: "Payroll & HR Whitelabel",
      slug: "payroll-hr-whitelabel",
      shortDescription: "Complete payroll and HR management whitelabel solution",
      description: "Whitelabel payroll and HR software with Bhutan tax compliance, employee management, and automated payslips.",
      iconName: "Users",
      iconColor: "#F43F5E",
      gradientFrom: "#F43F5E",
      gradientTo: "#EC4899",
      category: "Web/SaaS",
      features: ["Payroll Processing", "Tax Compliance", "Employee Management", "Whitelabel Solution"],
      isActive: true,
      isFeatured: true,
      displayOrder: 10,
    },
    {
      title: "GST Services",
      slug: "gst-services",
      shortDescription: "GST filing and taxation services for businesses",
      description: "Complete GST services including filing, compliance, consultation, and tax planning for Bhutan businesses.",
      iconName: "FileText",
      iconColor: "#EAB308",
      gradientFrom: "#EAB308",
      gradientTo: "#D97706",
      category: "Business Services",
      features: ["GST Filing", "Tax Compliance", "Consultation", "Tax Planning"],
      isActive: true,
      isFeatured: true,
      displayOrder: 11,
    },
    {
      title: "IT Consulting",
      slug: "it-consulting",
      shortDescription: "Strategic IT consulting and digital transformation",
      description: "Expert IT consulting services for digital transformation, technology strategy, and business process optimization.",
      iconName: "Terminal",
      iconColor: "#06B6D4",
      gradientFrom: "#06B6D4",
      gradientTo: "#3B82F6",
      category: "Consulting",
      features: ["Digital Strategy", "Technology Planning", "Process Optimization", "Training"],
      isActive: true,
      isFeatured: true,
      displayOrder: 12,
    },
  ];

  try {
    // Clear existing services
    console.log("🗑️  Clearing existing services...");
    await db.delete(servicesFull);

    // Insert new services
    console.log("📝 Inserting new services...");
    for (const service of servicesData) {
      await db.insert(servicesFull).values(service);
      console.log(`✅ Added: ${service.title}`);
    }

    console.log("🎉 Services seeded successfully!");
    console.log(`📊 Total services: ${servicesData.length}`);

  } catch (error) {
    console.error("❌ Error seeding services:", error);
    process.exit(1);
  }
}

seedServices()
  .then(() => {
    console.log("✅ Seed completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });