import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Calendar, Receipt, AlertCircle, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const ApprovalsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('leaves');
    const [loading, setLoading] = useState(true);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [pendingCorrections, setPendingCorrections] = useState([]);
    const [pendingExpenses, setPendingExpenses] = useState([]);
    // Action Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [targetItem, setTargetItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const loadApprovals = async () => {
        setLoading(true);
        try {
            const [leaveRes, corrRes, expRes] = await Promise.all([
                api.get('/leaves/pending-approvals'),
                api.get('/attendance/corrections'),
                api.get('/expenses')
            ]);
            if (leaveRes.data.success) {
                setPendingLeaves(leaveRes.data.pendingLeaves);
            }
            if (corrRes.data.success) {
                setPendingCorrections(corrRes.data.corrections.filter((c) => c.status === 'PENDING'));
            }
            if (expRes.data.success) {
                setPendingExpenses(expRes.data.expenses.filter((e) => e.status === 'PENDING'));
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadApprovals();
    }, [user]);
    // Handle Approve
    const handleApprove = async (type, id) => {
        setActionLoading(true);
        setFeedback(null);
        try {
            let endpoint = '';
            if (type === 'leave')
                endpoint = `/leaves/${id}/action`;
            if (type === 'attendance')
                endpoint = `/attendance/corrections/${id}/action`;
            if (type === 'expense')
                endpoint = `/expenses/${id}/action`;
            const res = await api.put(endpoint, { action: 'APPROVE' });
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                loadApprovals();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Approval action failed' });
        }
        finally {
            setActionLoading(false);
        }
    };
    // Open Rejection Dialog
    const openRejectDialog = (type, id, name) => {
        setTargetItem({ type, id, name });
        setRejectionReason('');
        setRejectModalOpen(true);
    };
    // Submit Rejection
    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!targetItem || !rejectionReason.trim())
            return;
        setActionLoading(true);
        setFeedback(null);
        try {
            let endpoint = '';
            if (targetItem.type === 'leave')
                endpoint = `/leaves/${targetItem.id}/action`;
            if (targetItem.type === 'attendance')
                endpoint = `/attendance/corrections/${targetItem.id}/action`;
            if (targetItem.type === 'expense')
                endpoint = `/expenses/${targetItem.id}/action`;
            const res = await api.put(endpoint, {
                action: 'REJECT',
                rejectionReason: rejectionReason.trim()
            });
            if (res.data.success) {
                setFeedback({ type: 'success', text: res.data.message });
                setRejectModalOpen(false);
                loadApprovals();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Rejection action failed' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const totalPending = pendingLeaves.length + pendingCorrections.length + pendingExpenses.length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Manager Approval Center" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Review and act on pending workforce requests from your reporting team members." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-slate-500 font-medium", children: "Pending Review:" }), _jsxs("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white", children: [totalPending, " Items"] })] })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex border-b border-slate-200 text-xs font-semibold", children: [_jsxs("button", { onClick: () => setActiveTab('leaves'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'leaves' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Calendar, { className: "w-4 h-4" }), _jsx("span", { children: "Leave Requests" }), pendingLeaves.length > 0 && (_jsx("span", { className: "font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold", children: pendingLeaves.length }))] }), _jsxs("button", { onClick: () => setActiveTab('attendance'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attendance' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "Attendance Corrections" }), pendingCorrections.length > 0 && (_jsx("span", { className: "font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold", children: pendingCorrections.length }))] }), _jsxs("button", { onClick: () => setActiveTab('expenses'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'expenses' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Receipt, { className: "w-4 h-4" }), _jsx("span", { children: "Expense Claims" }), pendingExpenses.length > 0 && (_jsx("span", { className: "font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold", children: pendingExpenses.length }))] })] }), activeTab === 'leaves' && (_jsx("div", { className: "space-y-4", children: pendingLeaves.length === 0 ? (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs", children: [_jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" }), _jsx("div", { className: "font-semibold text-slate-900", children: "All caught up!" }), _jsx("p", { className: "mt-1 text-slate-500", children: "There are no pending leave requests awaiting your approval." })] })) : (pendingLeaves.map(leave => (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs", children: [leave.first_name?.[0], leave.last_name?.[0]] }), _jsxs("div", { children: [_jsxs("div", { className: "font-bold text-slate-900 text-sm", children: [leave.first_name, " ", leave.last_name] }), _jsxs("div", { className: "text-[11px] text-slate-500 font-mono", children: [leave.employee_code, " \u00B7 ", leave.department_name] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-4 text-xs text-slate-700 pt-1", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block text-[11px]", children: "Leave Type" }), _jsx("span", { className: "font-semibold text-slate-900", children: leave.leave_type_name })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block text-[11px]", children: "Duration" }), _jsxs("span", { className: "font-mono text-slate-900 font-medium", children: [leave.start_date, " \u2192 ", leave.end_date, " (", leave.total_days, " days)"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400 block text-[11px]", children: "Available Balance" }), _jsx("span", { className: "font-mono font-bold text-slate-900 tabular-nums", children: leave.current_leave_balance !== undefined ? `${leave.current_leave_balance}d remaining` : 'Allocated' })] })] }), _jsxs("div", { className: "bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100", children: [_jsx("span", { className: "font-semibold text-slate-800", children: "Reason: " }), leave.reason] })] }), _jsxs("div", { className: "flex sm:flex-col items-center gap-2 shrink-0 md:pl-4 md:border-l md:border-slate-100", children: [_jsxs("button", { onClick: () => handleApprove('leave', leave.id), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: "Approve" })] }), _jsxs("button", { onClick: () => openRejectDialog('leave', leave.id, `${leave.first_name} ${leave.last_name}`), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50", children: [_jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Reject..." })] })] })] }, leave.id)))) })), activeTab === 'attendance' && (_jsx("div", { className: "space-y-4", children: pendingCorrections.length === 0 ? (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs", children: [_jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" }), _jsx("div", { className: "font-semibold text-slate-900", children: "No pending attendance corrections." })] })) : (pendingCorrections.map(corr => (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold text-slate-900 text-sm", children: [corr.first_name, " ", corr.last_name] }), _jsxs("span", { className: "text-slate-400 font-mono text-xs", children: ["(", corr.employee_code, ")"] })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs font-mono text-slate-700", children: [_jsxs("span", { children: ["Date: ", _jsx("strong", { className: "text-slate-900", children: corr.date })] }), _jsx("span", { children: "\u00B7" }), _jsxs("span", { children: ["Requested: ", _jsxs("strong", { className: "text-slate-900", children: [corr.requested_check_in, " \u2192 ", corr.requested_check_out] })] })] }), _jsxs("div", { className: "bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100", children: [_jsx("span", { className: "font-semibold text-slate-800", children: "Explanation: " }), corr.reason] })] }), _jsxs("div", { className: "flex sm:flex-col items-center gap-2 shrink-0 md:pl-4 md:border-l md:border-slate-100", children: [_jsxs("button", { onClick: () => handleApprove('attendance', corr.id), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: "Approve" })] }), _jsxs("button", { onClick: () => openRejectDialog('attendance', corr.id, `${corr.first_name} ${corr.last_name}`), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50", children: [_jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Reject..." })] })] })] }, corr.id)))) })), activeTab === 'expenses' && (_jsx("div", { className: "space-y-4", children: pendingExpenses.length === 0 ? (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs", children: [_jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" }), _jsx("div", { className: "font-semibold text-slate-900", children: "No pending expenses awaiting approval." })] })) : (pendingExpenses.map(exp => (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "font-bold text-slate-900 text-sm", children: [exp.first_name, " ", exp.last_name] }), _jsxs("span", { className: "text-base font-extrabold font-mono text-slate-900 tabular-nums", children: ["$", exp.amount.toFixed(2), " ", exp.currency] })] }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-slate-500", children: [_jsx("span", { className: "font-semibold text-slate-700", children: exp.category }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "font-mono", children: exp.expense_date }), exp.receipt_url && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("a", { href: exp.receipt_url, target: "_blank", rel: "noreferrer", className: "text-slate-900 underline font-medium", children: "View Receipt" })] }))] }), _jsx("div", { className: "bg-slate-50 p-3 rounded-lg text-xs text-slate-600 border border-slate-100", children: exp.description })] }), _jsxs("div", { className: "flex sm:flex-col items-center gap-2 shrink-0 md:pl-4 md:border-l md:border-slate-100", children: [_jsxs("button", { onClick: () => handleApprove('expense', exp.id), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: "Approve" })] }), _jsxs("button", { onClick: () => openRejectDialog('expense', exp.id, `${exp.first_name} ${exp.last_name}`), disabled: actionLoading, className: "w-full sm:w-28 py-2 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50", children: [_jsx(XCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Reject..." })] })] })] }, exp.id)))) })), rejectModalOpen && targetItem && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleRejectSubmit, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsxs("h3", { className: "text-sm font-bold text-slate-900", children: ["Reject ", targetItem.type === 'leave' ? 'Leave' : targetItem.type === 'attendance' ? 'Attendance' : 'Expense', " Request"] }), _jsx("button", { type: "button", onClick: () => setRejectModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("p", { className: "text-slate-600", children: ["Provide a mandatory reason for rejecting this request from ", _jsx("strong", { children: targetItem.name }), ". The employee will receive an immediate in-app notification with your reason."] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Rejection Reason (Required) *" }), _jsx("textarea", { rows: 3, required: true, placeholder: "e.g. Critical release sprint overlap; please reschedule or coordinate with on-call coverage...", value: rejectionReason, onChange: e => setRejectionReason(e.target.value), className: "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500" })] }), _jsx("div", { className: "p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-[11px]", children: "Upon rejection, pending balance reserves will be released back to the employee's balance and an immutable audit log entry will be created." })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setRejectModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading || !rejectionReason.trim(), className: "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50", children: actionLoading ? 'Recording...' : 'Confirm Rejection' })] })] }) }))] }));
};
