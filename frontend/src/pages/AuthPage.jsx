import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Building2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [companySlug, setCompanySlug] = useState(searchParams.get('company') || '');
  const [password, setPassword] = useState('');
  const [regForm, setRegForm] = useState({
    companyName: '', industry: 'Technology & Software', companySize: '25-100',
    firstName: '', lastName: '', email: '', password: ''
  });

  const clearMessages = () => { setErrorMsg(''); setMessage(''); };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try { await login(identifier, password, companySlug); navigate('/app'); }
    catch (err) { setErrorMsg(err.response?.data?.message || 'Login failed. Check your credentials.'); }
    finally { setLoading(false); }
  };

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try {
      const res = await api.post('/auth/forgot-password', { identifier, companySlug });
      setMessage(res.data.message || 'If the account exists, a reset link has been sent.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Unable to process the password reset request.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); clearMessages();
    try {
      const result = await register(regForm);
      if (result?.tenantUrl) window.location.href = `${result.tenantUrl}/app`;
      else navigate('/app');
    } catch (err) { setErrorMsg(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const inputClass = 'w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900';

  return <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8">
    <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
      <div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-white text-slate-900 flex items-center justify-center font-extrabold">Z</div><div><b>ZENORA</b><span className="text-[10px] text-slate-400 block">Workforce Management Platform</span></div></div>
      <div className="text-xs text-slate-400 hidden sm:block">Everything your workforce needs. One platform.</div>
    </div>

    <div className="max-w-md mx-auto w-full my-8 bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex border-b border-slate-100 text-xs font-semibold">
        <button onClick={() => { setMode('login'); clearMessages(); }} className={`flex-1 py-3.5 ${mode === 'login' || mode === 'forgot' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}>Sign In</button>
        <button onClick={() => { setMode('register'); clearMessages(); }} className={`flex-1 py-3.5 ${mode === 'register' ? 'border-b-2 border-slate-900' : 'text-slate-500'}`}>Create Company</button>
      </div>
      <div className="p-6">
        {errorMsg && <div className="mb-4 p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</div>}
        {message && <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">{message}</div>}

        {mode === 'forgot' ? <form onSubmit={handleForgot} className="space-y-4 text-xs">
          <button type="button" onClick={() => { setMode('login'); clearMessages(); }} className="flex items-center gap-1 text-slate-500 hover:text-slate-900"><ArrowLeft className="w-3 h-3" /> Back to sign in</button>
          <div><h1 className="text-lg font-bold">Forgot password?</h1><p className="text-slate-500 mt-1">Enter your registered email or employee ID. Zenora will send a reset link to the registered email.</p></div>
          <div><label className="block font-semibold mb-1">Email or Employee ID</label><input required value={identifier} onChange={e => setIdentifier(e.target.value)} className={inputClass} /></div>
          <div><label className="block font-semibold mb-1">Company Workspace / Slug</label><input value={companySlug} onChange={e => setCompanySlug(e.target.value)} placeholder="Required when using employee ID" className={inputClass} /></div>
          <button disabled={loading} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form> : mode === 'login' ? <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div><label className="block font-semibold mb-1">Email or Employee ID</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="text" required value={identifier} onChange={e => setIdentifier(e.target.value)} className={`${inputClass} pl-9`} /></div></div>
          <div><label className="block font-semibold mb-1">Company Workspace / Slug</label><div className="relative"><Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={companySlug} onChange={e => setCompanySlug(e.target.value)} placeholder="Required for employee ID login" className={`${inputClass} pl-9`} /></div></div>
          <div><label className="block font-semibold mb-1">Password</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={`${inputClass} pl-9`} /></div></div>
          <div className="text-right"><button type="button" onClick={() => { setMode('forgot'); clearMessages(); }} className="text-slate-600 hover:text-slate-900 font-semibold">Forgot password?</button></div>
          <button disabled={loading} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50">{loading ? 'Authenticating...' : 'Sign In'}</button>
        </form> : <form onSubmit={handleRegister} className="space-y-3 text-xs">
          {['companyName','industry','companySize','firstName','lastName','email','password'].map(field => <div key={field}><label className="block font-semibold mb-1">{field === 'companyName' ? 'Company Name *' : field === 'firstName' ? 'First Name *' : field === 'lastName' ? 'Last Name *' : field === 'email' ? 'Work Email *' : field === 'password' ? 'Master Password *' : field === 'industry' ? 'Industry' : 'Company Size'}</label><input type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'} required={['companyName','firstName','lastName','email','password'].includes(field)} value={regForm[field]} onChange={e => setRegForm({ ...regForm, [field]: e.target.value })} className={inputClass} /></div>)}
          <button disabled={loading} className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50">{loading ? 'Creating Organization...' : 'Create Organization & Get Started'}</button>
        </form>}
      </div>
    </div>
    <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-500 py-2">Zenora Workforce Management SaaS Platform · Multi-Tenant Enterprise Cloud</div>
  </div>;
};
