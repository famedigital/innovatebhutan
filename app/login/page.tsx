"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { InstallAppButton } from "@/components/pwa/install-app-button";

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
    <div className="min-h-svh w-full flex items-center justify-center bg-background px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(10,95,78,0.08),transparent_70%)] pointer-events-none" />

      <Card className="w-full max-w-md bg-card border-border shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {isSignUp 
              ? "Register for Innovates ERP access." 
              : "Staff: use mobile for daily work. Desktop for deep detail."}
          </CardDescription>
        </CardHeader>

        <div className="px-6 pb-3">
          <InstallAppButton fullWidth variant="outline" className="border-primary/30 text-primary hover:bg-primary/5" />
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Install as an app for faster AMC, tickets &amp; client work on your phone.
          </p>
        </div>

        <div className="px-6 pb-4">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginAs("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                loginAs === "admin" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Staff / Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginAs("client")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                loginAs === "client" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Client
            </button>
          </div>
        </div>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground text-xs font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder={loginAs === "client" ? "your@company.bt" : "admin@innovates.bt"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {loginAs === "client" && !isSignUp && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-foreground/80">
                  Client Portal: invoices, AMC contracts, and support tickets.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
            
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Create one"}
            </button>
          </CardFooter>
        </form>
      </Card>
      
      <p className="absolute bottom-4 text-[10px] font-medium text-muted-foreground tracking-wider">
        INNOVATES BHUTAN ERP © 2026
      </p>
    </div>
  );
}
