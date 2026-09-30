import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Laptop, FileText, Plus, UserCheck, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const DocumentsAssetsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('documents');
    const [documents, setDocuments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    // Modals
    const [docModalOpen, setDocModalOpen] = useState(false);
    const [assetModalOpen, setAssetModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);
    // New Doc Form
    const [docForm, setDocForm] = useState({
        title: '',
        category: 'CONTRACT',
        fileName: 'document.pdf',
        employeeId: user?.employeeId || ''
    });
    // New Asset Form
    const [assetForm, setAssetForm] = useState({
        name: 'Apple MacBook Pro 16" M3 Max',
        assetTag: 'ACME-LAP-105',
        category: 'LAPTOP',
        serialNumber: 'C02K98273618',
        condition: 'EXCELLENT',
        assignedEmployeeId: ''
    });
    const loadData = async () => {
        setLoading(true);
        try {
            const [docRes, assetRes, empRes] = await Promise.all([
                api.get('/services/documents'),
                api.get('/services/assets'),
                api.get('/employees')
            ]);
            if (docRes.data.success)
                setDocuments(docRes.data.documents);
            if (assetRes.data.success)
                setAssets(assetRes.data.assets);
            if (empRes.data.success)
                setEmployees(empRes.data.employees);
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
    const handleCreateDocument = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await api.post('/services/documents', {
                ...docForm,
                fileUrl: '#'
            });
            if (res.data.success) {
                setFeedback({ type: 'success', text: 'Document record stored securely.' });
                setDocModalOpen(false);
                loadData();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to upload document.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const handleCreateAsset = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const res = await api.post('/services/assets', assetForm);
            if (res.data.success) {
                setFeedback({ type: 'success', text: 'Asset added to company inventory.' });
                setAssetModalOpen(false);
                loadData();
            }
        }
        catch (err) {
            setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to create asset.' });
        }
        finally {
            setActionLoading(false);
        }
    };
    const isHrOrOwner = ['PLATFORM_OWNER', 'ORG_OWNER', 'HR_ADMIN'].includes(user?.role || '');
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Documents & Asset Inventory" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Encrypted corporate files, employment contracts, identity verifications, and company hardware tracking." })] }), _jsx("div", { className: "flex items-center gap-2", children: activeTab === 'documents' ? (_jsxs("button", { onClick: () => setDocModalOpen(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Upload Document" })] })) : isHrOrOwner && (_jsxs("button", { onClick: () => setAssetModalOpen(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Register Hardware Asset" })] })) })] }), feedback && (_jsxs("div", { className: `p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`, children: [feedback.type === 'success' ? _jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }) : _jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: feedback.text })] })), _jsxs("div", { className: "flex border-b border-slate-200 text-xs font-semibold", children: [_jsxs("button", { onClick: () => setActiveTab('documents'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'documents' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(FileText, { className: "w-4 h-4" }), _jsxs("span", { children: ["Documents & Handbooks (", documents.length, ")"] })] }), _jsxs("button", { onClick: () => setActiveTab('assets'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'assets' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Laptop, { className: "w-4 h-4" }), _jsxs("span", { children: ["Hardware & Assets (", assets.length, ")"] })] })] }), activeTab === 'documents' && (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Document Title" }), _jsx("th", { className: "py-3 px-4", children: "Associated Member" }), _jsx("th", { className: "py-3 px-4", children: "Category" }), _jsx("th", { className: "py-3 px-4", children: "File Name & Size" }), _jsx("th", { className: "py-3 px-4", children: "Uploaded Date" }), _jsx("th", { className: "py-3 px-4 text-center", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: documents.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "py-8 text-center text-slate-500", children: "No documents found." }) })) : (documents.map(doc => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsx("td", { className: "py-3 px-4", children: _jsxs("div", { className: "font-semibold text-slate-900 flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { children: doc.title })] }) }), _jsx("td", { className: "py-3 px-4", children: doc.first_name ? (_jsxs("span", { className: "font-medium text-slate-800", children: [doc.first_name, " ", doc.last_name] })) : (_jsx("span", { className: "text-slate-500 italic", children: "Organization-wide" })) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold", children: doc.category }) }), _jsxs("td", { className: "py-3 px-4 font-mono text-slate-600 text-[11px]", children: [doc.file_name, " \u00B7 ", Math.round(doc.file_size / 1024), " KB"] }), _jsx("td", { className: "py-3 px-4 font-mono text-slate-500", children: new Date(doc.created_at).toLocaleDateString() }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsxs("button", { onClick: () => alert(`Accessing signed secure token for ${doc.file_name}`), className: "px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold inline-flex items-center gap-1", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Download" })] }) })] }, doc.id)))) })] }) }) })), activeTab === 'assets' && (_jsx("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Asset Name" }), _jsx("th", { className: "py-3 px-4", children: "Asset Tag" }), _jsx("th", { className: "py-3 px-4", children: "Serial Number" }), _jsx("th", { className: "py-3 px-4", children: "Category" }), _jsx("th", { className: "py-3 px-4", children: "Assigned To" }), _jsx("th", { className: "py-3 px-4", children: "Condition" }), _jsx("th", { className: "py-3 px-4", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: assets.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "py-8 text-center text-slate-500", children: "No assets registered in inventory." }) })) : (assets.map(ast => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsx("td", { className: "py-3 px-4 font-semibold text-slate-900", children: ast.name }), _jsx("td", { className: "py-3 px-4 font-mono font-medium text-slate-800", children: ast.asset_tag }), _jsx("td", { className: "py-3 px-4 font-mono text-slate-500", children: ast.serial_number || 'N/A' }), _jsx("td", { className: "py-3 px-4 font-medium text-slate-700", children: ast.category }), _jsx("td", { className: "py-3 px-4", children: ast.first_name ? (_jsxs("div", { className: "flex items-center gap-1.5 font-medium text-slate-900", children: [_jsx(UserCheck, { className: "w-3.5 h-3.5 text-emerald-600" }), _jsxs("span", { children: [ast.first_name, " ", ast.last_name] })] })) : (_jsx("span", { className: "text-slate-400 italic", children: "Unassigned (In IT Store)" })) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "text-[11px] font-mono text-slate-700", children: ast.condition }) }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: `text-[10px] font-mono font-bold px-2 py-0.5 rounded ${ast.status === 'ASSIGNED'
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : ast.status === 'AVAILABLE'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-amber-50 text-amber-700'}`, children: ast.status }) })] }, ast.id)))) })] }) }) })), docModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleCreateDocument, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Add Document Metadata" }), _jsx("button", { type: "button", onClick: () => setDocModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Document Title *" }), _jsx("input", { type: "text", required: true, placeholder: "e.g. Passport Copy, Employment Agreement", value: docForm.title, onChange: e => setDocForm({ ...docForm, title: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Category *" }), _jsxs("select", { value: docForm.category, onChange: e => setDocForm({ ...docForm, category: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: [_jsx("option", { value: "CONTRACT", children: "CONTRACT" }), _jsx("option", { value: "IDENTITY", children: "IDENTITY / PASSPORT" }), _jsx("option", { value: "TAX", children: "TAX DOCUMENT" }), _jsx("option", { value: "EDUCATION", children: "EDUCATION DEGREE" }), _jsx("option", { value: "POLICY", children: "COMPANY POLICY" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Associated Member" }), _jsxs("select", { value: docForm.employeeId, onChange: e => setDocForm({ ...docForm, employeeId: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: [_jsx("option", { value: "", children: "Company-wide (All employees)" }), employees.map(emp => (_jsxs("option", { value: emp.id, children: [emp.first_name, " ", emp.last_name] }, emp.id)))] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Simulated File Upload" }), _jsx("input", { type: "text", value: docForm.fileName, onChange: e => setDocForm({ ...docForm, fileName: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900" })] }), _jsx("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600", children: "In compliance with Section 30, documents are protected via authorization middleware with access restricted strictly to the employee, their manager, and HR." })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setDocModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading, className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Saving...' : 'Upload Document' })] })] }) })), assetModalOpen && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleCreateAsset, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Add Equipment to Inventory" }), _jsx("button", { type: "button", onClick: () => setAssetModalOpen(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Asset Name *" }), _jsx("input", { type: "text", required: true, value: assetForm.name, onChange: e => setAssetForm({ ...assetForm, name: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Asset Tag *" }), _jsx("input", { type: "text", required: true, value: assetForm.assetTag, onChange: e => setAssetForm({ ...assetForm, assetTag: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Serial Number" }), _jsx("input", { type: "text", value: assetForm.serialNumber, onChange: e => setAssetForm({ ...assetForm, serialNumber: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Category" }), _jsxs("select", { value: assetForm.category, onChange: e => setAssetForm({ ...assetForm, category: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg", children: [_jsx("option", { value: "LAPTOP", children: "LAPTOP" }), _jsx("option", { value: "MONITOR", children: "MONITOR" }), _jsx("option", { value: "MOBILE", children: "MOBILE PHONE" }), _jsx("option", { value: "ACCESSORY", children: "ACCESSORY" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Assign to Employee" }), _jsxs("select", { value: assetForm.assignedEmployeeId, onChange: e => setAssetForm({ ...assetForm, assignedEmployeeId: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg", children: [_jsx("option", { value: "", children: "Unassigned (Inventory Store)" }), employees.map(emp => (_jsxs("option", { value: emp.id, children: [emp.first_name, " ", emp.last_name] }, emp.id)))] })] })] })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setAssetModalOpen(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", disabled: actionLoading, className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 disabled:opacity-50", children: actionLoading ? 'Saving...' : 'Register Asset' })] })] }) }))] }));
};
