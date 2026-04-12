"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface LeadCaptureFormProps {
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  compact?: boolean;
}

export function LeadCaptureForm({ 
  source = 'website', 
  utmSource = '', 
  utmMedium = '', 
  utmCampaign = '',
  compact = false 
}: LeadCaptureFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", service: "", message: "" });
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`text-center ${compact ? 'p-4' : 'p-8'}`}>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
        <p className="text-sm text-gray-600">We've received your inquiry. Our team will contact you within 24 hours.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSuccess(false)}
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-${compact ? '3' : '4'}`}>
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Full Name *</label>
        <Input 
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          required
          className="bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Email</label>
          <Input 
            type="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
            className="bg-gray-50 border-gray-200"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Phone *</label>
          <Input 
            placeholder="+975xxxxxxxx"
            value={form.phone}
            onChange={(e) => setForm({...form, phone: e.target.value})}
            required
            className="bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {!compact && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Interested Service</label>
          <Select value={form.service} onValueChange={(v) => setForm({...form, service: v})}>
            <SelectTrigger className="bg-gray-50 border-gray-200">
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pos_system">POS System</SelectItem>
              <SelectItem value="crm">CRM Software</SelectItem>
              <SelectItem value="web_development">Web Development</SelectItem>
              <SelectItem value="amc">Annual Maintenance</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!compact && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">Message</label>
          <textarea 
            className="w-full h-20 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none"
            placeholder="Tell us about your requirements..."
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        {loading ? 'Sending...' : 'Get Started'}
      </Button>

      <p className="text-[10px] text-gray-500 text-center">
        By submitting, you agree to receive updates from Innovate Bhutan.
      </p>
    </form>
  );
}

export default LeadCaptureForm;