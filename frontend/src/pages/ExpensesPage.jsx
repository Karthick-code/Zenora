import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, ExternalLink, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const ExpensesPage = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [formData, setFormData] = useState({
        category: 'TRAINING',
        amount: 150.00,
        currency: 'USD',
        expenseDate: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: ''
    });
    const loadExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/expenses');
            if (res.data.success) {
                setExpenses(res.data.expenses);
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
        loadExpenses();
    }, [user]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/expenses', formData);
            if (res.data.success) {
                setFeedback({ type: 'success', text: 'Expense claim submitted to your reporting manager for approval.' });
                setModalOpen(false);
                setFormData({
                    category: 'TRAINING',
                    amount: 150.00,
                    currency: 'USD',
                    expenseDate: new Date().toISOString().split('T')[0],
                    description: '',
                    receiptUrl: ''
                });
                loadExpenses();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to submit expense.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const totalClaimed = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalApproved = expenses
        .filter(item => item.status === 'APPROVED' || item.status === 'PAID')
        .reduce((sum, item) => sum + (item.amount || 0), 0);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Expense Management" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Submit reimbursement claims, attach receipts, and track managerial approval workflows." })] }), _jsxs("button", { onClick: () => setModalOpen(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Submit Expense Claim" })] })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Total Claims" }), _jsxs("div", { className: "mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums", children: ["$", totalClaimed.toFixed(2)] }), _jsxs("span", { className: "text-xs text-slate-500 mt-1 block", children: [expenses.length, " claims submitted"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Approved / Reimbursed" }), _jsxs("div", { className: "mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums", children: ["$", totalApproved.toFixed(2)] }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "Cleared by reporting manager" })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Pending Approval" }), _jsxs("div", { className: "mt-2 text-2xl font-bold font-mono text-amber-600 tabular-nums", children: ["$", expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0).toFixed(2)] }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "Awaiting manager sign-off" })] })] }), _jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Date" }), _jsx("th", { className: "py-3 px-4", children: "Employee" }), _jsx("th", { className: "py-3 px-4", children: "Category" }), _jsx("th", { className: "py-3 px-4", children: "Description" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Amount" }), _jsx("th", { className: "py-3 px-4", children: "Receipt" }), _jsx("th", { className: "py-3 px-4", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: expenses.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-slate-500", children: "No expense claims recorded." }) })) : (expenses.map(exp => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-mono font-medium text-slate-800", children: exp.expense_date }), _jsxs("td", { className: "py-3 px-4", children: [_jsxs("span", { className: "font-semibold text-slate-900", children: [exp.first_name, " ", exp.last_name] }), _jsx("span", { className: "text-[11px] text-slate-500 font-mono ml-1.5", children: exp.employee_code })] }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "font-medium text-slate-800 px-2 py-0.5 rounded bg-slate-100 text-[11px]", children: exp.category }) }), _jsx("td", { className: "py-3 px-4 text-slate-600 max-w-xs truncate", children: exp.description }), _jsxs("td", { className: "py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums", children: ["$", exp.amount.toFixed(2), " ", exp.currency] }), _jsx("td", { className: "py-3 px-4", children: exp.receipt_url ? (_jsxs("a", { href: exp.receipt_url, target: "_blank", rel: "noreferrer", className: "text-slate-800 hover:text-slate-900 font-medium inline-flex items-center gap-1 underline text-[11px]", children: [_jsx("span", { children: "Receipt" }), _jsx(ExternalLink, { className: "w-3 h-3" })] })) : (_jsx("span", { className: "text-slate-400 italic text-[11px]", children: "No receipt" })) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${exp.status === 'APPROVED' || exp.status === 'PAID'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : exp.status === 'REJECTED'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-800'}`, children: exp.status }) })] }, exp.id)))) })] }) }) }), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleSubmit, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Submit Reimbursement Claim" }), _jsx("button", { type: "button", onClick: () => setModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Expense Category *" }), _jsxs("select", { value: formData.category, onChange: e => setFormData({ ...formData, category: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: [_jsx("option", { value: "TRAINING", children: "TRAINING & CONFERENCES" }), _jsx("option", { value: "TRAVEL", children: "TRAVEL & TRANSPORT" }), _jsx("option", { value: "MEALS", children: "CLIENT MEALS" }), _jsx("option", { value: "HARDWARE", children: "HARDWARE & PERIPHERALS" }), _jsx("option", { value: "OFFICE", children: "OFFICE SUPPLIES" }), _jsx("option", { value: "OTHER", children: "OTHER" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Amount (USD) *" }), _jsx("input", { type: "number", step: "0.01", required: true, value: formData.amount, onChange: e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Expense Date *" }), _jsx("input", { type: "date", required: true, value: formData.expenseDate, onChange: e => setFormData({ ...formData, expenseDate: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Description & Business Justification *" }), _jsx("textarea", { rows: 3, required: true, placeholder: "Detail the expense purpose and project relevance...", value: formData.description, onChange: e => setFormData({ ...formData, description: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Receipt URL or Attachment" }), _jsx("input", { type: "url", placeholder: "https://example.com/receipt.pdf", value: formData.receiptUrl, onChange: e => setFormData({ ...formData, receiptUrl: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsx("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600", children: "This claim will be dispatched automatically to your configured reporting manager for review." })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading, className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Submitting...' : 'Submit Claim' })] })] }) }))] }));
};
