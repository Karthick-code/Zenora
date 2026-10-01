import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PlatformAdminPage } from './PlatformAdminPage';

export const MasterAdminDashboardPage = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Loading platform console...</div>;
  if (!user) return <Navigate to="/master-admin" replace />;
  if (user.role !== 'PLATFORM_OWNER') return <Navigate to="/app" replace />;

  const handleLogout = async () => { await logout(); navigate('/master-admin', { replace: true }); };

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="h-14 bg-slate-950 text-white flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center"><ShieldCheck className="w-4 h-4" /></div><div><div className="text-xs font-bold tracking-wide">ZENORA PLATFORM</div><div className="text-[9px] text-slate-400">Master Administration Console</div></div></div>
      <div className="flex items-center gap-3"><div className="hidden sm:block text-right"><div className="text-xs font-semibold">{user.firstName} {user.lastName}</div><div className="text-[9px] text-slate-400">PLATFORM OWNER · {user.email}</div></div><button onClick={handleLogout} title="Sign out" className="p-2 rounded-lg hover:bg-white/10"><LogOut className="w-4 h-4" /></button></div>
    </header>
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"><PlatformAdminPage /></main>
  </div>;
};
