'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="p-4 rounded-full bg-rose-500/20 text-rose-500 mb-4 border border-rose-500/30">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold">System Runtime Exception</h1>
      <p className="text-xs text-slate-400 max-w-md mt-2 mb-6 font-mono">
        {error.message || 'An unexpected client error occurred inside the SupplySense dashboard framework.'}
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all"
      >
        <RefreshCw className="w-4 h-4" /> Reset Application State
      </button>
    </div>
  );
}
