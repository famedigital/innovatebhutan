"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, Zap, Users, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginAs, setLoginAs] = useState<"admin" | "client">("admin");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/admin");
      }
    };
    checkUser();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (loginAs === "client") {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/client`,
            },
          });

          if (error) {
            toast.error("Registration Failed", { description: error.message });
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from("client_portal_access").insert({
              user_id: user.id,
              email: user.email,
              client_id: null,
              role: "client"
            });
          }

          toast.success("Account Created", {
            description: "Please check your email to verify your account.",
          });
          setIsSignUp(false);
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/admin`,
            },
          });

          if (error) {
            toast.error("Registration Failed", { description: error.message });
            return;
          }

          toast.success("Account Created", {
            description: "Please check your email to verify your account.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Authentication Failed", { description: error.message });
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        
        if (loginAs === "client") {
          const { data: clientAccess } = await supabase
            .from("client_portal_access")
            .select("*")
            .eq("email", user?.email)
            .single();

          if (!clientAccess) {
            toast.error("Access Denied", { description: "You don't have client portal access" });
            await supabase.auth.signOut();
            return;
          }

          toast.success("Welcome back!", { description: "Accessing Client Portal." });
          router.push("/client");
        } else {
          toast.success("Welcome back!", { description: "Access granted to ERP Command Center." });
          router.push("/admin");
        }
        router.refresh();
      }
    } catch (err) {
      toast.error("System Error", { description: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(62,207,142,0.08),transparent_70%)] pointer-events-none" />

      <Card className="w-full max-w-md bg-white border-[#E5E5E1] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#3ECF8E] to-transparent" />
        
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#3ECF8E]/10 border border-[#3ECF8E]/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-[#3ECF8E]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-[#717171]">
            {isSignUp 
              ? "Register to access the ERP infrastructure." 
              : "Enter your credentials to access the ERP."}
          </CardDescription>
        </CardHeader>

        {/* Login Type Toggle */}
        <div className="px-6 pb-4">
          <div className="flex bg-[#F3F3F1] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginAs("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                loginAs === "admin" 
                  ? "bg-white text-black shadow-sm" 
                  : "text-[#717171]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginAs("client")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                loginAs === "client" 
                  ? "bg-white text-black shadow-sm" 
                  : "text-[#717171]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Client Portal
            </button>
          </div>
        </div>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#717171] text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={loginAs === "client" ? "your@company.bt" : "admin@innovates.bt"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-[#E5E5E1] bg-[#FAFAFA] text-[#1A1A1A] placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 transition-all h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#717171] text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-[#E5E5E1] bg-[#FAFAFA] text-[#1A1A1A] placeholder:text-[#A3A3A3] focus:border-[#3ECF8E] focus:ring-[#3ECF8E]/20 transition-all h-10"
              />
            </div>

            {loginAs === "client" && !isSignUp && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                <p className="text-xs text-blue-700">
                  🔐 Client Portal: Access your invoices, AMC contracts, and support tickets.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3ECF8E] hover:bg-[#32e612] text-black font-semibold h-10 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-medium text-[#717171] hover:text-[#3ECF8E] transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
            </button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="absolute bottom-6 text-[10px] font-medium text-[#A3A3A3] tracking-wider">
        INNOVATES BHUTAN ERP © 2026
      </p>
    </div>
  );
}