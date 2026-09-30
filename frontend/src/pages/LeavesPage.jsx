import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, Info, History, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const LeavesPage = () => {
    const { user } = useAuth();
    const [balances, setBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    // Form State
    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        isHalfDay: false,
        reason: ''
    });
    const loadData = async () => {
        setLoading(true);
        try {
            const [balRes, typesRes, appRes] = await Promise.all([
                api.get('/leaves/balances'),
                api.get('/leaves/types'),
                api.get('/leaves/applications')
            ]);
            if (balRes.data.success) {
                setBalances(balRes.data.balances);
                setTransactions(balRes.data.transactions);
            }
            if (typesRes.data.success) {
                setLeaveTypes(typesRes.data.types);
                if (typesRes.data.types.length > 0 && !formData.leaveTypeId) {
                    setFormData(prev => ({ ...prev, leaveTypeId: typesRes.data.types[0].id }));
                }
            }
            if (appRes.data.success)
                setApplications(appRes.data.applications);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, [user]);
    // Compute total days client-side for immediate preview
    const computeRequestedDays = () => {
        if (!formData.startDate || !formData.endDate)
            return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start)
            return 0;
        if (formData.isHalfDay)
            return 0.5;
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };
    const selectedBalance = balances.find(b => b.leave_type_id === formData.leaveTypeId);
    const requestedDays = computeRequestedDays();
    const handleApply = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/leaves/apply', formData);
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                setApplyModalOpen(false);
                setFormData({
                    leaveTypeId: leaveTypes[0]?.id || '',
                    startDate: '',
                    endDate: '',
                    isHalfDay: false,
                    reason: ''
                });
                loadData();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to submit leave application' });
        }
        finally {
            setActionLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Leave Management" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Transparent leave policies, auditable balance ledger, and automated hierarchical approval routing." })] }), _jsxs("button", { onClick: () => setApplyModalOpen(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Apply For Leave" })] })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: balances.map(b => (_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold text-slate-700", children: b.leave_type_name }), _jsx("span", { className: "text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold", children: b.leave_type_code })] }), _jsxs("div", { className: "mt-3 flex items-baseline gap-1.5", children: [_jsx("span", { className: "text-3xl font-extrabold font-mono text-slate-900 tabular-nums", children: b.balance }), _jsxs("span", { className: "text-xs text-slate-500", children: ["/ ", b.allocated, " days remaining"] })] })] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between", children: [_jsxs("span", { children: ["Taken: ", _jsxs("strong", { className: "text-slate-800 font-mono", children: [b.used, "d"] })] }), b.pending > 0 && (_jsxs("span", { className: "text-amber-600 font-medium", children: ["Pending: ", b.pending, "d"] }))] })] }, b.id))) }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between", children: [_jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Leave Applications" }), _jsxs("span", { className: "text-xs text-slate-500", children: [applications.length, " recorded"] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Employee" }), _jsx("th", { className: "py-3 px-4", children: "Leave Type" }), _jsx("th", { className: "py-3 px-4", children: "Duration" }), _jsx("th", { className: "py-3 px-4", children: "Days" }), _jsx("th", { className: "py-3 px-4", children: "Assigned Approver" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Reason / Notes" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: applications.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-slate-500", children: "No leave applications recorded." }) })) : (applications.map(app => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsxs("td", { className: "py-3 px-4", children: [_jsxs("div", { className: "font-semibold text-slate-900", children: [app.first_name, " ", app.last_name] }), _jsx("div", { className: "text-[11px] text-slate-500 font-mono", children: app.employee_code })] }), _jsx("td", { className: "py-3 px-4 font-medium text-slate-800", children: app.leave_type_name }), _jsxs("td", { className: "py-3 px-4 font-mono text-slate-700", children: [app.start_date, " ", _jsx("span", { className: "text-slate-400", children: "to" }), " ", app.end_date] }), _jsxs("td", { className: "py-3 px-4 font-mono font-bold text-slate-900 tabular-nums", children: [app.total_days, " ", app.is_half_day ? '(Half Day)' : 'days'] }), _jsx("td", { className: "py-3 px-4", children: app.approver_first_name ? (_jsxs("span", { className: "font-medium text-slate-700", children: [app.approver_first_name, " ", app.approver_last_name] })) : (_jsx("span", { className: "text-slate-400 italic", children: "Auto / HR" })) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`, children: app.status }) }), _jsx("td", { className: "py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate", children: app.status === 'REJECTED' && app.rejection_reason
                                                    ? _jsxs("span", { className: "text-rose-600 font-medium", children: ["Rejected: ", app.rejection_reason] })
                                                    : app.reason })] }, app.id)))) })] }) })] }), transactions.length > 0 && (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs p-5", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(History, { className: "w-4 h-4 text-slate-600" }), _jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Auditable Leave Balance Ledger (Transaction History)" })] }), _jsx("p", { className: "text-xs text-slate-500 mb-4", children: "Immutable log of opening balances, accruals, deductions, and reversals." }), _jsx("div", { className: "divide-y divide-slate-100 text-xs", children: transactions.map(txn => (_jsxs("div", { className: "py-2.5 flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "font-medium text-slate-800", children: [_jsx("span", { className: "font-semibold text-slate-900", children: txn.leave_type_name }), _jsx("span", { className: "mx-2 text-slate-300", children: "\u00B7" }), _jsx("span", { className: "text-slate-600", children: txn.notes })] }), _jsx("span", { className: "text-[10px] font-mono text-slate-400", children: new Date(txn.created_at).toLocaleString() })] }), _jsxs("div", { className: "text-right", children: [_jsxs("span", { className: `font-mono font-bold tabular-nums ${txn.days < 0 ? 'text-rose-600' : 'text-emerald-700'}`, children: [txn.days > 0 ? `+${txn.days}` : txn.days, " days"] }), _jsxs("div", { className: "text-[10px] text-slate-400 font-mono", children: ["Balance after: ", txn.balance_after, "d"] })] })] }, txn.id))) })] })), applyModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleApply, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Submit Leave Application" }), _jsx("button", { type: "button", onClick: () => setApplyModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Leave Type *" }), _jsx("select", { value: formData.leaveTypeId, onChange: e => setFormData({ ...formData, leaveTypeId: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: leaveTypes.map(lt => {
                                                const bal = balances.find(b => b.leave_type_id === lt.id);
                                                return (_jsxs("option", { value: lt.id, children: [lt.name, " (", bal ? `${bal.balance} days available` : `${lt.annual_allowance} days`, ")"] }, lt.id));
                                            }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Start Date *" }), _jsx("input", { type: "date", required: true, value: formData.startDate, onChange: e => setFormData({ ...formData, startDate: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "End Date *" }), _jsx("input", { type: "date", required: true, value: formData.endDate, onChange: e => setFormData({ ...formData, endDate: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "halfDay", checked: formData.isHalfDay, onChange: e => setFormData({ ...formData, isHalfDay: e.target.checked }), className: "w-4 h-4 text-slate-900 rounded" }), _jsx("label", { htmlFor: "halfDay", className: "text-[11px] font-medium text-slate-700", children: "Half-day leave (0.5 day deduction)" })] }), requestedDays > 0 && (_jsxs("div", { className: `p-3 rounded-lg border text-xs ${selectedBalance && selectedBalance.balance < requestedDays
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`, children: [_jsxs("div", { className: "font-semibold", children: ["Requested Duration: ", requestedDays, " day(s)"] }), _jsxs("div", { className: "text-[11px] mt-0.5", children: ["Available balance: ", selectedBalance?.balance || 0, " days.", selectedBalance && selectedBalance.balance < requestedDays && ' (Insufficient balance!)'] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Reason for Leave *" }), _jsx("textarea", { rows: 3, required: true, placeholder: "Detail your request for your reporting manager...", value: formData.reason, onChange: e => setFormData({ ...formData, reason: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" })] }), _jsxs("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2", children: [_jsx(Info, { className: "w-4 h-4 text-slate-500 shrink-0 mt-0.5" }), _jsxs("span", { children: [_jsx("strong", { children: "Automated Approval Routing:" }), " The backend validates policy rules and assigns your designated reporting manager as approver. Balances are updated transactionally upon approval."] })] })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setApplyModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading || (selectedBalance && selectedBalance.balance < requestedDays), className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Submitting...' : 'Apply Leave' })] })] }) }))] }));
};
