import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, AlertCircle, FileText, Printer, Play, X, CreditCard } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const PayrollPage = () => {
    const { user } = useAuth();
    const [runs, setRuns] = useState([]);
    const [selectedRun, setSelectedRun] = useState(null);
    const [runItems, setRunItems] = useState([]);
    const [activePayslip, setActivePayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    // Run Payroll Modal
    const [newRunModal, setNewRunModal] = useState(false);
    const [newRunMonth, setNewRunMonth] = useState(new Date().getMonth() + 1);
    const [newRunYear, setNewRunYear] = useState(new Date().getFullYear());
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const loadRuns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/runs');
            if (res.data.success) {
                setRuns(res.data.runs);
                if (res.data.runs.length > 0 && !selectedRun) {
                    viewRunDetails(res.data.runs[0]);
                }
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadRuns();
    }, [user]);
    const viewRunDetails = async (run) => {
        setSelectedRun(run);
        try {
            const res = await api.get(`/payroll/runs/${run.id}`);
            if (res.data.success) {
                setRunItems(res.data.items);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    const handleProcessRun = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/payroll/runs', { month: Number(newRunMonth), year: Number(newRunYear) });
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                setNewRunModal(false);
                loadRuns();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Payroll processing failed.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleLockRun = async (runId) => {
        if (!confirm('Are you sure you want to lock this payroll cycle? Once locked, all calculations and line items become permanently immutable.')) {
            return;
        }
        setActionLoading(true);
        try {
            const res = await api.put(`/payroll/runs/${runId}/lock`);
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                loadRuns();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Lock failed.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const handlePayRun = async (runId) => {
        setActionLoading(true);
        try {
            const res = await api.put(`/payroll/runs/${runId}/pay`);
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                loadRuns();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Payout failed.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const viewPayslip = async (employeeId, runId) => {
        try {
            const res = await api.get(`/payroll/payslip/${employeeId}/${runId}`);
            if (res.data.success) {
                setActivePayslip(res.data.payslip);
            }
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to retrieve payslip');
        }
    };
    const isPayrollAdminOrOwner = ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN'].includes(user?.role || '');
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Payroll Engine & Payslips" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Configurable salary structure, statutory tax deductions (PF, ESI, Professional Tax, TDS), locking & PDF payslips." })] }), isPayrollAdminOrOwner && (_jsxs("button", { onClick: () => setNewRunModal(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Play, { className: "w-3.5 h-3.5 fill-current" }), _jsx("span", { children: "Process New Payroll Cycle" })] }))] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "lg:col-span-1 space-y-3", children: [_jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Payroll Cycles" }), runs.length === 0 ? (_jsx("div", { className: "p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 text-center", children: "No payroll cycles generated yet." })) : (runs.map(run => (_jsxs("div", { onClick: () => viewRunDetails(run), className: `p-4 rounded-xl border cursor-pointer transition-all ${selectedRun?.id === run.id
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: `font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${run.status === 'LOCKED' || run.status === 'PAID'
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-amber-500/20 text-amber-400'}`, children: run.status }), _jsxs("span", { className: `text-[11px] font-mono ${selectedRun?.id === run.id ? 'text-slate-300' : 'text-slate-400'}`, children: [run.month, "/", run.year] })] }), _jsx("div", { className: "mt-2 font-semibold text-xs leading-snug", children: run.title }), _jsxs("div", { className: "mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between", children: [_jsx("span", { className: `text-[11px] ${selectedRun?.id === run.id ? 'text-slate-300' : 'text-slate-500'}`, children: "Net Disbursal" }), _jsxs("span", { className: "font-mono font-bold text-xs tabular-nums", children: ["$", run.total_net ? run.total_net.toLocaleString() : '0'] })] })] }, run.id))))] }), _jsx("div", { className: "lg:col-span-3 space-y-4", children: selectedRun ? (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: [_jsxs("div", { className: "p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h2", { className: "text-base font-bold text-slate-900", children: selectedRun.title }), _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${selectedRun.status === 'LOCKED' || selectedRun.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`, children: selectedRun.status })] }), _jsxs("div", { className: "text-xs text-slate-500 mt-0.5", children: ["Gross: $", selectedRun.total_gross.toLocaleString(), " \u00B7 Deductions: $", selectedRun.total_deductions.toLocaleString(), " \u00B7 Net Disbursal: $", selectedRun.total_net.toLocaleString()] })] }), isPayrollAdminOrOwner && (_jsxs("div", { className: "flex items-center gap-2", children: [selectedRun.status !== 'LOCKED' && selectedRun.status !== 'PAID' && (_jsxs("button", { onClick: () => handleLockRun(selectedRun.id), disabled: actionLoading, className: "py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors", children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-slate-500" }), _jsx("span", { children: "Lock Cycle" })] })), selectedRun.status !== 'PAID' && (_jsxs("button", { onClick: () => handlePayRun(selectedRun.id), disabled: actionLoading, className: "py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(CreditCard, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Disburse Payouts" })] }))] }))] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Employee" }), _jsx("th", { className: "py-3 px-4", children: "Basic Salary" }), _jsx("th", { className: "py-3 px-4", children: "HRA + Special" }), _jsx("th", { className: "py-3 px-4", children: "Gross Earnings" }), _jsx("th", { className: "py-3 px-4", children: "PF & Statutory" }), _jsx("th", { className: "py-3 px-4", children: "Net Salary" }), _jsx("th", { className: "py-3 px-4 text-center", children: "Payslip" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: runItems.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-slate-500", children: "No items found for this cycle." }) })) : (runItems.map(item => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsxs("td", { className: "py-3 px-4", children: [_jsxs("div", { className: "font-semibold text-slate-900", children: [item.first_name, " ", item.last_name] }), _jsxs("div", { className: "text-[11px] text-slate-500 font-mono", children: [item.employee_code, " \u00B7 ", item.department_name] })] }), _jsxs("td", { className: "py-3 px-4 font-mono tabular-nums text-slate-700", children: ["$", item.basic_salary.toFixed(2)] }), _jsxs("td", { className: "py-3 px-4 font-mono tabular-nums text-slate-700", children: ["$", (item.hra_allowance + item.special_allowance).toFixed(2)] }), _jsxs("td", { className: "py-3 px-4 font-mono font-semibold tabular-nums text-slate-900", children: ["$", item.gross_earnings.toFixed(2)] }), _jsxs("td", { className: "py-3 px-4 font-mono tabular-nums text-rose-600", children: ["-$", item.total_deductions.toFixed(2)] }), _jsxs("td", { className: "py-3 px-4 font-mono font-extrabold tabular-nums text-slate-900", children: ["$", item.net_salary.toFixed(2)] }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsxs("button", { onClick: () => viewPayslip(item.employee_id, item.payroll_run_id), className: "px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors", children: [_jsx(FileText, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Payslip" })] }) })] }, item.id)))) })] }) })] })) : (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs", children: "Select or process a payroll cycle to view line items." })) })] }), activePayslip && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden", children: [_jsx("span", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Official Salary Slip" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => window.print(), className: "px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1.5", children: [_jsx(Printer, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Print Payslip" })] }), _jsx("button", { onClick: () => setActivePayslip(null), className: "p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200", children: _jsx(X, { className: "w-5 h-5" }) })] })] }), _jsxs("div", { className: "p-6 overflow-y-auto space-y-6 text-xs text-slate-900", children: [_jsxs("div", { className: "flex items-start justify-between border-b border-slate-200 pb-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-6 h-6 rounded bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs", children: "Z" }), _jsx("span", { className: "font-bold text-base tracking-tight", children: activePayslip.organization_name })] }), _jsxs("div", { className: "text-[11px] text-slate-500 mt-1 max-w-sm", children: [activePayslip.legal_name, " \u00B7 ", activePayslip.organization_address || 'San Francisco, CA'] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-slate-700 block", children: "Payslip For" }), _jsx("span", { className: "font-bold text-base font-mono text-slate-900 block mt-0.5", children: activePayslip.payroll_title }), _jsxs("span", { className: "text-[10px] font-mono text-emerald-600 font-semibold uppercase", children: ["Status: ", activePayslip.payment_status] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-semibold text-slate-400 block", children: "Employee Details" }), _jsxs("div", { className: "font-bold text-slate-900 mt-1", children: [activePayslip.first_name, " ", activePayslip.last_name] }), _jsxs("div", { className: "text-[11px] text-slate-600 font-mono", children: ["ID: ", activePayslip.employee_code, " \u00B7 ", activePayslip.designation_title] }), _jsxs("div", { className: "text-[11px] text-slate-600", children: ["Department: ", activePayslip.department_name] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-semibold text-slate-400 block", children: "Banking & Statutory Identifiers" }), _jsx("div", { className: "font-semibold text-slate-800 mt-1", children: activePayslip.bank_name || 'Direct Deposit' }), _jsxs("div", { className: "text-[11px] text-slate-600 font-mono", children: ["A/C: ", activePayslip.bank_account_no || 'Ending in 8237'] }), _jsxs("div", { className: "text-[11px] text-slate-600 font-mono", children: ["PAN / Tax ID: ", activePayslip.pan_tax_id || 'ABCDE1234F', " \u00B7 PF UAN: ", activePayslip.pf_uan_number || '100982736152'] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex justify-between", children: [_jsx("span", { children: "Earnings" }), _jsxs("span", { children: ["Amount (", activePayslip.currency, ")"] })] }), _jsxs("div", { className: "divide-y divide-slate-100 text-xs", children: [_jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Basic Salary" }), _jsxs("span", { className: "font-mono font-medium", children: ["$", activePayslip.basic_salary.toFixed(2)] })] }), _jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "House Rent Allowance (HRA)" }), _jsxs("span", { className: "font-mono font-medium", children: ["$", activePayslip.hra_allowance.toFixed(2)] })] }), _jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Special Executive Allowance" }), _jsxs("span", { className: "font-mono font-medium", children: ["$", activePayslip.special_allowance.toFixed(2)] })] }), _jsxs("div", { className: "py-2.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 rounded", children: [_jsx("span", { children: "Gross Earnings" }), _jsxs("span", { className: "font-mono tabular-nums", children: ["$", activePayslip.gross_earnings.toFixed(2)] })] })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex justify-between", children: [_jsx("span", { children: "Statutory Deductions" }), _jsxs("span", { children: ["Amount (", activePayslip.currency, ")"] })] }), _jsxs("div", { className: "divide-y divide-slate-100 text-xs", children: [_jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Provident Fund (PF 12%)" }), _jsxs("span", { className: "font-mono text-rose-600 font-medium", children: ["-$", activePayslip.pf_deduction.toFixed(2)] })] }), _jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Professional Tax (PT)" }), _jsxs("span", { className: "font-mono text-rose-600 font-medium", children: ["-$", activePayslip.prof_tax.toFixed(2)] })] }), _jsxs("div", { className: "py-2 flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Tax Deducted at Source (TDS)" }), _jsxs("span", { className: "font-mono text-rose-600 font-medium", children: ["-$", activePayslip.tds_tax.toFixed(2)] })] }), _jsxs("div", { className: "py-2.5 flex justify-between font-bold text-rose-700 bg-rose-50 px-2 rounded", children: [_jsx("span", { children: "Total Deductions" }), _jsxs("span", { className: "font-mono tabular-nums", children: ["-$", activePayslip.total_deductions.toFixed(2)] })] })] })] })] }), _jsxs("div", { className: "p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase tracking-wider text-slate-400 block font-semibold", children: "Net Salary Payable" }), _jsx("span", { className: "text-[11px] text-slate-300", children: "Disbursed via automated direct clearing" })] }), _jsx("div", { className: "text-right", children: _jsxs("span", { className: "text-2xl font-extrabold font-mono text-emerald-400 tabular-nums", children: ["$", activePayslip.net_salary.toFixed(2), " ", activePayslip.currency] }) })] }), _jsxs("div", { className: "p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 leading-relaxed", children: [_jsx("strong", { children: "Statutory Compliance Notice:" }), " Statutory deductions (PF, ESI, Professional Tax, TDS) computed according to current workforce rules. Organizations must verify statutory calculations and compliance requirements with qualified professionals and current government rules."] })] })] }) })), newRunModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleProcessRun, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Run Monthly Payroll Cycle" }), _jsx("button", { type: "button", onClick: () => setNewRunModal(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsx("p", { className: "text-slate-600", children: "The Zenora Payroll Engine will calculate basic salary, allowances, statutory PF (12%), professional tax, and TDS deductions for all active workforce members." }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Month *" }), _jsx("select", { value: newRunMonth, onChange: e => setNewRunMonth(Number(e.target.value)), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg", children: [
                                                        'January', 'February', 'March', 'April', 'May', 'June',
                                                        'July', 'August', 'September', 'October', 'November', 'December'
                                                    ].map((name, idx) => (_jsx("option", { value: idx + 1, children: name }, name))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Year *" }), _jsx("input", { type: "number", value: newRunYear, onChange: e => setNewRunYear(Number(e.target.value)), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] })] }), _jsx("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600", children: "Calculations execute in an ACID database transaction. You can review all line items before locking the run." })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setNewRunModal(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading, className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Calculating...' : 'Run Calculations' })] })] }) }))] }));
};
