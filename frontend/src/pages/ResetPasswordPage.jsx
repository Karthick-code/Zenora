import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth } from '../services/firebase';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = params.get('oobCode');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!oobCode) return setError('This password reset link is missing or invalid.');
    if (password.length < 8) return setError('Password must contain at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await verifyPasswordResetCode(auth, oobCode);
      await confirmPasswordReset(auth, oobCode, password);
      setMessage('Your password has been changed. You can now sign in.');
    } catch (err) {
      setError('This reset link is invalid, expired, or has already been used.');
    } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
      <div><div className="w-10 h-10 rounded bg-slate-900 text-white flex items-center justify-center font-extrabold">Z</div><h1 className="text-xl font-bold mt-4">Set a new password</h1><p className="text-xs text-slate-500 mt-1">Choose a new password for your Zenora account.</p></div>
      {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs flex gap-2"><AlertCircle className="w-4 h-4"/>{error}</div>}
      {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex gap-2"><CheckCircle2 className="w-4 h-4"/>{message}</div>}
      {!message && <>
        <div><label className="block text-xs font-semibold mb-1">New password</label><div className="relative"><Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400"/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg"/></div></div>
        <div><label className="block text-xs font-semibold mb-1">Confirm password</label><input required type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"/></div>
        <button disabled={loading} className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
      </>}
      {message && <button type="button" onClick={()=>navigate('/login')} className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">Return to Sign In</button>}
    </form>
  </div>;
};
