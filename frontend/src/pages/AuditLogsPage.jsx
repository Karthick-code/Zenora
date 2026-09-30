import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const AuditLogsPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadLogs() {
            try {
                const res = await api.get('/ops/audit-logs');
                if (res.data.success) {
                    setLogs(res.data.logs);
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, [user]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Security Audit Logs" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Immutable compliance record of all workforce mutations, managerial approvals, and payroll locking events." })] }), _jsxs("div", { className: "flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold", children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-emerald-400" }), _jsx("span", { children: "Write-Once Immutable Storage" })] })] }), _jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Timestamp (UTC)" }), _jsx("th", { className: "py-3 px-4", children: "Actor" }), _jsx("th", { className: "py-3 px-4", children: "Action" }), _jsx("th", { className: "py-3 px-4", children: "Entity Type" }), _jsx("th", { className: "py-3 px-4", children: "Entity Identifier" }), _jsx("th", { className: "py-3 px-4", children: "Payload Values" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 font-mono", children: logs.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-8 text-center text-slate-500", children: "No audit log entries recorded." }) })) : (logs.map(log => (_jsxs("tr", { className: "hover:bg-slate-50/60", children: [_jsx("td", { className: "py-3 px-4 text-slate-500 text-[11px]", children: log.created_at }), _jsx("td", { className: "py-3 px-4 font-sans font-semibold text-slate-900", children: log.first_name ? `${log.first_name} ${log.last_name}` : log.actor_email || 'System' }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded ${log.action.includes('APPROVED')
                                                    ? 'bg-emerald-50 text-emerald-800'
                                                    : log.action.includes('REJECTED')
                                                        ? 'bg-rose-50 text-rose-800'
                                                        : log.action.includes('LOCKED')
                                                            ? 'bg-purple-50 text-purple-800'
                                                            : 'bg-slate-100 text-slate-800'}`, children: log.action }) }), _jsx("td", { className: "py-3 px-4 text-slate-700", children: log.entity_type }), _jsx("td", { className: "py-3 px-4 text-slate-500 text-[11px] truncate max-w-[120px]", children: log.entity_id || '—' }), _jsx("td", { className: "py-3 px-4 text-slate-600 text-[11px] max-w-sm truncate", children: log.new_values || '—' })] }, log.id)))) })] }) }) })] }));
};
