import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, FileEdit, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const AttendancePage = () => {
    const { user } = useAuth();
    const [todayRecord, setTodayRecord] = useState(null);
    const [history, setHistory] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [activeTab, setActiveTab] = useState('logs');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [correctionForm, setCorrectionForm] = useState({
        date: new Date().toISOString().split('T')[0],
        requestedCheckIn: '09:00:00',
        requestedCheckOut: '18:00:00',
        reason: ''
    });
    const loadData = async () => {
        setLoading(true);
        try {
            const [todayRes, histRes, corrRes] = await Promise.all([
                api.get('/attendance/today'),
                api.get('/attendance/history'),
                api.get('/attendance/corrections')
            ]);
            if (todayRes.data.success)
                setTodayRecord(todayRes.data.record);
            if (histRes.data.success)
                setHistory(histRes.data.records);
            if (corrRes.data.success)
                setCorrections(corrRes.data.corrections);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, [user]);
    const handleCheckIn = async () => {
        setActionLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/attendance/check-in');
            setFeedback({ type: 'success', text: res.data.message });
            loadData();
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCheckOut = async () => {
        setActionLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/attendance/check-out');
            setFeedback({ type: 'success', text: res.data.message });
            loadData();
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Check-out failed.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const submitCorrection = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await api.post('/attendance/corrections', correctionForm);
            if (res.data.success) {
                setFeedback({ type: 'success', text: 'Attendance correction submitted to your manager for approval.' });
                setModalOpen(false);
                loadData();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to submit correction.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Attendance & Shifts" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Real-time biometric & web check-in logging with shift grace period rules." })] }), _jsxs("button", { onClick: () => setModalOpen(true), className: "px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors", children: [_jsx(FileEdit, { className: "w-4 h-4" }), _jsx("span", { children: "Request Correction" })] })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-base shadow-xs", children: _jsx(Clock, { className: "w-6 h-6 text-emerald-400" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500", children: [_jsx("span", { children: "Today's Shift" }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "font-mono text-slate-800 font-medium", children: "Standard 09:00 - 18:00" }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsxs("span", { children: ["Local time: ", _jsx("strong", { className: "text-slate-900 font-mono", children: currentTime })] })] }), _jsx("div", { className: "mt-1 text-lg font-bold text-slate-900", children: todayRecord?.check_out_time
                                            ? `Completed (${todayRecord.total_hours} hrs logged)`
                                            : todayRecord?.check_in_time
                                                ? `Active Session · In at ${todayRecord.check_in_time} (${todayRecord.status})`
                                                : 'Not Yet Checked In' })] })] }), _jsx("div", { className: "flex items-center gap-3", children: !todayRecord?.check_in_time ? (_jsx("button", { onClick: handleCheckIn, disabled: actionLoading, className: "py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs", children: actionLoading ? 'Logging...' : 'Web Check-In' })) : !todayRecord?.check_out_time ? (_jsx("button", { onClick: handleCheckOut, disabled: actionLoading, className: "py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs", children: actionLoading ? 'Logging...' : 'Web Check-Out' })) : (_jsx("div", { className: "py-2 px-4 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg", children: "Completed For Today" })) })] }), _jsxs("div", { className: "flex border-b border-slate-200 text-xs font-semibold", children: [_jsxs("button", { onClick: () => setActiveTab('logs'), className: `py-3 px-4 border-b-2 transition-colors ${activeTab === 'logs' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: ["Attendance Log History (", history.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('corrections'), className: `py-3 px-4 border-b-2 transition-colors ${activeTab === 'corrections' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: ["Correction Requests (", corrections.length, ")"] })] }), activeTab === 'logs' && (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Date" }), _jsx("th", { className: "py-3 px-4", children: "Employee" }), _jsx("th", { className: "py-3 px-4", children: "Check-In" }), _jsx("th", { className: "py-3 px-4", children: "Check-Out" }), _jsx("th", { className: "py-3 px-4", children: "Total Hours" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Notes" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: history.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-slate-500", children: "No attendance records found." }) })) : (history.map(row => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-mono font-medium text-slate-900", children: row.date }), _jsxs("td", { className: "py-3 px-4", children: [_jsxs("span", { className: "font-semibold text-slate-900", children: [row.first_name, " ", row.last_name] }), _jsx("span", { className: "text-[11px] text-slate-500 font-mono ml-1.5", children: row.employee_code })] }), _jsx("td", { className: "py-3 px-4 font-mono text-slate-700", children: row.check_in_time || '—' }), _jsx("td", { className: "py-3 px-4 font-mono text-slate-700", children: row.check_out_time || '—' }), _jsx("td", { className: "py-3 px-4 font-mono font-bold text-slate-900 tabular-nums", children: row.total_hours ? `${row.total_hours} hrs` : '—' }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${row.status === 'PRESENT'
                                                    ? 'bg-emerald-50 text-emerald-800'
                                                    : row.status === 'LATE'
                                                        ? 'bg-amber-50 text-amber-800'
                                                        : row.status === 'ON_LEAVE'
                                                            ? 'bg-blue-50 text-blue-800'
                                                            : 'bg-slate-100 text-slate-700'}`, children: row.status }) }), _jsx("td", { className: "py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate", children: row.notes || 'Routine entry' })] }, row.id)))) })] }) }) })), activeTab === 'corrections' && (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Date" }), _jsx("th", { className: "py-3 px-4", children: "Requester" }), _jsx("th", { className: "py-3 px-4", children: "Requested Punch" }), _jsx("th", { className: "py-3 px-4", children: "Reason" }), _jsx("th", { className: "py-3 px-4", children: "Status" }), _jsx("th", { className: "py-3 px-4", children: "Remarks" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: corrections.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-8 text-center text-slate-500", children: "No attendance correction requests submitted." }) })) : (corrections.map(c => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-mono font-medium text-slate-900", children: c.date }), _jsxs("td", { className: "py-3 px-4", children: [_jsxs("span", { className: "font-semibold text-slate-900", children: [c.first_name, " ", c.last_name] }), _jsx("span", { className: "text-[11px] text-slate-500 font-mono ml-1.5", children: c.employee_code })] }), _jsxs("td", { className: "py-3 px-4 font-mono text-slate-700", children: [c.requested_check_in, " \u2192 ", c.requested_check_out] }), _jsx("td", { className: "py-3 px-4 text-slate-600 max-w-xs truncate", children: c.reason }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${c.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                    c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`, children: c.status }) }), _jsx("td", { className: "py-3 px-4 text-slate-400 text-[11px]", children: c.rejection_reason || '—' })] }, c.id)))) })] }) }) })), modalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: submitCorrection, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Request Attendance Correction" }), _jsx("button", { type: "button", onClick: () => setModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Date Requiring Correction *" }), _jsx("input", { type: "date", required: true, value: correctionForm.date, onChange: e => setCorrectionForm({ ...correctionForm, date: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Actual Check-In *" }), _jsx("input", { type: "time", step: "1", required: true, value: correctionForm.requestedCheckIn, onChange: e => setCorrectionForm({ ...correctionForm, requestedCheckIn: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Actual Check-Out *" }), _jsx("input", { type: "time", step: "1", required: true, value: correctionForm.requestedCheckOut, onChange: e => setCorrectionForm({ ...correctionForm, requestedCheckOut: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Reason / Explanation *" }), _jsx("textarea", { rows: 3, required: true, placeholder: "Explain why biometric/web check-in was missed or needs adjustment...", value: correctionForm.reason, onChange: e => setCorrectionForm({ ...correctionForm, reason: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" })] }), _jsx("div", { className: "p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] border border-slate-100", children: "Note: This request will be routed directly to your reporting manager. Upon manager approval, the attendance record will be updated automatically." })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading, className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Submitting...' : 'Submit Request' })] })] }) }))] }));
};
