import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MasterAdminLoginPage = () => {
  const { user, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Initializing Zenora Platform Console...</div>;
  if (user?.role === 'PLATFORM_OWNER') return <Navigate to="/master-admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const nextUser = await login(email, password, '');
      if (nextUser?.role !== 'PLATFORM_OWNER') {
        await logout();
        throw new Error('This login is reserved for the Zenora Master Admin account.');
      }
      navigate('/master-admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Master admin authentication failed.');
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-lg"><ShieldCheck className="w-6 h-6" /></div>
        <h1 className="mt-4 text-xl font-bold tracking-tight">ZENORA Platform Console</h1>
        <p className="text-xs text-slate-400 mt-1">Master administrator access</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl space-y-4">
        {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        <div><label className="block text-xs font-semibold mb-1">Master Admin Email</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" placeholder="admin@zenora.example" /></div></div>
        <div><label className="block text-xs font-semibold mb-1">Password</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-slate-900" /></div></div>
        <button disabled={loading} className="w-full py-2.5 bg-slate-950 text-white rounded-lg font-semibold text-xs disabled:opacity-50">{loading ? 'Authenticating...' : 'Enter Platform Console'}</button>
        <button type="button" onClick={() => navigate('/login')} className="w-full text-xs text-slate-500 hover:text-slate-900">Company / Employee sign in →</button>
      </form>
      <p className="text-center text-[10px] text-slate-500 mt-5">Platform Owner · Company metadata · Helpdesk · Reset requests</p>
    </div>
  </div>;
};
