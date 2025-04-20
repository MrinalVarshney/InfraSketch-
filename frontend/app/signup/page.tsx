'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.email || !form.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      toast({
        title: 'Signup Failed',
        description: data.message || 'Something went wrong',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Account Created',
      description: 'Redirecting to login...',
    });

    router.push('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-lg p-8 backdrop-blur-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Join the community today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="pl-10 focus-visible:ring-2 transition"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="pl-10 focus-visible:ring-2 transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground/70" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="pl-10 pr-10 focus-visible:ring-2 transition"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-muted-foreground/70 hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
          >
            {loading ? 'Signing Up...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <a href="/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </motion.div>
    </div>
  );
}
