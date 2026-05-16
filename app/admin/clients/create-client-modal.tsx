"use client";

import * as React from "react";
import { Loader2, Building2, User, Mail, Phone, MessageSquare, MapPin, Globe, Image } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Zod schema for validation
const clientFormSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: "Client name must be between 2 and 100 characters",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  phone: {
    pattern: /^[+]?[\d\s\-()]+$/,
    message: "Please enter a valid phone number",
  },
};

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: ClientData) => void;
}

export interface ClientData {
  id?: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  active?: boolean;
}

interface FormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  logoUrl: string;
}

export function CreateClientModal({ open, onOpenChange, onClientCreated }: CreateClientModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    country: "Bhutan",
    logoUrl: "",
  });

  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});

  const validateField = (name: keyof FormData, value: string): string | null => {
    if (name === "name") {
      if (!value.trim()) return "Client name is required";
      if (value.length < 2) return "Name must be at least 2 characters";
      if (value.length > 100) return "Name must not exceed 100 characters";
    }

    if (name === "email" && value) {
      if (!clientFormSchema.email.pattern.test(value)) {
        return clientFormSchema.email.message;
      }
    }

    if (name === "phone" && value) {
      if (!clientFormSchema.phone.pattern.test(value)) {
        return clientFormSchema.phone.message;
      }
    }

    return null;
  };

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (name: keyof FormData, value: string) => {
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validate required fields
    const nameError = validateField("name", formData.name);
    if (nameError) newErrors.name = nameError;

    // Validate optional fields if provided
    if (formData.email) {
      const emailError = validateField("email", formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (formData.phone) {
      const phoneError = validateField("phone", formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        active: true,
      };

      // Add optional fields only if provided
      if (formData.contactPerson.trim()) payload.contactPerson = formData.contactPerson.trim();
      if (formData.email.trim()) payload.email = formData.email.trim();
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      if (formData.whatsapp.trim()) payload.whatsapp = formData.whatsapp.trim();
      if (formData.address.trim()) payload.address = formData.address.trim();
      if (formData.city.trim()) payload.city = formData.city.trim();
      if (formData.country.trim()) payload.country = formData.country.trim();
      if (formData.logoUrl.trim()) payload.logoUrl = formData.logoUrl.trim();

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Client created successfully");
        onClientCreated?.(result.data);
        handleClose();
      } else {
        toast.error(result.error || "Failed to create client");
      }
    } catch (err) {
      console.error("Create client error:", err);
      toast.error("Failed to create client. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      whatsapp: "",
      address: "",
      city: "",
      country: "Bhutan",
      logoUrl: "",
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl rounded-xl p-0">
        <DialogHeader className="p-6 pb-4 border-b border-[#E5E5E1]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#3ECF8E]/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#3ECF8E]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-[#1A1A1A]">Create New Client</DialogTitle>
              <DialogDescription className="text-sm text-[#717171] mt-1">
                Add a new client to your organization
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">Basic Information</h3>

            {/* Client Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[#1A1A1A]">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <Input
                  id="name"
                  placeholder="Enter client name"
                  className={`pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 ${errors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={(e) => handleBlur("name", e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium text-[#1A1A1A]">
                Contact Person
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                <Input
                  id="contactPerson"
                  placeholder="Primary contact person"
                  className="pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="client@example.com"
                    className={`pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={(e) => handleBlur("email", e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-[#1A1A1A]">
                  Phone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+975 17 123 456"
                    className={`pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 ${errors.phone ? 'border-red-500' : ''}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                    disabled={loading}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium text-[#1A1A1A]">
                  WhatsApp
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+975 17 123 456"
                    className="pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium text-[#1A1A1A]">
                  Logo URL
                </Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    className="pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20"
                    value={formData.logoUrl}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wide">Address Information</h3>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-[#1A1A1A]">
                Address
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#717171]" />
                <Textarea
                  id="address"
                  placeholder="Street address, building, floor, etc."
                  className="pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 min-h-[80px] resize-none"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-[#1A1A1A]">
                  City
                </Label>
                <Input
                  id="city"
                  placeholder="Thimphu"
                  className="bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-[#1A1A1A]">
                  Country
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
                  <Input
                    id="country"
                    placeholder="Bhutan"
                    className="pl-10 bg-[#F3F3F1] border-[#E5E5E1] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="p-6 border-t border-[#E5E5E1] gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-[#E5E5E1] hover:bg-[#F3F3F1]"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="client-form"
            className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Client"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
