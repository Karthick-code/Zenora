import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
export const DashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState(null);
    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Organization Stats
            if (['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'].includes(user?.role || '')) {
                const statsRes = await api.get('/organizations/stats');
                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }
                if (user?.role === 'PLATFORM_OWNER') return;
            }
            // 2. Attendance & Leave for Employee / Manager
            if (user?.employeeId) {
                const [attRes, balRes, leavesRes] = await Promise.all([
                    api.get('/attendance/today'),
                    api.get('/leaves/balances'),
                    api.get('/leaves/applications?limit=5')
                ]);
                if (attRes.data.success)
                    setTodayAttendance(attRes.data.record);
                if (balRes.data.success)
                    setLeaveBalances(balRes.data.balances);
                if (leavesRes.data.success)
                    setRecentLeaves(leavesRes.data.applications);
            }
            // 3. Announcements
            const annRes = await api.get('/ops/announcements');
            if (annRes.data.success)
                setAnnouncements(annRes.data.announcements);
        }
        catch (err) {
            console.error('Failed to load dashboard:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadDashboardData();
    }, [user]);
    const handleCheckIn = async () => {
        setActionLoading(true);
        setFeedbackMsg(null);
        try {
            const res = await api.post('/attendance/check-in');
            setFeedbackMsg({ type: 'success', text: res.data.message });
            loadDashboardData();
        }
        catch (err) {
            setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCheckOut = async () => {
        setActionLoading(true);
        setFeedbackMsg(null);
        try {
            const res = await api.post('/attendance/check-out');
            setFeedbackMsg({ type: 'success', text: res.data.message });
            loadDashboardData();
        }
        catch (err) {
            setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold tracking-tight text-slate-900", children: ["Welcome back, ", user?.firstName] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-500 mt-1", children: [_jsx("span", { children: todayFormatted }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: user?.organizationName }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: "font-semibold text-slate-700", children: user?.role?.replace('_', ' ') })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [user?.role === 'EMPLOYEE' && (_jsx(Link, { to: "/app/leaves", className: "px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs", children: "Apply for Leave" })), ['MANAGER', 'HR_ADMIN', 'ORG_OWNER'].includes(user?.role || '') && (_jsxs(Link, { to: "/app/approvals", className: "px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs flex items-center gap-1.5", children: [_jsx(CheckSquare, { className: "w-4 h-4" }), _jsx("span", { children: "Approval Center" }), stats?.pendingApprovals?.total > 0 && (_jsx("span", { className: "ml-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold", children: stats.pendingApprovals.total }))] }))] })] }), feedbackMsg && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedbackMsg.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedbackMsg.text })] })), announcements.length > 0 && (_jsx("div", { className: "bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm border border-slate-800 relative overflow-hidden", children: _jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Company Announcement" })] }), _jsx("h2", { className: "text-base font-semibold text-white", children: announcements[0].title }), _jsx("p", { className: "text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl", children: announcements[0].content })] }), _jsx("span", { className: "text-[11px] text-slate-400 font-mono shrink-0", children: new Date(announcements[0].created_at).toLocaleDateString() })] }) })), user?.role === 'EMPLOYEE' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider", children: "Attendance Status" }), _jsx("span", { className: "font-mono text-xs text-slate-400", children: currentTime })] }), _jsxs("div", { className: "mt-4 flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${todayAttendance?.check_out_time ? 'bg-slate-400' : todayAttendance?.check_in_time ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}` }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-slate-900", children: todayAttendance?.check_out_time ? 'Shift Completed' : todayAttendance?.check_in_time ? `Logged In (${todayAttendance.status})` : 'Not Checked In' }), _jsxs("div", { className: "text-xs text-slate-500", children: [todayAttendance?.check_in_time ? `In at ${todayAttendance.check_in_time}` : 'General Shift: 09:00 - 18:00', todayAttendance?.check_out_time && ` · Out at ${todayAttendance.check_out_time}`] })] })] }), todayAttendance && (_jsxs("div", { className: "mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600", children: [_jsx("span", { children: "Logged Hours" }), _jsxs("span", { className: "font-mono font-bold text-slate-900 tabular-nums", children: [todayAttendance.total_hours || 0, " hrs"] })] }))] }), _jsx("div", { className: "mt-6 flex items-center gap-3", children: !todayAttendance?.check_in_time ? (_jsx("button", { onClick: handleCheckIn, disabled: actionLoading, className: "w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50", children: actionLoading ? 'Processing...' : 'Check In Now' })) : !todayAttendance?.check_out_time ? (_jsx("button", { onClick: handleCheckOut, disabled: actionLoading, className: "w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-50", children: actionLoading ? 'Processing...' : 'Check Out' })) : (_jsx("div", { className: "w-full text-center py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg", children: "Daily Shift Concluded" })) })] }), _jsxs("div", { className: "lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Leave Entitlements" }), _jsx("span", { className: "text-xs text-slate-500", children: "Current calendar year allocation and usage" })] }), _jsxs(Link, { to: "/app/leaves", className: "text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1", children: [_jsx("span", { children: "View Full Ledger" }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: leaveBalances.map(bal => (_jsxs("div", { className: "p-3.5 rounded-lg border border-slate-100 bg-slate-50/70", children: [_jsx("span", { className: "text-[11px] font-semibold text-slate-500 uppercase tracking-wider block", children: bal.leave_type_name }), _jsxs("div", { className: "mt-2 flex items-baseline gap-1.5", children: [_jsx("span", { className: "text-2xl font-bold font-mono text-slate-900 tabular-nums", children: bal.balance }), _jsxs("span", { className: "text-xs text-slate-500", children: ["/ ", bal.allocated, " days"] })] }), _jsxs("div", { className: "mt-2 text-[11px] text-slate-500 flex items-center justify-between", children: [_jsxs("span", { children: ["Used: ", bal.used, "d"] }), bal.pending > 0 && _jsxs("span", { className: "text-amber-600 font-medium", children: ["Pending: ", bal.pending, "d"] })] })] }, bal.id))) }), _jsxs("div", { className: "mt-5 pt-4 border-t border-slate-100", children: [_jsx("h4", { className: "text-xs font-semibold text-slate-700 mb-2", children: "Recent Leave Applications" }), recentLeaves.length === 0 ? (_jsx("div", { className: "text-xs text-slate-500 py-2", children: "No leave applications recorded this year." })) : (_jsx("div", { className: "space-y-2", children: recentLeaves.slice(0, 3).map(la => (_jsxs("div", { className: "flex items-center justify-between p-2 rounded bg-slate-50 text-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "font-semibold text-slate-800", children: la.leave_type_name }), _jsx("span", { className: "mx-2 text-slate-300", children: "\u00B7" }), _jsxs("span", { className: "text-slate-500", children: [la.start_date, " to ", la.end_date, " (", la.total_days, " days)"] })] }), _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${la.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                                                        la.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`, children: la.status })] }, la.id))) }))] })] })] })), ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'MANAGER'].includes(user?.role || '') && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: user?.role === 'PLATFORM_OWNER' ? "Registered Companies" : "Total Workforce" }), _jsx("div", { className: "mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums", children: user?.role === 'PLATFORM_OWNER' ? (stats?.company_count || 0) : (stats?.totalEmployees || 0) }), _jsxs("span", { className: "text-xs text-slate-500 mt-1 block", children: user?.role === 'PLATFORM_OWNER' ? "Company tenants on Zenora" : [stats?.activeEmployees || 0, " active confirmed"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Present Today" }), _jsx("div", { className: "mt-2 text-2xl font-bold font-mono text-emerald-700 tabular-nums", children: stats?.presentToday || 0 }), _jsxs("span", { className: "text-xs text-slate-500 mt-1 block", children: [stats?.onLeaveToday || 0, " on approved leave"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Pending Approvals" }), _jsx("div", { className: "mt-2 text-2xl font-bold font-mono text-rose-600 tabular-nums", children: stats?.pendingApprovals?.total || 0 }), _jsxs("span", { className: "text-xs text-slate-500 mt-1 block", children: [stats?.pendingApprovals?.leaves || 0, " leaves \u00B7 ", stats?.pendingApprovals?.expenses || 0, " expenses"] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("span", { className: "text-xs font-semibold text-slate-500 uppercase tracking-wider block", children: "Open Tickets" }), _jsx("div", { className: "mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums", children: stats?.openTickets || 0 }), _jsx("span", { className: "text-xs text-slate-500 mt-1 block", children: "HR & IT requests" })] })] }), stats?.pendingApprovals?.total > 0 && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-amber-700 shrink-0" }), _jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-bold text-amber-900", children: ["Action Required: ", stats.pendingApprovals.total, " Request(s) Awaiting Your Review"] }), _jsx("p", { className: "text-xs text-amber-800 mt-0.5", children: "Team members have submitted leave requests or expenses waiting for managerial sign-off." })] })] }), _jsx(Link, { to: "/app/approvals", className: "px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs", children: "Open Approval Center" })] })), stats?.departmentDistribution && stats.departmentDistribution.length > 0 && (_jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-xs", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Department Workforce Distribution" }), _jsx("span", { className: "text-xs text-slate-500", children: "Employee allocation across departments" })] }), _jsx(Link, { to: "/app/employees", className: "text-xs font-semibold text-slate-700 hover:text-slate-900", children: "Directory \u2192" })] }), _jsx("div", { className: "h-64 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: stats.departmentDistribution, margin: { top: 10, right: 10, left: -20, bottom: 0 }, children: [_jsx(XAxis, { dataKey: "name", tick: { fontSize: 12, fill: '#64748b' }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fontSize: 12, fill: '#64748b' }, axisLine: false, tickLine: false }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' } }), _jsx(Bar, { dataKey: "count", fill: "#1e293b", radius: [4, 4, 0, 0] })] }) }) })] }))] }))] }));
};
