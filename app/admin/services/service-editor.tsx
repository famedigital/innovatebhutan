"use client";

import { useEffect, useState } from "react";
import { 
  Plus, 
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";

export function ServiceEditor() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error("Service Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={fetchServices} className="border-[#E5E5E1] text-sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full h-48 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#3ECF8E] animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center border border-dashed border-[#E5E5E1] rounded-xl">
            <p className="text-sm text-[#717171]">No services found</p>
            <p className="text-xs text-[#717171] mt-1">Add your first service to get started</p>
          </div>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-[#F3F3F1] text-[#1A1A1A] border-[#E5E5E1] text-xs">
                    {service.category || 'Service'}
                  </Badge>
                </div>
                <h3 className="font-medium text-[#1A1A1A] mb-1">{service.name}</h3>
                <p className="text-xs text-[#717171] line-clamp-2">{service.description || 'No description'}</p>
                <div className="mt-3 pt-3 border-t border-[#E5E5E1] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A1A1A]">Nu. {service.price || 0}</span>
                  <Button variant="ghost" size="sm" className="text-xs h-7">Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}