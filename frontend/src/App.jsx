import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavesPage } from './pages/LeavesPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { PayrollPage } from './pages/PayrollPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DocumentsAssetsPage } from './pages/DocumentsAssetsPage';
import { OperationsPage } from './pages/OperationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlatformAdminPage } from './pages/PlatformAdminPage';
import { BiometricPage } from './pages/BiometricPage';
import { AuthPage } from './pages/AuthPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
// Protected Route Guard
const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "Initializing Zenora Workforce Session..." })] }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export const App = () => {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(AuthPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsxs(Route, { path: "/app", element: _jsx(ProtectedRoute, { children: _jsx(DashboardLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "employees", element: _jsx(EmployeesPage, {}) }), _jsx(Route, { path: "attendance", element: _jsx(AttendancePage, {}) }), _jsx(Route, { path: "leaves", element: _jsx(LeavesPage, {}) }), _jsx(Route, { path: "approvals", element: _jsx(ApprovalsPage, {}) }), _jsx(Route, { path: "payroll", element: _jsx(PayrollPage, {}) }), _jsx(Route, { path: "expenses", element: _jsx(ExpensesPage, {}) }), _jsx(Route, { path: "assets", element: _jsx(DocumentsAssetsPage, {}) }), _jsx(Route, { path: "operations", element: _jsx(OperationsPage, {}) }), _jsx(Route, { path: "helpdesk", element: _jsx(OperationsPage, {}) }), _jsx(Route, { path: "reports", element: _jsx(ReportsPage, {}) }), _jsx(Route, { path: "audit-logs", element: _jsx(AuditLogsPage, {}) }), _jsx(Route, { path: "biometric", element: _jsx(BiometricPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "platform-admin", element: _jsx(PlatformAdminPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/app", replace: true }) })] }) }) }));
};
export default App;
