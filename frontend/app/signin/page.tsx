'use client'

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    getProviders().then(setProviders)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      username: email,
      password,
    });

    if (res?.ok) {
      toast({ title: "Success", description: "Signed in!" });
      router.push("/");
    } else {
      toast({
        title: "Invalid credentials",
        description: "Check your email and password",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg backdrop-blur-sm border border-border/50">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground/70 hover:text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <hr className="my-4 w-full max-w-xs border-gray-300" />

{providers &&
  Object.values(providers)
    .filter((provider: any) => provider.id !== 'credentials')
    .map((provider: any) => (
      <div key={provider.name}>
        <button
          onClick={() => signIn(provider.id, { callbackUrl: '/' })}
          className="p-2 bg-red-500 text-white mt-2"
        >
          Sign in with {provider.name}
        </button>
      </div>
    ))}

        <div className="text-center text-sm">
          <a href="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
