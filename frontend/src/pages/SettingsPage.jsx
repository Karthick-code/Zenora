import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Globe, Copy, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const SettingsPage = () => {
    const { user } = useAuth();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [form, setForm] = useState({
        name: '',
        legalName: '',
        industry: '',
        companySize: '',
        address: '',
        timezone: 'America/Los_Angeles',
        currency: 'USD',
        workweekDays: 'MON,TUE,WED,THU,FRI',
        customDomain: ''
    });
    useEffect(() => {
        async function loadOrg() {
            try {
                const res = await api.get('/organizations/current');
                if (res.data.success) {
                    const o = res.data.organization;
                    setOrg(o);
                    setForm({
                        name: o.name || '',
                        legalName: o.legal_name || '',
                        industry: o.industry || '',
                        companySize: o.company_size || '',
                        address: o.address || '',
                        timezone: o.timezone || 'UTC',
                        currency: o.currency || 'USD',
                        workweekDays: o.workweek_days || 'MON,TUE,WED,THU,FRI',
                        customDomain: o.custom_domain || ''
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        loadOrg();
    }, [user]);
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            const res = await api.put('/organizations/current', form);
            if (res.data.success) {
                setFeedback({ type: 'success', text: 'Organization settings updated successfully.' });
                setOrg(res.data.organization);
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to save settings.' });
        }
        finally {
            setSaving(false);
        }
    };
    const isOwnerOrAdmin = ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN'].includes(user?.role || '');
    if (user?.role === 'PLATFORM_OWNER') {
        return (_jsxs("div", { className: "space-y-6 max-w-4xl", children: [_jsx("div", { children: [_jsx("h1", { className: "text-xl font-bold text-slate-900", children: "Zenora Platform Settings" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Platform-level configuration. Company workforce settings remain isolated inside each company workspace." })] }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-slate-900", children: "Tenant architecture" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Each registered company receives its own Zenora workspace and isolated workforce data." })] }), _jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [_jsxs("div", { className: "p-3 bg-slate-50 rounded-lg", children: [_jsx("span", { className: "text-[10px] text-slate-400 uppercase", children: "Platform domain" }), _jsx("div", { className: "font-mono text-sm mt-1", children: "zenora.com" })] }), _jsxs("div", { className: "p-3 bg-slate-50 rounded-lg", children: [_jsx("span", { className: "text-[10px] text-slate-400 uppercase", children: "Admin data scope" }), _jsx("div", { className: "text-sm mt-1 font-semibold", children: "Companies + Helpdesk only" })] })] })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6 max-w-4xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Organization Settings" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Configure corporate workforce metadata, timezones, default currency, and operational workweeks." })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsx("div", { className: "bg-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-emerald-300 text-[11px] font-bold uppercase tracking-wider", children: [_jsx(Globe, { className: "w-4 h-4" }), " Your Zenora workspace"] }), _jsx("div", { className: "text-lg font-bold mt-2 break-all", children: org?.tenant_url || (org ? `https://${org.slug}.zenora.com` : 'Loading...') }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Each company has an isolated workspace URL based on its company slug." })] }), org?.tenant_url && _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { type: "button", onClick: () => navigator.clipboard?.writeText(org.tenant_url), className: "px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5", children: [_jsx(Copy, { className: "w-3.5 h-3.5" }), " Copy"] }), _jsxs("a", { href: org.tenant_url, target: "_blank", rel: "noreferrer", className: "px-3 py-2 rounded-lg bg-white text-slate-950 text-xs font-semibold flex items-center gap-1.5", children: [_jsx(ExternalLink, { className: "w-3.5 h-3.5" }), " Open"] })] })] }) }), _jsxs("form", { onSubmit: handleSave, className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: [_jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Company Display Name *" }), _jsx("input", { type: "text", required: true, disabled: !isOwnerOrAdmin, value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Legal Entity Name" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.legalName, onChange: e => setForm({ ...form, legalName: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Industry Sector" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.industry, onChange: e => setForm({ ...form, industry: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Company Workforce Size" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.companySize, onChange: e => setForm({ ...form, companySize: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Headquarters Address" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.address, onChange: e => setForm({ ...form, address: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsxs("div", { className: "pt-2 border-t border-slate-100", children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Custom Domain (after domain purchase)" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.customDomain, onChange: e => setForm({ ...form, customDomain: e.target.value }), placeholder: "hr.yourcompany.com", className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" }), _jsx("p", { className: "text-[10px] text-slate-400 mt-1", children: "Enter the domain after DNS is configured. Zenora will mark it pending until your deployment verifies it." })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Primary Timezone" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.timezone, onChange: e => setForm({ ...form, timezone: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Currency Code" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.currency, onChange: e => setForm({ ...form, currency: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Workweek Schedule" }), _jsx("input", { type: "text", disabled: !isOwnerOrAdmin, value: form.workweekDays, onChange: e => setForm({ ...form, workweekDays: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] })] })] }), isOwnerOrAdmin && (_jsx("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end", children: _jsxs("button", { type: "submit", disabled: saving, className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50", children: [_jsx(Save, { className: "w-3.5 h-3.5" }), _jsx("span", { children: saving ? 'Saving...' : 'Save Settings' })] }) }))] })] }));
};
