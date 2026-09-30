import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, Calendar, Clock, DollarSign, Receipt, Laptop, Headphones, BarChart3, Settings, ShieldCheck, CheckSquare, Fingerprint, Bell, Menu, X, LogOut, Building, Briefcase, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const fetchStatsAndNotifications = async () => {
        try {
            if (user?.role === 'PLATFORM_OWNER') return;
            const notifRes = await api.get('/ops/notifications');
            if (notifRes.data.success) {
                setNotifications(notifRes.data.notifications);
                setUnreadCount(notifRes.data.notifications.filter((n) => n.is_read === 0).length);
            }
            // Fetch pending counts for manager or hr
            if (['MANAGER', 'HR_ADMIN', 'ORG_OWNER', 'PLATFORM_OWNER'].includes(user?.role || '')) {
                const statsRes = await api.get('/organizations/stats');
                if (statsRes.data.success) {
                    setPendingApprovalsCount(statsRes.data.stats.pendingApprovals.total);
                }
            }
        }
        catch (err) {
            // Quiet background failure
        }
    };
    useEffect(() => {
        fetchStatsAndNotifications();
        const interval = setInterval(fetchStatsAndNotifications, 15000);
        return () => clearInterval(interval);
    }, [user]);
    const markAllRead = async () => {
        try {
            await api.put('/ops/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        }
        catch (e) {
            console.error(e);
        }
    };
    // Nav Items definition
    const navItems = [
        { label: 'Overview', path: '/app', icon: BarChart3, roles: ['*'] },
        { label: 'Employees', path: '/app/employees', icon: Users, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'PAYROLL_ADMIN'] },
        { label: 'Attendance', path: '/app/attendance', icon: Clock, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Leave', path: '/app/leaves', icon: Calendar, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        {
            label: 'Approvals',
            path: '/app/approvals',
            icon: CheckSquare,
            badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
            roles: ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'MANAGER']
        },
        { label: 'Payroll & Payslips', path: '/app/payroll', icon: DollarSign, roles: ['ORG_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN', 'EMPLOYEE'] },
        { label: 'Expenses', path: '/app/expenses', icon: Receipt, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Documents & Assets', path: '/app/assets', icon: Laptop, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Operations & ATS', path: '/app/operations', icon: Briefcase, roles: ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'MANAGER'] },
        { label: 'Helpdesk', path: '/app/helpdesk', icon: Headphones, roles: ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Reports', path: '/app/reports', icon: FileSpreadsheet, roles: ['ORG_OWNER', 'HR_ADMIN', 'PAYROLL_ADMIN'] },
        { label: 'Audit Logs', path: '/app/audit-logs', icon: ShieldCheck, roles: ['ORG_OWNER', 'HR_ADMIN'] },
        { label: 'Biometric Attendance', path: '/app/biometric', icon: Fingerprint, roles: ['ORG_OWNER', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
        { label: 'Settings', path: '/app/settings', icon: Settings, roles: ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN'] },
        { label: 'Platform Admin', path: '/app/platform-admin', icon: Building, roles: ['PLATFORM_OWNER'] },
    ];
    const filteredNavItems = navItems.filter(item => {
        if (item.roles.includes('*'))
            return true;
        return user ? item.roles.includes(user.role) : false;
    });
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans", children: [_jsxs("header", { className: "h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "md:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100", "aria-label": "Toggle menu", children: mobileMenuOpen ? _jsx(X, { className: "w-5 h-5" }) : _jsx(Menu, { className: "w-5 h-5" }) }), _jsxs(Link, { to: "/app", className: "flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900", children: [_jsx("div", { className: "w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center text-sm font-extrabold tracking-tighter", children: "Z" }), _jsx("span", { children: "ZENORA" })] }), _jsx("span", { className: "text-slate-300 hidden sm:inline", children: "/" }), _jsxs("div", { className: "hidden sm:flex items-center text-xs text-slate-500 font-medium", children: [_jsx("span", { children: user?.organizationName }), _jsx("span", { className: "mx-2 text-slate-300", children: "\u00B7" }), _jsx("span", { className: "text-slate-900 font-semibold capitalize", children: location.pathname.replace('/app/', '').replace('/app', 'Dashboard') || 'Dashboard' })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setNotificationsOpen(!notificationsOpen), className: "p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors", "aria-label": "Notifications", children: [_jsx(Bell, { className: "w-4 h-4" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white" }))] }), notificationsOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50", children: [_jsxs("div", { className: "px-4 py-2 border-b border-slate-100 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-bold text-slate-900", children: ["Notifications (", unreadCount, " new)"] }), unreadCount > 0 && (_jsx("button", { onClick: markAllRead, className: "text-[11px] text-emerald-600 hover:text-emerald-700 font-medium", children: "Mark all as read" }))] }), _jsx("div", { className: "max-h-80 overflow-y-auto divide-y divide-slate-50", children: notifications.length === 0 ? (_jsx("div", { className: "p-4 text-center text-xs text-slate-500", children: "No notifications yet." })) : (notifications.map(n => (_jsxs("div", { className: `p-3 text-xs hover:bg-slate-50 flex gap-2.5 items-start ${n.is_read === 0 ? 'bg-slate-50/70 font-medium' : 'text-slate-600'}`, children: [_jsx("div", { className: "w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0 opacity-80" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-slate-900 font-semibold text-xs leading-snug", children: n.title }), _jsx("p", { className: "text-slate-600 text-[11px] mt-0.5 leading-relaxed", children: n.message }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] })] }, n.id)))) })] }))] }), _jsx("div", { className: "h-6 w-[1px] bg-slate-200" }), _jsxs("div", { className: "flex items-center gap-2.5", children: [user?.avatarUrl ? (_jsx("img", { src: user.avatarUrl, alt: `${user.firstName} ${user.lastName}`, className: "w-8 h-8 rounded-full object-cover border border-slate-200", referrerPolicy: "no-referrer" })) : (_jsx("div", { className: "w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs", children: user?.firstName?.[0] || 'U' })), _jsxs("div", { className: "hidden lg:flex flex-col text-left", children: [_jsxs("span", { className: "text-xs font-semibold text-slate-900 leading-tight", children: [user?.firstName, " ", user?.lastName] }), _jsx("span", { className: "text-[10px] text-slate-500 leading-tight", children: user?.role?.replace('_', ' ') })] }), _jsx("button", { onClick: logout, title: "Logout", className: "p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })] })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [_jsxs("aside", { className: "w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0", children: [_jsxs("div", { className: "p-4 border-b border-slate-100", children: [_jsx("div", { className: "text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1", children: "Workforce Navigation" }), _jsx("div", { className: "text-xs font-bold text-slate-800 truncate", children: user?.organizationName })] }), _jsx("nav", { className: "flex-1 p-3 space-y-1 overflow-y-auto", children: filteredNavItems.map(item => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
                                    return (_jsxs(Link, { to: item.path, className: `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive
                                            ? 'bg-slate-900 text-white font-semibold shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5 truncate", children: [_jsx(Icon, { className: `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}` }), _jsx("span", { className: "truncate", children: item.label })] }), item.badge !== undefined && (_jsx("span", { className: `text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'}`, children: item.badge }))] }, item.path));
                                }) }), _jsx("div", { className: "p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Zenora Cloud v1.0" }), _jsx("span", { className: "font-mono text-emerald-600 font-semibold", children: "Active" })] }) })] }), mobileMenuOpen && (_jsx("div", { className: "fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden", onClick: () => setMobileMenuOpen(false), children: _jsxs("div", { className: "w-64 bg-white h-full flex flex-col p-4 shadow-xl", onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-slate-100", children: [_jsx("span", { className: "font-bold text-slate-900", children: "Navigation" }), _jsx("button", { onClick: () => setMobileMenuOpen(false), className: "p-1 rounded-md text-slate-500", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("nav", { className: "flex-1 py-4 space-y-1 overflow-y-auto", children: filteredNavItems.map(item => {
                                        const Icon = item.icon;
                                        const isActive = location.pathname === item.path;
                                        return (_jsxs(Link, { to: item.path, onClick: () => setMobileMenuOpen(false), className: `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: item.label })] }), item.badge !== undefined && (_jsx("span", { className: "text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold", children: item.badge }))] }, item.path));
                                    }) })] }) })), _jsx("main", { className: "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full", children: _jsx(Outlet, {}) })] })] }));
};
