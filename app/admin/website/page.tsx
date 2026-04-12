"use client";

import { useState, useEffect } from "react";
import { Globe, Edit2, RefreshCw, Eye, Save, Zap, Plus, X, ArrowRight, Trash2, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface PageContent {
  id?: string;
  page: string;
  section: string;
  key: string;
  value: string;
}

interface Service {
  id?: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  active: boolean;
}

interface Brand {
  id?: string;
  name: string;
  logo: string;
  category: string;
  active: boolean;
}

export default function WebsitePage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, servicesRes, brandsRes] = await Promise.all([
        supabase.from('website_content').select('*'),
        supabase.from('services').select('*'),
        supabase.from('brands').select('*')
      ]);
      setPages(contentRes.data || []);
      setServices(servicesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (page: string, section: string, key: string, defaultValue: string = '') => {
    const item = pages.find(p => p.page === page && p.section === section && p.key === key);
    return item?.value || defaultValue;
  };

  const updateContent = async (page: string, section: string, key: string, value: string) => {
    setSaving(true);
    try {
      await supabase.from('website_content').upsert({
        page, section, key, value
      }, { onConflict: 'page,section,key' });
      
      setPages(prev => {
        const existing = prev.find(p => p.page === page && p.section === section && p.key === key);
        if (existing) {
          return prev.map(p => p.page === page && p.section === section && p.key === key ? { ...p, value } : p);
        }
        return [...prev, { page, section, key, value }];
      });
      toast.success("Saved");
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleService = async (id: string, active: boolean) => {
    await supabase.from('services').update({ active }).eq('id', id);
    setServices(prev => prev.map(s => s.id === id ? { ...s, active } : s));
  };

  const toggleBrand = async (id: string, active: boolean) => {
    await supabase.from('brands').update({ active }).eq('id', id);
    setBrands(prev => prev.map(b => b.id === id ? { ...b, active } : b));
  };

  const handleAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.response) {
        toast.success("AI: " + data.response.substring(0, 150) + "...");
      }
    } catch (err) {
      toast.error("AI failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await supabase.from('settings').upsert({ key: 'website_published', value: new Date().toISOString() });
      toast.success("Website published!");
    } catch (err) {
      toast.error("Publish failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Website CMS</h1>
          <p className="text-sm text-[#717171]">Complete control over your public website</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E5E5E1]" onClick={() => window.open('/', '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            View Live
          </Button>
          <Button onClick={handlePublish} disabled={saving} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
            <Globe className="w-4 h-4 mr-2" />
            {saving ? 'Publishing...' : 'Publish Site'}
          </Button>
        </div>
      </div>

      {/* AI Content Helper */}
      <Card className="border-[#3ECF8E]/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[#3ECF8E]" />
            <Input 
              placeholder="Ask AI to write content, generate descriptions, improve text..." 
              className="flex-1 bg-[#F3F3F1] border-[#E5E5E1]"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button onClick={handleAI} disabled={aiLoading} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
              {aiLoading ? 'Thinking...' : 'Generate'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-[#E5E5E1]">
          <TabsTrigger value="home">Home / Hero</TabsTrigger>
          <TabsTrigger value="landing">Landing Pages</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* HOME PAGE */}
        <TabsContent value="home" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Hero Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Hero Title</label>
                  <Input 
                    value={getContent('home', 'hero', 'title', 'Innovate Bhutan')}
                    onChange={(e) => updateContent('home', 'hero', 'title', e.target.value)}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Hero Subtitle</label>
                  <Input 
                    value={getContent('home', 'hero', 'subtitle', 'IT Solutions for Bhutan')}
                    onChange={(e) => updateContent('home', 'hero', 'subtitle', e.target.value)}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Hero Description</label>
                <textarea 
                  className="w-full h-20 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  value={getContent('home', 'hero', 'description', 'For over 15 years, we\'ve linked enterprises with high-performance IT solutions across Bhutan.')}
                  onChange={(e) => updateContent('home', 'hero', 'description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">CTA Button Text</label>
                <Input 
                  value={getContent('home', 'hero', 'cta', 'Get Started')}
                  onChange={(e) => updateContent('home', 'hero', 'cta', e.target.value)}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Stats Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Stat 1 Label</label>
                  <Input value={getContent('home', 'stats', 'stat1_label', '500+')} onChange={(e) => updateContent('home', 'stats', 'stat1_label', e.target.value)} className="bg-[#F3F3F1] border-[#E5E5E1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Stat 1 Sub</label>
                  <Input value={getContent('home', 'stats', 'stat1_sub', 'Enterprises')} onChange={(e) => updateContent('home', 'stats', 'stat1_sub', e.target.value)} className="bg-[#F3F3F1] border-[#E5E5E1]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Stat 2 Label</label>
                  <Input value={getContent('home', 'stats', 'stat2_label', '20/20')} onChange={(e) => updateContent('home', 'stats', 'stat2_label', e.target.value)} className="bg-[#F3F3F1] border-[#E5E5E1]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LANDING PAGES */}
        <TabsContent value="landing" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Campaign Landing Pages</CardTitle>
              <Button size="sm" className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={createLandingPage}>
                <Plus className="w-4 h-4 mr-1" /> New Page
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[#717171] mb-4">
                Create custom landing pages for campaigns. Share the URL to capture leads directly into your ERP.
              </p>
              
              {landingPages.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-10 h-10 mx-auto text-[#A3A3A3] mb-2" />
                  <p className="text-sm text-[#717171]">No landing pages yet</p>
                  <Button className="mt-2 bg-[#3ECF8E] text-white" onClick={createLandingPage}>
                    Create your first page
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {landingPages.map((page: any) => (
                    <div key={page.id} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{page.name}</p>
                        <p className="text-xs text-[#717171]">/{page.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => copyLink(page.slug)}>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteLandingPage(page.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COMPANY PAGE */}
        <TabsContent value="company" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">About Section</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Mission Statement</label>
                <textarea 
                  className="w-full h-24 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  value={getContent('company', 'about', 'mission', 'To link Bhutan\'s premier enterprises with high-performance talent, architecting operational flows that define the modern kingdom.')}
                  onChange={(e) => updateContent('company', 'about', 'mission', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Vision Statement</label>
                <textarea 
                  className="w-full h-24 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  value={getContent('company', 'about', 'vision', 'To be the primary node for Bhutan\'s technological legacy—bridging global innovation with deep-rooted kingdom logic.')}
                  onChange={(e) => updateContent('company', 'about', 'vision', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Timeline Events</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[2009, 2012, 2015, 2018, 2020, 2024].map((year, i) => (
                  <div key={year} className="flex items-center gap-4 p-2 bg-[#F3F3F1] rounded">
                    <span className="font-mono text-sm w-12">{year}</span>
                    <Input 
                      value={getContent('company', 'timeline', `event${i}`, '')}
                      onChange={(e) => updateContent('company', 'timeline', `event${i}`, e.target.value)}
                      placeholder="Event title..."
                      className="bg-white border-[#E5E5E1]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERVICES */}
        <TabsContent value="services" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Service Catalog</CardTitle>
              <Button size="sm" className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
                <Plus className="w-4 h-4 mr-1" /> Add Service
              </Button>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <p className="text-sm text-[#717171] text-center py-8">No services yet. Add from Services page.</p>
              ) : (
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-[#3ECF8E]" />
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-[#717171]">{service.description?.substring(0, 50)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-100 text-green-700" : ""}>
                          {service.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => toggleService(service.id!, !service.active)}>
                          {service.active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDS */}
        <TabsContent value="brands" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Partner Brands</CardTitle>
              <Button size="sm" className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
                <Plus className="w-4 h-4 mr-1" /> Add Brand
              </Button>
            </CardHeader>
            <CardContent>
              {brands.length === 0 ? (
                <p className="text-sm text-[#717171] text-center py-8">No brands yet. Add from Brands page.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {brands.map(brand => (
                    <div key={brand.id} className={`p-4 rounded-lg border ${brand.active ? 'bg-green-50 border-green-200' : 'bg-[#F3F3F1] border-[#E5E5E1]'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{brand.name}</span>
                        <Badge variant="outline" className="text-[10px]">{brand.category}</Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="w-full text-xs" onClick={() => toggleBrand(brand.id!, !brand.active)}>
                        {brand.active ? 'Active' : 'Inactive'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPORT */}
        <TabsContent value="support" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Support Page Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Page Title</label>
                <Input 
                  value={getContent('support', 'main', 'title', 'Technical Support Center')}
                  onChange={(e) => updateContent('support', 'main', 'title', e.target.value)}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Description</label>
                <textarea 
                  className="w-full h-20 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  value={getContent('support', 'main', 'description', 'Get expert technical support for all your IT needs.')}
                  onChange={(e) => updateContent('support', 'main', 'description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Email</label>
                  <Input 
                    value={getContent('contact', 'info', 'email', 'info@innovate.bt')}
                    onChange={(e) => updateContent('contact', 'info', 'email', e.target.value)}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Phone</label>
                  <Input 
                    value={getContent('contact', 'info', 'phone', '+975 17268753')}
                    onChange={(e) => updateContent('contact', 'info', 'phone', e.target.value)}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Address</label>
                <Input 
                  value={getContent('contact', 'info', 'address', 'Thimphu, Bhutan')}
                  onChange={(e) => updateContent('contact', 'info', 'address', e.target.value)}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">WhatsApp Link</label>
                <Input 
                  value={getContent('contact', 'info', 'whatsapp', 'https://wa.me/97517268753')}
                  onChange={(e) => updateContent('contact', 'info', 'whatsapp', e.target.value)}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}