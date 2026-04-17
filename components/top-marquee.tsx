"use client";

import { useEffect, useState } from "react";
import { Zap, Shield, Clock, Award, TrendingUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface MarqueeData {
  enabled: boolean;
  text: string;
  icon: string;
  speed?: number;
}

const iconMap: Record<string, any> = {
  zap: Zap,
  shield: Shield,
  clock: Clock,
  award: Award,
  trending: TrendingUp,
};

export function TopMarquee() {
  const [marqueeData, setMarqueeData] = useState<MarqueeData | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch marquee settings from database
    const fetchMarqueeSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'top_marquee')
        .single();

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          setMarqueeData(parsed);
          setIsVisible(parsed.enabled ?? true);
        } catch (e) {
          // Default fallback - hidden by default
          setMarqueeData({
            enabled: false,
            text: "🚀 Innovate Bhutan - Your Trusted Technology Partner | POS Systems | Hotel PMS | Security AI | Web Development | 24/7 Support",
            icon: "zap",
          });
        }
      } else {
        // Default settings - hidden by default
        setMarqueeData({
          enabled: false,
          text: "🚀 Innovate Bhutan - Your Trusted Technology Partner | POS Systems | Hotel PMS | Security AI | Web Development | 24/7 Support",
          icon: "zap",
        });
      }
    };

    fetchMarqueeSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('settings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'settings',
        filter: 'key=eq.top_marquee'
      }, (payload) => {
        if (payload.new?.value) {
          try {
            const parsed = JSON.parse(payload.new.value);
            setMarqueeData(parsed);
            setIsVisible(parsed.enabled ?? true);
          } catch (e) {
            console.error('Error parsing marquee settings:', e);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!marqueeData?.enabled || !isVisible) return null;

  const IconComponent = iconMap[marqueeData.icon || "zap"] || Zap;
  const speed = marqueeData.speed || 30;

  return (
    <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-emerald-400/10 animate-pulse" />

      {/* Glowing top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

      <div className="relative max-w-full mx-auto py-2.5 overflow-hidden">
        <div
          className="flex items-center whitespace-nowrap animate-marquee"
          style={{
            animationDuration: `${speed}s`,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 mx-8">
              <IconComponent className="w-4 h-4 text-white drop-shadow-lg" />
              <span className="text-sm font-semibold text-white drop-shadow-md tracking-wide">
                {marqueeData.text}
              </span>
              <div className="w-1 h-1 rounded-full bg-white/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
