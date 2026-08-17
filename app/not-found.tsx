import React from 'react';
import Link from 'next/link';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-ai-glow mb-6">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black tracking-tight text-white font-sans">404</h1>
      <h2 className="text-xl font-bold mt-2">Route Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-8">
        The requested enterprise telemetry page or resource does not exist.
      </p>
      <Link href="/dashboard">
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-ai-glow transition-all">
          <Home className="w-4 h-4" /> Return to Command Center
        </button>
      </Link>
    </div>
  );
}
