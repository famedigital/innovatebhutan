"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface HeroContent {
  main_heading: string;
  sub_heading: string;
  cta_text: string;
  cta_link: string;
  typewriter_phrases: string[];
}

interface ContentItem {
  id: number;
  page: string;
  section: string;
  contentKey: string;
  value: string;
  type: string;
}

const emptyForm: HeroContent = {
  main_heading: "Bhutan's Tomorrow, Delivered Today",
  sub_heading: "Transform your business with innovative technology solutions",
  cta_text: "Get Free Consultation",
  cta_link: "/contact",
  typewriter_phrases: [
    "your business growth",
    "enterprise success",
    "digital transformation",
    "innovative technology",
  ],
};

export function HeroEditor() {
  const [formData, setFormData] = useState<HeroContent>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/website/content?page=home&section=hero");
      const data = await res.json();

      if (data.success && data.data.length > 0) {
        const contentMap: Record<string, string> = {};
        data.data.forEach((item: ContentItem) => {
          contentMap[item.contentKey] = item.value;
        });

        // Parse typewriter phrases from JSON
        let phrases: string[] = emptyForm.typewriter_phrases;
        if (contentMap.typewriter_phrases) {
          try {
            phrases = JSON.parse(contentMap.typewriter_phrases);
          } catch {
            phrases = contentMap.typewriter_phrases.split("\n").filter(Boolean);
          }
        }

        setFormData({
          main_heading: contentMap.main_heading || emptyForm.main_heading,
          sub_heading: contentMap.sub_heading || emptyForm.sub_heading,
          cta_text: contentMap.cta_text || emptyForm.cta_text,
          cta_link: contentMap.cta_link || emptyForm.cta_link,
          typewriter_phrases: phrases,
        });
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
      toast.error("Failed to fetch hero content");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (field: keyof HeroContent) => {
    setSaving(true);
    try {
      let value = formData[field];
      let type = "text";

      // Convert typewriter_phrases to JSON string
      if (field === "typewriter_phrases" && Array.isArray(value)) {
        value = JSON.stringify(value);
        type = "json";
      }

      const res = await fetch("/api/website/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "home",
          section: "hero",
          content_key: field,
          value,
          type,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`${field.replace(/_/g, " ")} updated successfully`);
      } else {
        toast.error(data.error || "Failed to update content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(formData).map(([key, value]) => {
        let processedValue = value;
        let type = "text";

        if (key === "typewriter_phrases" && Array.isArray(value)) {
          processedValue = JSON.stringify(value);
          type = "json";
        }

        return fetch("/api/website/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: "home",
            section: "hero",
            content_key: key,
            value: processedValue,
            type,
          }),
        });
      });

      await Promise.all(updates);
      toast.success("All hero content updated successfully");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save some content");
    } finally {
      setSaving(false);
    }
  };

  const handleTypewriterPhrasesChange = (value: string) => {
    const phrases = value.split("\n").filter(Boolean);
    setFormData({ ...formData, typewriter_phrases: phrases });
  };

  const getTypewriterPhrasesText = () => {
    return formData.typewriter_phrases.join("\n");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Hero Section Content</h3>
          <p className="text-sm text-muted-foreground">
            Edit the main heading, sub-heading, CTA button, and typewriter phrases
          </p>
        </div>
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
          size="sm"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Preview
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Content</CardTitle>
            <CardDescription>
              Update the hero section text and links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Heading */}
            <div className="space-y-2">
              <label
                htmlFor="main_heading"
                className="text-sm font-medium leading-none"
              >
                Main Heading <span className="text-destructive">*</span>
              </label>
              <Input
                id="main_heading"
                value={formData.main_heading}
                onChange={(e) =>
                  setFormData({ ...formData, main_heading: e.target.value })
                }
                placeholder="Enter main heading"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave("main_heading")}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Sub Heading */}
            <div className="space-y-2">
              <label
                htmlFor="sub_heading"
                className="text-sm font-medium leading-none"
              >
                Sub Heading <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="sub_heading"
                value={formData.sub_heading}
                onChange={(e) =>
                  setFormData({ ...formData, sub_heading: e.target.value })
                }
                placeholder="Enter sub heading"
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave("sub_heading")}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* CTA Text */}
            <div className="space-y-2">
              <label
                htmlFor="cta_text"
                className="text-sm font-medium leading-none"
              >
                CTA Button Text <span className="text-destructive">*</span>
              </label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) =>
                  setFormData({ ...formData, cta_text: e.target.value })
                }
                placeholder="e.g., Get Free Consultation"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave("cta_text")}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* CTA Link */}
            <div className="space-y-2">
              <label
                htmlFor="cta_link"
                className="text-sm font-medium leading-none"
              >
                CTA Link <span className="text-destructive">*</span>
              </label>
              <Input
                id="cta_link"
                value={formData.cta_link}
                onChange={(e) =>
                  setFormData({ ...formData, cta_link: e.target.value })
                }
                placeholder="e.g., /contact"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave("cta_link")}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Typewriter Phrases */}
            <div className="space-y-2">
              <label
                htmlFor="typewriter_phrases"
                className="text-sm font-medium leading-none"
              >
                Typewriter Phrases <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Enter one phrase per line. These will cycle in the typewriter
                effect.
              </p>
              <Textarea
                id="typewriter_phrases"
                value={getTypewriterPhrasesText()}
                onChange={(e) => handleTypewriterPhrasesChange(e.target.value)}
                placeholder="Enter one phrase per line"
                rows={5}
              />
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {formData.typewriter_phrases.length} phrases
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave("typewriter_phrases")}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Save All Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleSaveAll}
                disabled={saving}
                className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save All Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your hero section will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-8 min-h-[400px] flex flex-col justify-center">
                {/* Background pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGM5Ljk0MSAwIDE4LTguMDU5IDE4LTE4cy04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNHMxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9nPjwvc3ZnPg==')]"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  {/* Main Heading */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {formData.main_heading}
                  </h1>

                  {/* Sub Heading with typewriter effect preview */}
                  <div className="text-lg sm:text-xl text-emerald-100 mb-8 min-h-[60px]">
                    {formData.sub_heading}
                  </div>

                  {/* Typewriter Phrases Preview */}
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {formData.typewriter_phrases.slice(0, 4).map((phrase, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-white/10 text-white border-white/20 text-sm"
                      >
                        {phrase}
                      </Badge>
                    ))}
                    {formData.typewriter_phrases.length > 4 && (
                      <Badge
                        variant="outline"
                        className="bg-white/10 text-white border-white/20 text-sm"
                      >
                        +{formData.typewriter_phrases.length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* CTA Button Preview */}
                  <button className="inline-flex items-center px-6 py-3 bg-[#3ECF8E] hover:bg-[#34b27b] text-white font-semibold rounded-lg transition-colors shadow-lg">
                    {formData.cta_text}
                  </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl"></div>
              </div>

              {/* Info badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  Page: home
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Section: hero
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs text-[#3ECF8E] border-[#3ECF8E]"
                >
                  Live preview
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
