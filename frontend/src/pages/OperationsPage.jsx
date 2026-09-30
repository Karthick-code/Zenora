import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, CheckSquare, Headphones, Plus, Send, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
export const OperationsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('recruitment');
    const [loading, setLoading] = useState(true);
    // Data states
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [cycles, setCycles] = useState([]);
    const [goals, setGoals] = useState([]);
    const [onboardingTasks, setOnboardingTasks] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketComments, setTicketComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    // Modals
    const [newTicketModal, setNewTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Payroll', description: '', priority: 'MEDIUM' });
    const loadData = async () => {
        setLoading(true);
        try {
            const [jobsRes, candRes, cycleRes, goalRes, onbRes, tickRes] = await Promise.all([
                api.get('/ops/recruitment/jobs'),
                api.get('/ops/recruitment/candidates'),
                api.get('/ops/performance/cycles'),
                api.get('/ops/performance/goals'),
                api.get('/ops/onboarding/tasks'),
                api.get('/ops/helpdesk/tickets')
            ]);
            if (jobsRes.data.success)
                setJobs(jobsRes.data.jobs);
            if (candRes.data.success)
                setCandidates(candRes.data.candidates);
            if (cycleRes.data.success)
                setCycles(cycleRes.data.cycles);
            if (goalRes.data.success)
                setGoals(goalRes.data.goals);
            if (onbRes.data.success)
                setOnboardingTasks(onbRes.data.tasks);
            if (tickRes.data.success)
                setTickets(tickRes.data.tickets);
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
    const viewTicket = async (ticket) => {
        setSelectedTicket(ticket);
        try {
            const res = await api.get(`/ops/helpdesk/tickets/${ticket.id}/comments`);
            if (res.data.success)
                setTicketComments(res.data.comments);
        }
        catch (e) {
            console.error(e);
        }
    };
    const postComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTicket)
            return;
        try {
            const res = await api.post(`/ops/helpdesk/tickets/${selectedTicket.id}/comments`, { message: newComment });
            if (res.data.success) {
                setNewComment('');
                viewTicket(selectedTicket);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/ops/helpdesk/tickets', ticketForm);
            if (res.data.success) {
                setNewTicketModal(false);
                setTicketForm({ subject: '', category: 'Payroll', description: '', priority: 'MEDIUM' });
                loadData();
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    const updateCandidateStage = async (id, stage) => {
        try {
            await api.put(`/ops/recruitment/candidates/${id}/stage`, { stage });
            loadData();
        }
        catch (e) {
            console.error(e);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold tracking-tight text-slate-900", children: "Workforce Operations & ATS" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Recruitment pipeline, performance reviews, onboarding workflows, and HR helpdesk." })] }), activeTab === 'helpdesk' && (_jsxs("button", { onClick: () => setNewTicketModal(true), className: "px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create Support Ticket" })] }))] }), _jsxs("div", { className: "flex border-b border-slate-200 text-xs font-semibold", children: [_jsxs("button", { onClick: () => setActiveTab('recruitment'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'recruitment' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Briefcase, { className: "w-4 h-4" }), _jsxs("span", { children: ["ATS Recruitment (", jobs.length, " roles)"] })] }), _jsxs("button", { onClick: () => setActiveTab('performance'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'performance' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Performance & OKRs" })] }), _jsxs("button", { onClick: () => setActiveTab('onboarding'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'onboarding' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(CheckSquare, { className: "w-4 h-4" }), _jsxs("span", { children: ["Onboarding Tasks (", onboardingTasks.length, ")"] })] }), _jsxs("button", { onClick: () => setActiveTab('helpdesk'), className: `py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'helpdesk' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`, children: [_jsx(Headphones, { className: "w-4 h-4" }), _jsxs("span", { children: ["HR Helpdesk (", tickets.length, ")"] })] })] }), activeTab === 'recruitment' && (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: jobs.map(job => (_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold", children: [job.status, " \u00B7 ", job.openings_count, " Openings"] }), _jsx("span", { className: "text-xs text-slate-400 font-medium", children: job.employment_type })] }), _jsx("h3", { className: "text-sm font-bold text-slate-900 mt-2", children: job.title }), _jsx("p", { className: "text-xs text-slate-500 mt-1 line-clamp-2", children: job.description }), _jsxs("div", { className: "mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600", children: [_jsxs("span", { children: [job.department_name || 'Engineering', " \u00B7 ", job.location_name || 'HQ'] }), _jsxs("span", { className: "font-semibold text-slate-800", children: [job.candidates_count || 0, " Applicants"] })] })] }, job.id))) }), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden", children: [_jsx("div", { className: "p-4 border-b border-slate-100", children: _jsx("h3", { className: "text-xs font-bold text-slate-900 uppercase tracking-wider", children: "Candidate Pipeline" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Candidate" }), _jsx("th", { className: "py-3 px-4", children: "Role Applied" }), _jsx("th", { className: "py-3 px-4", children: "Contact" }), _jsx("th", { className: "py-3 px-4", children: "Stage" }), _jsx("th", { className: "py-3 px-4", children: "Evaluation Rating" }), _jsx("th", { className: "py-3 px-4", children: "Pipeline Action" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: candidates.map(cand => (_jsxs("tr", { className: "hover:bg-slate-50/60 transition-colors", children: [_jsxs("td", { className: "py-3 px-4 font-semibold text-slate-900", children: [cand.first_name, " ", cand.last_name] }), _jsx("td", { className: "py-3 px-4 font-medium text-slate-800", children: cand.job_title }), _jsx("td", { className: "py-3 px-4 text-slate-500 font-mono text-[11px]", children: cand.email }), _jsx("td", { className: "py-3 px-4", children: _jsx("span", { className: "text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800", children: cand.stage }) }), _jsxs("td", { className: "py-3 px-4 font-mono font-bold text-slate-800", children: ["\u2605 ", cand.rating, " / 5.0"] }), _jsx("td", { className: "py-3 px-4", children: _jsxs("select", { value: cand.stage, onChange: e => updateCandidateStage(cand.id, e.target.value), className: "p-1 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-800", children: [_jsx("option", { value: "APPLIED", children: "APPLIED" }), _jsx("option", { value: "SCREENING", children: "SCREENING" }), _jsx("option", { value: "INTERVIEW", children: "INTERVIEW" }), _jsx("option", { value: "TECHNICAL", children: "TECHNICAL" }), _jsx("option", { value: "HR", children: "HR ROUND" }), _jsx("option", { value: "OFFER", children: "OFFER EXTENDED" }), _jsx("option", { value: "HIRED", children: "HIRED" }), _jsx("option", { value: "REJECTED", children: "REJECTED" })] }) })] }, cand.id))) })] }) })] })] })), activeTab === 'performance' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Active Review Cycle: H1 2026 Global OKR & Growth Cycle" }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Goal setting, self-assessment, managerial rating, and calibrated review feedback." })] }), _jsx("div", { className: "space-y-3", children: goals.map(g => (_jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-semibold text-slate-900 text-sm", children: g.title }), _jsxs("span", { className: "text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold", children: [g.status, " \u00B7 Weight: ", g.weight, "%"] })] }), _jsx("p", { className: "text-xs text-slate-600", children: g.description }), _jsxs("div", { className: "pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500", children: [_jsxs("span", { children: ["Assigned Member: ", _jsxs("strong", { children: [g.first_name, " ", g.last_name] })] }), _jsxs("span", { children: ["Self Rating: ", _jsxs("strong", { className: "font-mono text-slate-900", children: [g.self_rating || 'Pending', " / 5.0"] })] })] })] }, g.id))) })] })), activeTab === 'onboarding' && (_jsxs("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Corporate Employee Onboarding Checklist" }), _jsx("p", { className: "text-xs text-slate-500 mt-0.5", children: "Automated workflow executed upon new employee registration." })] }), _jsx("div", { className: "divide-y divide-slate-100", children: onboardingTasks.map((t, idx) => (_jsxs("div", { className: "py-3 flex items-start gap-3 text-xs", children: [_jsx("div", { className: "w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5", children: idx + 1 }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-slate-900", children: t.title }), _jsx("p", { className: "text-slate-500 text-[11px] mt-0.5", children: t.description }), _jsxs("span", { className: "text-[10px] font-mono text-slate-400 mt-1 block", children: ["Category: ", t.category] })] })] }, t.id))) })] })), activeTab === 'helpdesk' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-xs font-bold text-slate-500 uppercase tracking-wider", children: "Tickets Queue" }), tickets.map(t => (_jsxs("div", { onClick: () => viewTicket(t), className: `p-4 rounded-xl border cursor-pointer transition-all ${selectedTicket?.id === t.id
                                    ? 'border-slate-900 bg-slate-50 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300'}`, children: [_jsxs("div", { className: "flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-mono text-[11px] font-bold text-slate-700", children: t.ticket_number }), _jsx("span", { className: `text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`, children: t.status })] }), _jsx("h4", { className: "font-semibold text-slate-900 text-xs mt-1", children: t.subject }), _jsx("p", { className: "text-[11px] text-slate-500 mt-0.5 line-clamp-1", children: t.description }), _jsxs("div", { className: "mt-2 text-[10px] text-slate-400 font-mono", children: [t.first_name, " ", t.last_name, " \u00B7 Priority: ", t.priority] })] }, t.id)))] }), _jsx("div", { className: "bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between min-h-[350px]", children: selectedTicket ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border-b border-slate-100 pb-3", children: [_jsx("span", { className: "text-[11px] font-mono text-slate-400 font-bold", children: selectedTicket.ticket_number }), _jsx("h3", { className: "font-bold text-slate-900 text-sm", children: selectedTicket.subject }), _jsx("p", { className: "text-xs text-slate-600 mt-1", children: selectedTicket.description })] }), _jsx("div", { className: "space-y-2.5 max-h-60 overflow-y-auto pr-1", children: ticketComments.map(c => (_jsxs("div", { className: "p-3 bg-slate-50 rounded-lg text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [_jsxs("span", { className: "font-semibold text-slate-800", children: [c.first_name, " ", c.last_name, " (", c.role, ")"] }), _jsx("span", { className: "text-slate-400 font-mono", children: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })] }), _jsx("p", { className: "text-slate-700", children: c.message })] }, c.id))) })] }), _jsxs("form", { onSubmit: postComment, className: "mt-4 pt-3 border-t border-slate-100 flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Reply to ticket thread...", value: newComment, onChange: e => setNewComment(e.target.value), className: "flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" }), _jsx("button", { type: "submit", className: "p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800", children: _jsx(Send, { className: "w-4 h-4" }) })] })] })) : (_jsx("div", { className: "m-auto text-center text-xs text-slate-400", children: "Select a ticket to review message thread or reply." })) })] })), newTicketModal && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("form", { onSubmit: handleCreateTicket, className: "bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50", children: [_jsx("h3", { className: "text-sm font-bold text-slate-900", children: "Create Helpdesk Request" }), _jsx("button", { type: "button", onClick: () => setNewTicketModal(false), children: _jsx(X, { className: "w-5 h-5 text-slate-400" }) })] }), _jsxs("div", { className: "p-5 space-y-4 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Subject *" }), _jsx("input", { type: "text", required: true, placeholder: "e.g. Tax Certificate Form 16 Request", value: ticketForm.subject, onChange: e => setTicketForm({ ...ticketForm, subject: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Category" }), _jsxs("select", { value: ticketForm.category, onChange: e => setTicketForm({ ...ticketForm, category: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: [_jsx("option", { value: "Payroll", children: "Payroll & Compensation" }), _jsx("option", { value: "Leave", children: "Leave Policy" }), _jsx("option", { value: "Attendance", children: "Attendance & Biometrics" }), _jsx("option", { value: "IT", children: "IT Hardware & Workstation" }), _jsx("option", { value: "General", children: "General HR" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Priority" }), _jsxs("select", { value: ticketForm.priority, onChange: e => setTicketForm({ ...ticketForm, priority: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900", children: [_jsx("option", { value: "LOW", children: "LOW" }), _jsx("option", { value: "MEDIUM", children: "MEDIUM" }), _jsx("option", { value: "HIGH", children: "HIGH" }), _jsx("option", { value: "URGENT", children: "URGENT" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold text-slate-700 mb-1", children: "Description *" }), _jsx("textarea", { rows: 3, required: true, placeholder: "Detailed description of your support inquiry...", value: ticketForm.description, onChange: e => setTicketForm({ ...ticketForm, description: e.target.value }), className: "w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900" })] })] }), _jsxs("div", { className: "p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setNewTicketModal(false), className: "px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold", children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800", children: "Submit Ticket" })] })] }) }))] }));
};
