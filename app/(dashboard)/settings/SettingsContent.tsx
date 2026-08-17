'use client';

import React from 'react';
import { Settings, User, Database, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/useAuthStore';
import { DataSourceConfig } from '@/lib/config/dataSource';

export default function SettingsContent() {
  const { user, role, setRole } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Platform Settings & Configuration</h1>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> User Profile & Session Metadata
          </CardTitle>
          <CardDescription>Manage corporate email and authentication perspective</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <Input value={user?.name || ''} readOnly className="bg-slate-50" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Corporate Email</label>
              <Input value={user?.email || ''} readOnly className="bg-slate-50" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Development Role Preview (UI/UX Testing Only)
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              This switcher previews role-restricted views during development. In production, authorization roles are assigned strictly by the backend authentication service.
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant={role === 'OPERATIONS_MANAGER' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRole('OPERATIONS_MANAGER')}
              >
                Operations Manager Preview
              </Button>
              <Button
                variant={role === 'CSCO_EXECUTIVE' ? 'ai' : 'outline'}
                size="sm"
                onClick={() => setRole('CSCO_EXECUTIVE')}
              >
                CSCO Executive Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source & Service Provider Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" /> Service Provider & Data Source Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Active Data Source Mode</label>
              <Input value={DataSourceConfig.current.toUpperCase()} readOnly className="bg-slate-50 font-mono font-bold text-indigo-600" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">FastAPI Backend Endpoint Target</label>
              <Input value={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} readOnly className="bg-slate-50 font-mono" />
            </div>
          </div>
          <p className="text-slate-500">
            Set environment variable <code className="bg-slate-100 px-1 rounded font-mono">NEXT_PUBLIC_DATA_SOURCE=mock</code> for isolated development mode, or <code className="bg-slate-100 px-1 rounded font-mono">NEXT_PUBLIC_DATA_SOURCE=api</code> for live FastAPI REST integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
