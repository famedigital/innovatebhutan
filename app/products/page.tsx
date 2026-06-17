import { Metadata } from "next";
import { Suspense } from "react";
import { HeroProductSlider } from "@/components/product-slider/hero-product-slider";
import {
  PRODUCTS_CATALOG,
  PRODUCT_CATEGORIES,
  type ProductCategory,
  getProductsByCategory,
  getFeaturedProducts,
  getPopularProducts,
  getNewProducts,
} from "@/lib/data/products-catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  Mail,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "IT Products & Supplies | Innovate Bhutan",
  description:
    "Browse our comprehensive catalog of IT products and supplies for the Bhutan market. POS systems, security cameras, networking equipment, and more.",
  keywords:
    "IT products Bhutan, POS systems, CCTV, networking, computers, Innovate Bhutan",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; search?: string };
}) {
  const selectedCategory = (searchParams.category || "all") as ProductCategory | "all";
  const sortBy = searchParams.sort || "featured";

  // Filter products
  let filteredProducts = selectedCategory === "all"
    ? PRODUCTS_CATALOG
    : getProductsByCategory(selectedCategory);

  // Search filter
  if (searchParams.search) {
    const keyword = searchParams.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }

  // Sort products
  switch (sortBy) {
    case "price-low":
      filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "new":
      filteredProducts = [...filteredProducts].filter((p) => p.new);
      break;
    case "popular":
      filteredProducts = [...filteredProducts].filter((p) => p.popular);
      break;
    default: // featured
      filteredProducts = filteredProducts.filter((p) => p.featured || p.popular);
  }

  const categoryInfo = selectedCategory !== "all"
    ? PRODUCT_CATEGORIES[selectedCategory]
    : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="outline">
            <ShoppingBag className="w-3 h-3 mr-1" />
            IT Supplies & Equipment
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
            IT Products Catalog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium IT products and supplies for businesses across Bhutan. From POS
            systems to security cameras, we have everything you need.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
              asChild
            >
              <a href="#featured-products">
                Browse Products
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <a href="mailto:info@innovates.bt?subject=Product Inquiry">
                <Mail className="w-4 h-4 mr-2" />
                Request Quote
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section id="featured-products" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">
              Our most popular IT products and supplies
            </p>
          </div>
          <HeroProductSlider limit={8} autoPlayInterval={6000} />
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">
              Find exactly what you need by category
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => (
              <a
                key={key}
                href={`/products?category=${key}`}
                className={`
                  group relative p-6 rounded-2xl text-center transition-all duration-300
                  ${
                    selectedCategory === key
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-card hover:bg-card/80 hover:shadow-md hover:scale-105"
                  }
                `}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className="font-medium text-sm">{cat.label}</div>
                <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {categoryInfo ? (
                  <span>
                    {categoryInfo.icon} {categoryInfo.label}
                  </span>
                ) : (
                  "All Products"
                )}
              </h2>
              <p className="text-muted-foreground text-sm">
                {filteredProducts.length} products found
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select value={sortBy} name="sort">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="new">New Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" asChild>
                <a href={`/products${selectedCategory !== "all" ? `?category=${selectedCategory}` : ""}`}>
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </a>
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty state */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button asChild>
                <a href="/products">View All Products</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-muted-foreground mb-8">
            Our team is here to help you find the right IT solutions for your business.
            Get in touch with us for personalized recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
              asChild
            >
              <a href="mailto:info@innovates.bt?subject=Product Inquiry">
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
            >
              <a href="https://wa.me/97517345678" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Product Card Component
 */
function ProductCard({ product }: { product: typeof PRODUCTS_CATALOG[number] }) {
  const categoryInfo = PRODUCT_CATEGORIES[product.category];

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {/* Badges */}
        <div className="flex gap-2 mb-4">
          {product.new && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
          {product.popular && (
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Category Icon */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{categoryInfo?.icon || "📦"}</span>
          <span className="text-xs text-muted-foreground">{categoryInfo?.label}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {product.tagline}
        </p>

        {/* Specifications Preview */}
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="text-xs space-y-1">
            {Object.entries(product.specifications).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium truncate ml-2">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-auto">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="text-xl font-bold text-primary">
              Nu. {product.price.toLocaleString('en-US')}
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80"
            asChild
          >
            <a href={`mailto:info@innovates.bt?subject=Product Inquiry: ${encodeURIComponent(product.name)}`}>
              Inquire
            </a>
          </Button>
        </div>

        {/* Brand */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            by <span className="font-medium">{product.brand}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
