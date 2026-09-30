import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const ReportsPage = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadReport() {
            try {
                const res = await api.get('/ops/reports/workforce');
                if (res.data.success) {
                    setEmployees(res.data.employees);
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoading(false);
            }
        }
        loadReport();
    }, [user]);
    const downloadCSV = () => {
        window.location.href = `/api/v1/ops/reports/workforce?format=csv`;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Workforce Analytics & Reports" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Export structured compliance records, headcounts, compensation structures, and departmental distributions." })] }), _jsxs("button", { onClick: downloadCSV, className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export Master CSV Report" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Total Directory" }), _jsx("div", { className: "mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums", children: employees.length }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "Full-time, contract, and interns" })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Annual Payroll Obligation" }), _jsxs("div", { className: "mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums", children: ["$", employees.reduce((s, e) => s + (e.base_salary || 0), 0).toLocaleString()] }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "Aggregate base run" })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Reporting Format" }), _jsx("div", { className: "mt-2 text-base font-bold text-slate-900", children: "RFC 4180 Compliant CSV" }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "Ready for ERP & Excel ingest" })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between", children: [_jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Workforce Directory Master Export" }), _jsxs("span", { className: "text-xs text-slate-500 font-mono", children: [employees.length, " Records"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Code" }), _jsx("th", { className: "py-3 px-4", children: "Full Name" }), _jsx("th", { className: "py-3 px-4", children: "Email" }), _jsx("th", { className: "py-3 px-4", children: "Department" }), _jsx("th", { className: "py-3 px-4", children: "Designation" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Base Salary" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 font-mono", children: employees.map(e => (_jsxs("tr", { className: "hover:bg-slate-50/60", children: [_jsx("td", { className: "py-3 px-4 font-bold text-slate-900", children: e.employee_code }), _jsxs("td", { className: "py-3 px-4 font-sans font-semibold text-slate-900", children: [e.first_name, " ", e.last_name] }), _jsx("td", { className: "py-3 px-4 text-slate-600", children: e.email }), _jsx("td", { className: "py-3 px-4 font-sans text-slate-700", children: e.department }), _jsx("td", { className: "py-3 px-4 font-sans text-slate-700", children: e.designation }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800", children: e.employment_status }) }), _jsxs("td", { className: "py-3 px-4 text-right font-bold text-slate-900 tabular-nums", children: ["$", e.base_salary ? e.base_salary.toLocaleString() : '0'] })] }, e.employee_code))) })] }) })] })] }));
};
