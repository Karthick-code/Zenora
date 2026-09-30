import React, { useEffect, useState } from 'react';
import { Building, AlertTriangle, CheckCircle2, Headphones, KeyRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PlatformAdminPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('companies');
  const [organizations, setOrganizations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [orgRes, ticketRes, resetRes] = await Promise.all([
        api.get('/ops/platform/organizations'),
        api.get('/ops/platform/helpdesk'),
        api.get('/ops/platform/password-reset-requests')
      ]);
      if (orgRes.data.success) setOrganizations(orgRes.data.organizations);
      if (ticketRes.data.success) setTickets(ticketRes.data.tickets);
      if (resetRes.data.success) setResetRequests(resetRes.data.requests);
    } catch (e) {
      setFeedback({ type: 'error', text: e.response?.data?.message || 'Unable to load platform console.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user?.role === 'PLATFORM_OWNER') load(); }, [user]);

  const toggleOrgStatus = async (orgId, currentStatus) => {
    setActionLoading(true); setFeedback(null);
    try {
      const status = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.put(`/ops/platform/organizations/${orgId}/status`, { status });
      setFeedback({ type: 'success', text: `Company status changed to ${status}.` });
      load();
    } catch (e) { setFeedback({ type: 'error', text: e.response?.data?.message || 'Update failed.' }); }
    finally { setActionLoading(false); }
  };

  if (user?.role !== 'PLATFORM_OWNER') return <div className="p-8 text-center text-xs text-slate-500">Access restricted.</div>;

  return <div className="space-y-6">
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">Zenora Platform Console</h1>
      <p className="text-xs text-slate-500 mt-1">Manage companies and support without exposing company employee records.</p>
    </div>
    {feedback && <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
      {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}{feedback.text}
    </div>}
    <div className="flex gap-2 border-b border-slate-200">
      <button onClick={() => setTab('companies')} className={`px-4 py-2 text-xs font-semibold border-b-2 ${tab==='companies'?'border-slate-900 text-slate-900':'border-transparent text-slate-500'}`}><Building className="inline w-4 h-4 mr-1"/> Companies</button>
      <button onClick={() => setTab('helpdesk')} className={`px-4 py-2 text-xs font-semibold border-b-2 ${tab==='helpdesk'?'border-slate-900 text-slate-900':'border-transparent text-slate-500'}`}><Headphones className="inline w-4 h-4 mr-1"/> Company Helpdesk</button>
      <button onClick={() => setTab('resets')} className={`px-4 py-2 text-xs font-semibold border-b-2 ${tab==='resets'?'border-slate-900 text-slate-900':'border-transparent text-slate-500'}`}><KeyRound className="inline w-4 h-4 mr-1"/> Password Requests</button>
    </div>

    {tab === 'companies' && <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b flex justify-between"><h3 className="text-xs font-bold uppercase tracking-wider">Registered Companies</h3><span className="text-xs text-slate-500">{organizations.length} companies</span></div>
      {loading ? <div className="p-8 text-center text-xs text-slate-500">Loading companies...</div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50"><tr><th className="p-3">Company</th><th className="p-3">Workspace</th><th className="p-3">Industry</th><th className="p-3">Employees</th><th className="p-3">Status</th><th className="p-3"/></tr></thead><tbody className="divide-y">{organizations.map(org => <tr key={org.id}><td className="p-3 font-semibold">{org.name}</td><td className="p-3 font-mono">{org.tenant_domain || org.slug}</td><td className="p-3">{org.industry || '—'}</td><td className="p-3 font-mono">{org.employee_count || 0}</td><td className="p-3">{org.status}</td><td className="p-3 text-right"><button disabled={actionLoading} onClick={() => toggleOrgStatus(org.id, org.status)} className="px-3 py-1 rounded bg-slate-100 font-semibold">{org.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}</button></td></tr>)}</tbody></table></div>}
    </div>}

    {tab === 'helpdesk' && <div className="bg-white rounded-xl border border-slate-200 divide-y">
      <div className="p-4 font-bold text-xs">Company Helpdesk Tickets</div>
      {tickets.length === 0 ? <div className="p-6 text-xs text-slate-500">No company helpdesk tickets.</div> : tickets.map(t => <div key={t.id} className="p-4 flex justify-between gap-4"><div><div className="text-sm font-semibold">{t.subject}</div><div className="text-[11px] text-slate-500">{t.organization_name} · {t.ticket_number} · {t.first_name} {t.last_name}</div><div className="text-xs text-slate-600 mt-1">{t.description}</div></div><span className="text-[10px] font-bold">{t.status}</span></div>)}
    </div>}

    {tab === 'resets' && <div className="bg-white rounded-xl border border-slate-200 divide-y">
      <div className="p-4 font-bold text-xs">Password Reset Requests</div>
      {resetRequests.length === 0 ? <div className="p-6 text-xs text-slate-500">No password reset requests.</div> : resetRequests.map(r => <div key={r.id} className="p-4 flex justify-between gap-4"><div><div className="text-sm font-semibold">{r.organization_name}</div><div className="text-[11px] text-slate-500">{r.first_name} {r.last_name} · {r.email} · Requested as {r.requested_identifier}</div></div><span className="text-[10px] font-bold">{r.status}</span></div>)}
    </div>}
  </div>;
};
