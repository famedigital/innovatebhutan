import { db } from "../db";
import { heroContent } from "../db/schema";
import { eq } from "drizzle-orm";

async function updateHeroMessaging() {
  try {
    // Update active hero content with new professional messaging
    await db.update(heroContent)
      .set({
        headline: "Your Complete Technology Partner",
        subheadline: "From Custom Software to Complete IT Operations",
        description: "We build what your business needs. Custom software development. Ready-to-use products. Complete IT operations. 350+ businesses across Bhutan trust us with their digital transformation.",
        primaryCtaText: "Explore Our Services",
        primaryCtaLink: "/services",
        secondaryCtaText: "Get Free Consultation",
        secondaryCtaLink: "https://wa.me/97517344444",
        showTrustIndicators: true,
        clientCount: 350,
        yearsInBusiness: 15,
        featuredProducts: [
          {
            name: "POS Systems",
            description: "Complete retail & restaurant management",
            icon: "shopping-cart",
            url: "/services#pos"
          },
          {
            name: "Real Estate Software",
            description: "Property management & CRM",
            icon: "building",
            url: "/services#realestate"
          },
          {
            name: "E-commerce Platform",
            description: "Sell online with confidence",
            icon: "shopping-bag",
            url: "/services#ecommerce"
          },
          {
            name: "Hotel Management",
            description: "Complete property solutions",
            icon: "home",
            url: "/services#hotel"
          },
          {
            name: "Security & Surveillance",
            description: "CCTV & access control systems",
            icon: "shield",
            url: "/services#security"
          },
          {
            name: "Custom Development",
            description: "Web, mobile & SaaS applications",
            icon: "code",
            url: "/services#custom"
          }
        ],
        updatedAt: new Date()
      })
      .where(eq(heroContent.isActive, true));

    console.log("✅ Hero content updated successfully!");

    // Verify the update
    const updated = await db.select().from(heroContent).where(eq(heroContent.isActive, true));
    console.log("Updated hero content:", updated[0]);

  } catch (error) {
    console.error("Error updating hero content:", error);
    process.exit(1);
  }
}

updateHeroMessaging();