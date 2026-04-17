"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface MarqueeData {
  enabled: boolean;
}

export function TopMarquee() {
  const [isVisible, setIsVisible] = useState(false);

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
          setIsVisible(parsed.enabled ?? false);
        } catch (e) {
          // Default - hidden
          setIsVisible(false);
        }
      } else {
        // Default - hidden
        setIsVisible(false);
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
            setIsVisible(parsed.enabled ?? false);
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

  if (!isVisible) return null;

  return (
    <div className="flex items-center h-8">
      <div className="flex items-center gap-4 px-4 sm:px-6 shrink-0 z-10 bg-[#F1F5F9] dark:bg-black">
        <a href="tel:+97517268753" className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone w-3 h-3" aria-hidden="true">
            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
          </svg>
          <span className="text-[10px] font-mono font-bold">+975 17268753</span>
        </a>
        <span className="hidden sm:flex items-center gap-1 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin w-3 h-3" aria-hidden="true">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="text-[10px] uppercase tracking-widest font-medium text-slate-500">Thimphu Hub</span>
        </span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F1F5F9] dark:from-black to-transparent z-10"></div>
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Expert POS Engineers
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            AI Surveillance Architects
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Biometric Security Specialists
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Hospitality Tech Consultants
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Full-stack Talent
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Network Infrastructure Experts
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Certified Technicians
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Strategic Talent Brokering
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Nationwide Tech Support
          </span>
          {/* Duplicate for seamless loop */}
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Expert POS Engineers
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            AI Surveillance Architects
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Biometric Security Specialists
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Hospitality Tech Consultants
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Full-stack Talent
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Network Infrastructure Experts
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Certified Technicians
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Strategic Talent Brokering
          </span>
          <span className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-3 h-3 text-[#10B981]" aria-hidden="true">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
            Nationwide Tech Support
          </span>
        </div>
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F1F5F9] dark:from-black to-transparent z-10"></div>
      </div>
    </div>
  );
}
