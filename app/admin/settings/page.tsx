"use client";

import { useState, useEffect } from "react";
import { 
  Key, MessageSquare, Zap, Save, Eye, EyeOff, Database, Globe, Cloud,
  Mail, CreditCard, Phone, FileSpreadsheet, Webhook, Link2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [settings, setSettings] = useState({
    // AI
    geminiApiKey: "",
    openaiApiKey: "",
    
    // WhatsApp & SMS
    whatsappPhoneId: "",
    whatsappToken: "",
    whatsappBusinessId: "",
    twilioSid: "",
    twilioToken: "",
    twilioPhone: "",
    
    // Database
    supabaseUrl: "",
    supabaseAnonKey: "",
    
    // Media
    cloudinaryName: "",
    cloudinaryKey: "",
    cloudinarySecret: "",
    
    // Automation
    makeWebhookUrl: "",
    makeApiKey: "",
    zapierWebhookUrl: "",
    customWebhookUrl: "",
    
    // Payment
    stripeKey: "",
    stripeSecret: "",
    
    // Email
    sendgridKey: "",
    mailgunDomain: "",
    mailgunKey: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    
    // Other
    googleSheetsApiKey: "",
    internalApiKey: "",
  });

  const supabase = createClient();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('settings').select('key, value');
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((s: any) => { map[s.key] = s.value; });
      setSettings({
        geminiApiKey: map.gemini_api_key || "",
        openaiApiKey: map.openai_api_key || "",
        whatsappPhoneId: map.whatsapp_phone_id || "",
        whatsappToken: map.whatsapp_token || "",
        whatsappBusinessId: map.whatsapp_business_id || "",
        twilioSid: map.twilio_sid || "",
        twilioToken: map.twilio_token || "",
        twilioPhone: map.twilio_phone || "",
        supabaseUrl: map.supabase_url || "",
        supabaseAnonKey: map.supabase_anon_key || "",
        cloudinaryName: map.cloudinary_name || "",
        cloudinaryKey: map.cloudinary_key || "",
        cloudinarySecret: map.cloudinary_secret || "",
        makeWebhookUrl: map.make_webhook_url || "",
        makeApiKey: map.make_api_key || "",
        zapierWebhookUrl: map.zapier_webhook_url || "",
        customWebhookUrl: map.custom_webhook_url || "",
        stripeKey: map.stripe_key || "",
        stripeSecret: map.stripe_secret || "",
        sendgridKey: map.sendgrid_key || "",
        mailgunDomain: map.mailgun_domain || "",
        mailgunKey: map.mailgun_key || "",
        smtpHost: map.smtp_host || "",
        smtpPort: map.smtp_port || "",
        smtpUser: map.smtp_user || "",
        smtpPass: map.smtp_pass || "",
        googleSheetsApiKey: map.google_sheets_api_key || "",
        internalApiKey: map.internal_api_key || "",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const entries = Object.entries(settings);
      for (const [key, value] of entries) {
        if (value) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          await supabase.from('settings').upsert({ key: dbKey, value });
        }
      }
      toast.success("All settings saved!");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (key: string) => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));

  const ApiField = ({ label, field, placeholder, icon: Icon }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-medium text-[#717171]">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />}
        <Input 
          type={showKeys[field] ? "text" : "password"}
          placeholder={placeholder}
          className={`pl-9 pr-10 bg-[#F3F3F1] border-[#E5E5E1] ${Icon ? '' : 'pl-3'}`}
          value={(settings as any)[field]}
          onChange={(e) => setSettings({...settings, [field]: e.target.value})}
        />
        <button type="button" onClick={() => toggleShow(field)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717171]">
          {showKeys[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Settings</h1>
          <p className="text-sm text-[#717171]">Configure all API keys and integrations</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save All"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-[#E5E5E1] flex flex-wrap h-auto">
          <TabsTrigger value="ai">AI Engines</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="other">Other APIs</TabsTrigger>
        </TabsList>

        {/* AI Engines */}
        <TabsContent value="ai" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Zap className="w-5 h-5 text-[#3ECF8E]" /> Google Gemini AI</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ApiField label="API Key" field="geminiApiKey" placeholder="AIzaSy..." icon={Key} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Key className="w-5 h-5 text-[#10a37f]" /> OpenAI</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ApiField label="API Key" field="openaiApiKey" placeholder="sk-..." icon={Key} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging */}
        <TabsContent value="messaging" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#25D366]" /> WhatsApp Cloud API</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Phone Number ID" field="whatsappPhoneId" placeholder="1234567890" />
              <ApiField label="Access Token" field="whatsappToken" placeholder="EAAG..." icon={Key} />
              <ApiField label="Business Account ID" field="whatsappBusinessId" placeholder="123456789" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Phone className="w-5 h-5 text-[#F22F46]" /> Twilio (SMS)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Account SID" field="twilioSid" placeholder="ACxxxxx" icon={Key} />
              <ApiField label="Auth Token" field="twilioToken" placeholder="xxxxx" icon={Key} />
              <ApiField label="Phone Number" field="twilioPhone" placeholder="+975xxxxx" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database */}
        <TabsContent value="database" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Database className="w-5 h-5 text-[#3ECF8E]" /> Supabase</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Project URL" field="supabaseUrl" placeholder="https://xxxx.supabase.co" />
              <ApiField label="Anon Key" field="supabaseAnonKey" placeholder="eyJ..." icon={Key} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Cloud className="w-5 h-5 text-[#3448C5]" /> Cloudinary</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Cloud Name" field="cloudinaryName" placeholder="your-cloud" />
              <ApiField label="API Key" field="cloudinaryKey" placeholder="123456789" icon={Key} />
              <ApiField label="API Secret" field="cloudinarySecret" placeholder="xxxxx" icon={Key} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Zap className="w-5 h-5 text-[#FF6B00]" /> Make.com</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Webhook URL" field="makeWebhookUrl" placeholder="https://hook.make.com/xxxxx" />
              <ApiField label="API Key" field="makeApiKey" placeholder="Make API key" icon={Key} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Webhook className="w-5 h-5 text-[#FF4A00]" /> Zapier</CardTitle></CardHeader>
            <CardContent>
              <ApiField label="Webhook URL" field="zapierWebhookUrl" placeholder="https://hooks.zapier.com/xxxxx" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Link2 className="w-5 h-5 text-[#717171]" /> Custom Webhook</CardTitle></CardHeader>
            <CardContent>
              <ApiField label="Webhook URL" field="customWebhookUrl" placeholder="https://your-webhook.com/endpoint" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#635BFF]" /> Stripe</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Publishable Key" field="stripeKey" placeholder="pk_test_..." icon={Key} />
              <ApiField label="Secret Key" field="stripeSecret" placeholder="sk_test_..." icon={Key} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Mail className="w-5 h-5 text-[#1A82E2]" /> SendGrid</CardTitle></CardHeader>
            <CardContent>
              <ApiField label="API Key" field="sendgridKey" placeholder="SG.xxxxx" icon={Key} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Mail className="w-5 h-5 text-[#E15A2F]" /> Mailgun</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="Domain" field="mailgunDomain" placeholder="yourdomain.com" />
              <ApiField label="API Key" field="mailgunKey" placeholder="key-xxxxx" icon={Key} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Mail className="w-5 h-5 text-[#717171]" /> SMTP</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <ApiField label="SMTP Host" field="smtpHost" placeholder="smtp.example.com" />
              <ApiField label="Port" field="smtpPort" placeholder="587" />
              <ApiField label="Username" field="smtpUser" placeholder="user@example.com" />
              <ApiField label="Password" field="smtpPass" placeholder="xxxxx" icon={Key} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other APIs */}
        <TabsContent value="other" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-[#34A853]" /> Google Sheets API</CardTitle></CardHeader>
            <CardContent>
              <ApiField label="API Key" field="googleSheetsApiKey" placeholder="AIzaSy..." icon={Key} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base font-medium flex items-center gap-2"><Key className="w-5 h-5 text-[#717171]" /> Internal API Key</CardTitle></CardHeader>
            <CardContent>
              <ApiField label="Internal API Key" field="internalApiKey" placeholder="Internal key for API access" icon={Key} />
              <div className="p-3 bg-[#F3F3F1] rounded-lg mt-3">
                <p className="text-xs text-[#717171]">Use this key for server-to-server communication</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}