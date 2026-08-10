import { Metadata } from "next";
import Link from "next/link";
import {
  PRODUCTS_CATALOG,
  PRODUCT_CATEGORIES,
  type ProductCategory,
  getProductsByCategory,
} from "@/lib/data/products-catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroProductSlider } from "@/components/product-slider/hero-product-slider";
import {
  ShoppingBag,
  TrendingUp,
  Sparkles,
  Filter,
  Mail,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "IT Products & Supplies | Innovate Bhutan",
  description:
    "Browse our comprehensive catalog of IT products and supplies for the Bhutan market. POS systems, security cameras, networking equipment, and more.",
  keywords:
    "IT products Bhutan, POS systems, CCTV, networking, computers, Innovate Bhutan",
};

type SearchParams = {
  category?: string;
  sort?: string;
  search?: string;
};

const SORT_OPTIONS = [
  { value: "all", label: "All in category" },
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Popular" },
  { value: "new", label: "New Arrivals" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
] as const;

function isProductCategory(value: string): value is ProductCategory {
  return value in PRODUCT_CATEGORIES;
}

function buildProductsHref(opts: {
  category?: string;
  sort?: string;
  search?: string;
  hash?: string;
}) {
  const params = new URLSearchParams();
  if (opts.category && opts.category !== "all") {
    params.set("category", opts.category);
  }
  if (opts.sort && opts.sort !== "all") {
    params.set("sort", opts.sort);
  }
  if (opts.search) {
    params.set("search", opts.search);
  }
  const qs = params.toString();
  return `/products${qs ? `?${qs}` : ""}${opts.hash || ""}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawCategory = params.category || "all";
  const selectedCategory =
    rawCategory !== "all" && isProductCategory(rawCategory)
      ? rawCategory
      : "all";

  // When browsing a category, show all items in that category by default
  const sortBy =
    params.sort || (selectedCategory !== "all" ? "all" : "featured");

  let filteredProducts =
    selectedCategory === "all"
      ? [...PRODUCTS_CATALOG]
      : getProductsByCategory(selectedCategory);

  if (params.search) {
    const keyword = params.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );
  }

  switch (sortBy) {
    case "price-low":
      filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
      break;
    case "name":
      filteredProducts = [...filteredProducts].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;
    case "new":
      filteredProducts = filteredProducts.filter((p) => p.new);
      break;
    case "popular":
      filteredProducts = filteredProducts.filter((p) => p.popular);
      break;
    case "featured":
      filteredProducts = filteredProducts.filter((p) => p.featured || p.popular);
      break;
    default:
      // "all" — keep full category list
      break;
  }

  const categoryInfo =
    selectedCategory !== "all" ? PRODUCT_CATEGORIES[selectedCategory] : null;

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <div className="relative mx-auto max-w-7xl text-center">
          <Badge className="mb-4" variant="outline">
            <ShoppingBag className="mr-1 h-3 w-3" />
            IT Supplies & Equipment
          </Badge>
          <h1 className="gradient-text mb-4 text-5xl font-bold md:text-6xl">
            IT Products Catalog
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            Premium IT products and supplies for businesses across Bhutan. From
            POS systems to security cameras, we have everything you need.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
              asChild
            >
              <a href="#product-catalog">Browse Products</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="mailto:info@innovates.bt?subject=Product Inquiry">
                <Mail className="mr-2 h-4 w-4" />
                Request Quote
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="featured-products" className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">
              Our most popular IT products and supplies
            </p>
          </div>
          <HeroProductSlider limit={8} autoPlayInterval={6000} />
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">
              Find exactly what you need by category
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            {Object.entries(PRODUCT_CATEGORIES).map(([key, cat]) => {
              const active = selectedCategory === key;
              return (
                <Link
                  key={key}
                  href={buildProductsHref({
                    category: key,
                    sort: "all",
                    hash: "#product-catalog",
                  })}
                  scroll={false}
                  className={`group relative rounded-2xl p-6 text-center transition-all duration-300 ${
                    active
                      ? "scale-105 bg-primary text-primary-foreground shadow-lg"
                      : "bg-card hover:scale-105 hover:bg-card/80 hover:shadow-md"
                  }`}
                >
                  <div className="mb-3 text-4xl">{cat.icon}</div>
                  <div className="text-sm font-medium">{cat.label}</div>
                  {!active && (
                    <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="product-catalog" className="scroll-mt-24 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
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
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product
                {filteredProducts.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => {
                  const active = sortBy === opt.value;
                  return (
                    <Link
                      key={opt.value}
                      href={buildProductsHref({
                        category: selectedCategory,
                        sort: opt.value,
                        search: params.search,
                        hash: "#product-catalog",
                      })}
                      scroll={false}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>

              {(selectedCategory !== "all" ||
                sortBy !== "featured" ||
                params.search) && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/products#product-catalog" scroll={false}>
                    <Filter className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-4 text-6xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold">No products found</h3>
              <p className="mb-4 text-muted-foreground">
                Try another category or clear filters
              </p>
              <Button asChild>
                <Link href="/products#product-catalog" scroll={false}>
                  View All Products
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 via-background to-primary/10 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Need Help Choosing?</h2>
          <p className="mb-8 text-muted-foreground">
            Our team is here to help you find the right IT solutions for your
            business. Get in touch with us for personalized recommendations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
              asChild
            >
              <a href="mailto:info@innovates.bt?subject=Product Inquiry">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://wa.me/97517268753"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product }: { product: (typeof PRODUCTS_CATALOG)[number] }) {
  const categoryInfo = PRODUCT_CATEGORIES[product.category];

  return (
    <div className="group relative">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="glass-card relative flex h-full flex-col rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="mb-4 flex gap-2">
          {product.new && (
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              New
            </Badge>
          )}
          {product.popular && (
            <Badge className="border-blue-500/20 bg-blue-500/10 text-blue-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Popular
            </Badge>
          )}
          {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="text-2xl">{categoryInfo?.icon || "📦"}</span>
          <span className="text-xs text-muted-foreground">
            {categoryInfo?.label}
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
          {product.name}
        </h3>

        <p className="mb-4 line-clamp-2 flex-grow text-sm text-muted-foreground">
          {product.tagline}
        </p>

        <div className="mb-4 rounded-lg bg-muted/50 p-3">
          <div className="space-y-1 text-xs">
            {Object.entries(product.specifications)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="ml-2 truncate font-medium">{value}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="text-xl font-bold text-primary">
              Nu. {product.price.toLocaleString("en-US")}
            </div>
          </div>
          <Button
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80"
            asChild
          >
            <a
              href={`mailto:info@innovates.bt?subject=Product Inquiry: ${encodeURIComponent(product.name)}`}
            >
              Inquire
            </a>
          </Button>
        </div>

        <div className="mt-4 border-t border-border/50 pt-4">
          <span className="text-xs text-muted-foreground">
            by <span className="font-medium">{product.brand}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
