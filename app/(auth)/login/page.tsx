'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('alex.vance@supplysense.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRoleState] = useState<UserRole>('OPERATIONS_MANAGER');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, role);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-ai-glow mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
            SUPPLY<span className="text-indigo-400">SENSE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Supply Chain Intelligence Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Corporate Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              icon={<Mail className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Role Selection Scope */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Initial Role Scope</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setRoleState('OPERATIONS_MANAGER')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  role === 'OPERATIONS_MANAGER'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ops Manager
              </button>
              <button
                type="button"
                onClick={() => setRoleState('CSCO_EXECUTIVE')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  role === 'CSCO_EXECUTIVE'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                CSCO Exec
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-950 text-indigo-600" />
              <span>Remember session</span>
            </label>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="ai"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-ai-glow"
          >
            Sign In to Command Center
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
          <span>Protected by 256-bit Enterprise Encryption</span>
        </div>
      </div>
    </div>
  );
}
