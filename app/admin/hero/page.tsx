"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Eye,
  Plus,
  Trash2,
  Film,
  Type,
  Link as LinkIcon,
  Settings,
  Users,
  Award,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface HeroContent {
  id?: number;
  headline: string;
  subheadline: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  enableVideoBackground: boolean;
  videoCloudinaryId: string;
  videoPosterImageId: string;
  gradientFrom: string;
  gradientTo: string;
  overlayOpacity: number;
  showTrustIndicators: boolean;
  clientCount: number;
  yearsInBusiness: number;
  featuredProducts: FeaturedProduct[];
  isActive: boolean;
}

interface FeaturedProduct {
  name: string;
  description: string;
  icon: string;
  url?: string;
}

export default function HeroAdminPage() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    headline: "Your Complete Technology Partner",
    subheadline: "From Custom Software to Complete IT Operations",
    description: "We build what your business needs. Custom software development. Ready-to-use products. Complete IT operations.",
    primaryCtaText: "Explore Our Services",
    primaryCtaLink: "/services",
    secondaryCtaText: "Get Free Consultation",
    secondaryCtaLink: "https://wa.me/97517344444",
    enableVideoBackground: false,
    videoCloudinaryId: "",
    videoPosterImageId: "",
    gradientFrom: "#10B981",
    gradientTo: "#3B82F6",
    overlayOpacity: 0.7,
    showTrustIndicators: true,
    clientCount: 350,
    yearsInBusiness: 15,
    featuredProducts: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current hero content on load
  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/hero');
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const activeHero = data.data.find((h: HeroContent) => h.isActive) || data.data[0];
          setHeroContent({
            ...activeHero,
            overlayOpacity: parseFloat(activeHero.overlayOpacity?.toString() || "0.7"),
            featuredProducts: activeHero.featuredProducts || [],
          });
        }
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      toast.error("Failed to load hero content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/hero', {
        method: heroContent.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroContent),
      });

      if (response.ok) {
        toast.success("Hero content saved successfully!");
        await fetchHeroContent(); // Refresh the data
      } else {
        throw new Error('Failed to save hero content');
      }
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error("Failed to save hero content");
    } finally {
      setSaving(false);
    }
  };

  const updateHeroContent = (updates: Partial<HeroContent>) => {
    setHeroContent(prev => ({ ...prev, ...updates }));
  };

  const addFeaturedProduct = () => {
    setHeroContent(prev => ({
      ...prev,
      featuredProducts: [
        ...prev.featuredProducts,
        { name: "", description: "", icon: "package", url: "" }
      ]
    }));
  };

  const updateFeaturedProduct = (index: number, updates: Partial<FeaturedProduct>) => {
    setHeroContent(prev => ({
      ...prev,
      featuredProducts: prev.featuredProducts.map((product, i) =>
        i === index ? { ...product, ...updates } : product
      )
    }));
  };

  const removeFeaturedProduct = (index: number) => {
    setHeroContent(prev => ({
      ...prev,
      featuredProducts: prev.featuredProducts.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Content Management</h1>
          <p className="text-muted-foreground">
            Customize your homepage hero section with professional messaging
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="gap-2">
              <Type className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="visuals" className="gap-2">
              <Film className="w-4 h-4" />
              Visuals & Video
            </TabsTrigger>
            <TabsTrigger value="trust" className="gap-2">
              <Award className="w-4 h-4" />
              Trust Indicators
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Settings className="w-4 h-4" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Main Messaging</CardTitle>
                <CardDescription>
                  Craft compelling headlines and calls-to-action for your hero section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Main Headline</Label>
                  <Input
                    id="headline"
                    value={heroContent.headline}
                    onChange={(e) => updateHeroContent({ headline: e.target.value })}
                    placeholder="Your Complete Technology Partner"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline</Label>
                  <Input
                    id="subheadline"
                    value={heroContent.subheadline}
                    onChange={(e) => updateHeroContent({ subheadline: e.target.value })}
                    placeholder="From Custom Software to Complete IT Operations"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={heroContent.description}
                    onChange={(e) => updateHeroContent({ description: e.target.value })}
                    placeholder="We build what your business needs..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryCtaText">Primary CTA Text</Label>
                    <Input
                      id="primaryCtaText"
                      value={heroContent.primaryCtaText}
                      onChange={(e) => updateHeroContent({ primaryCtaText: e.target.value })}
                      placeholder="Explore Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryCtaLink">Primary CTA Link</Label>
                    <Input
                      id="primaryCtaLink"
                      value={heroContent.primaryCtaLink}
                      onChange={(e) => updateHeroContent({ primaryCtaLink: e.target.value })}
                      placeholder="/services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryCtaText">Secondary CTA Text</Label>
                    <Input
                      id="secondaryCtaText"
                      value={heroContent.secondaryCtaText}
                      onChange={(e) => updateHeroContent({ secondaryCtaText: e.target.value })}
                      placeholder="Get Free Quote"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryCtaLink">Secondary CTA Link</Label>
                    <Input
                      id="secondaryCtaLink"
                      value={heroContent.secondaryCtaLink}
                      onChange={(e) => updateHeroContent({ secondaryCtaLink: e.target.value })}
                      placeholder="https://wa.me/97512345678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visuals & Video Tab */}
          <TabsContent value="visuals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Background</CardTitle>
                <CardDescription>
                  Add a professional video background from your Cloudinary media library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <Label htmlFor="enableVideo">Enable Video Background</Label>
                    <p className="text-sm text-muted-foreground">
                      Display video instead of gradient background
                    </p>
                  </div>
                  <Switch
                    id="enableVideo"
                    checked={heroContent.enableVideoBackground}
                    onCheckedChange={(checked) => updateHeroContent({ enableVideoBackground: checked })}
                  />
                </div>

                {heroContent.enableVideoBackground && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="videoId">Video Cloudinary ID</Label>
                      <Input
                        id="videoId"
                        value={heroContent.videoCloudinaryId}
                        onChange={(e) => updateHeroContent({ videoCloudinaryId: e.target.value })}
                        placeholder="rancelab-showcase"
                      />
                      <p className="text-xs text-muted-foreground">
                        Example: "rancelab-showcase" for videos/uploaded/rancelab-showcase.mp4
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="posterId">Video Poster Image ID</Label>
                      <Input
                        id="posterId"
                        value={heroContent.videoPosterImageId}
                        onChange={(e) => updateHeroContent({ videoPosterImageId: e.target.value })}
                        placeholder="hero-poster"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fallback image while video loads
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gradient & Overlay Settings</CardTitle>
                <CardDescription>
                  Customize colors and overlay opacity for video fallback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradientFrom">Gradient From Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="gradientFrom"
                        type="color"
                        value={heroContent.gradientFrom}
                        onChange={(e) => updateHeroContent({ gradientFrom: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={heroContent.gradientFrom}
                        onChange={(e) => updateHeroContent({ gradientFrom: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradientTo">Gradient To Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="gradientTo"
                        type="color"
                        value={heroContent.gradientTo}
                        onChange={(e) => updateHeroContent({ gradientTo: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={heroContent.gradientTo}
                        onChange={(e) => updateHeroContent({ gradientTo: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overlayOpacity">
                    Overlay Opacity: {Math.round(heroContent.overlayOpacity * 100)}%
                  </Label>
                  <Slider
                    id="overlayOpacity"
                    value={[heroContent.overlayOpacity]}
                    onValueChange={([value]) => updateHeroContent({ overlayOpacity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher opacity makes text more readable over video
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trust Indicators Tab */}
          <TabsContent value="trust" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Social Proof Settings</CardTitle>
                <CardDescription>
                  Display trust indicators to build credibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <Label htmlFor="showTrust">Show Trust Indicators</Label>
                    <p className="text-sm text-muted-foreground">
                      Display client count and business stats
                    </p>
                  </div>
                  <Switch
                    id="showTrust"
                    checked={heroContent.showTrustIndicators}
                    onCheckedChange={(checked) => updateHeroContent({ showTrustIndicators: checked })}
                  />
                </div>

                {heroContent.showTrustIndicators && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientCount">Client Count</Label>
                        <Input
                          id="clientCount"
                          type="number"
                          value={heroContent.clientCount}
                          onChange={(e) => updateHeroContent({ clientCount: parseInt(e.target.value) || 0 })}
                          placeholder="350"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yearsInBusiness">Years in Business</Label>
                        <Input
                          id="yearsInBusiness"
                          type="number"
                          value={heroContent.yearsInBusiness}
                          onChange={(e) => updateHeroContent({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Preview
                      </div>
                      <div className="text-2xl font-bold">
                        {heroContent.clientCount}+ Clients
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {heroContent.yearsInBusiness}+ Years in Business
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
                <CardDescription>
                  Highlight your ready-to-use products in the hero section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={addFeaturedProduct}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  Add Featured Product
                </Button>

                {heroContent.featuredProducts.map((product, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Product {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFeaturedProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Product Name</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => updateFeaturedProduct(index, { name: e.target.value })}
                          placeholder="POS Systems"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={product.description}
                          onChange={(e) => updateFeaturedProduct(index, { description: e.target.value })}
                          placeholder="Complete retail management"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Icon (emoji)</Label>
                          <Input
                            value={product.icon}
                            onChange={(e) => updateFeaturedProduct(index, { icon: e.target.value })}
                            placeholder="🛒"
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Link URL (optional)</Label>
                          <Input
                            value={product.url || ""}
                            onChange={(e) => updateFeaturedProduct(index, { url: e.target.value })}
                            placeholder="/services#pos"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your hero content will appear to visitors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div
                className="p-8 text-center space-y-4"
                style={{
                  background: `linear-gradient(to bottom, ${heroContent.gradientFrom}, ${heroContent.gradientTo})`,
                  position: 'relative'
                }}
              >
                {heroContent.showTrustIndicators && (
                  <div className="flex justify-center gap-6 text-sm text-white/80 mb-4">
                    <span>{heroContent.clientCount}+ Clients</span>
                    <span>{heroContent.yearsInBusiness}+ Years</span>
                  </div>
                )}

                <h1 className="text-4xl font-bold text-white">{heroContent.headline}</h1>
                <h2 className="text-2xl text-white/90">{heroContent.subheadline}</h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">{heroContent.description}</p>

                <div className="flex gap-4 justify-center mt-6">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    {heroContent.primaryCtaText}
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                    {heroContent.secondaryCtaText}
                  </Button>
                </div>

                {heroContent.featuredProducts.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-white/20">
                    <h3 className="text-white font-semibold mb-4">Our Products</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {heroContent.featuredProducts.map((product, index) => (
                        <div key={index} className="bg-white/10 p-3 rounded-lg">
                          <div className="text-2xl mb-1">{product.icon}</div>
                          <div className="text-white text-sm font-medium">{product.name}</div>
                          <div className="text-white/70 text-xs">{product.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}