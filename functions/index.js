import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import crypto from 'node:crypto';

initializeApp();
const db = getFirestore();
const adminAuth = getAuth();

const EMAILJS_SERVICE_ID = defineSecret('EMAILJS_SERVICE_ID');
const EMAILJS_TEMPLATE_ID = defineSecret('EMAILJS_TEMPLATE_ID');
const EMAILJS_PUBLIC_KEY = defineSecret('EMAILJS_PUBLIC_KEY');
const EMAILJS_PRIVATE_KEY = defineSecret('EMAILJS_PRIVATE_KEY');
const SLACK_WEBHOOK_URL = defineSecret('SLACK_WEBHOOK_URL');
const APP_BASE_URL = defineSecret('APP_BASE_URL');

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;
const clean = (v) => String(v ?? '').trim();
const email = (v) => clean(v).toLowerCase();
const publicUser = (u) => ({
  id: u.id || u.uid,
  uid: u.uid || u.id,
  organization_id: u.organization_id || u.organizationId || null,
  email: u.email,
  role: u.role,
  first_name: u.first_name || u.firstName || '',
  last_name: u.last_name || u.lastName || '',
  employee_id: u.employee_id || u.employeeId || null,
  employee_code: u.employee_code || u.employeeCode || null,
  is_active: u.is_active ?? true,
  firstName: u.first_name || u.firstName || '',
  lastName: u.last_name || u.lastName || '',
  organizationName: u.organization_name || '',
  employeeId: u.employee_id || u.employeeId || null,
  employeeCode: u.employee_code || u.employeeCode || null,
  avatarUrl: u.avatar_url || u.avatarUrl || '',
});

async function getProfile(uid) {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? { id: snap.id, ...snap.data() } : null;
}

async function authContext(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const profile = await getProfile(request.auth.uid);
  if (!profile || profile.is_active === false) throw new HttpsError('permission-denied', 'Your Zenora account is inactive or not configured.');
  return profile;
}

function assertCompanyRole(profile, roles = []) {
  if (profile.role === 'PLATFORM_OWNER') throw new HttpsError('permission-denied', 'Platform administrators cannot access company workforce records.');
  if (roles.length && !roles.includes(profile.role)) throw new HttpsError('permission-denied', 'You are not authorized for this action.');
}

async function sendEmailJs({ toEmail, toName, resetLink, companyName, expiresMinutes = 60 }) {
  const body = {
    service_id: EMAILJS_SERVICE_ID.value(),
    template_id: EMAILJS_TEMPLATE_ID.value(),
    user_id: EMAILJS_PUBLIC_KEY.value(),
    accessToken: EMAILJS_PRIVATE_KEY.value(),
    template_params: {
      to_email: toEmail,
      to_name: toName || toEmail,
      reset_link: resetLink,
      company_name: companyName || 'Zenora',
      expires_minutes: expiresMinutes,
    },
  };
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`EmailJS failed with ${response.status}: ${await response.text()}`);
}

async function notifySlack(text, fields = {}) {
  const url = SLACK_WEBHOOK_URL.value();
  if (!url) return;
  const lines = Object.entries(fields).filter(([,v]) => v !== undefined && v !== null && v !== '').map(([k,v]) => `*${k}:* ${v}`);
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: [text, ...lines].join('\n') }) });
}

function tenantRef(orgId) { return db.collection('organizations').doc(orgId); }
function col(name, orgId) { return tenantRef(orgId).collection(name); }

async function findOrg({ companySlug, tenantDomain }) {
  const slug = clean(companySlug).toLowerCase();
  const domain = clean(tenantDomain).toLowerCase();
  let snap;
  if (slug) snap = await db.collection('organizations').where('slug', '==', slug).limit(1).get();
  else if (domain) snap = await db.collection('organizations').where('tenant_domain', '==', domain).limit(1).get();
  if (!snap?.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  return null;
}

async function resolveLogin(identifier, companySlug) {
  const value = clean(identifier);
  if (value.includes('@')) return email(value);
  const org = await findOrg({ companySlug });
  if (!org) throw new HttpsError('not-found', 'Company workspace is required when using an employee ID.');
  const snap = await col('employees', org.id).where('employee_code', '==', value).limit(1).get();
  if (snap.empty) throw new HttpsError('not-found', 'Employee ID or company workspace was not found.');
  const employee = snap.docs[0].data();
  if (!employee.user_id) throw new HttpsError('failed-precondition', 'This employee does not have a login account yet.');
  const user = await getProfile(employee.user_id);
  if (!user?.email) throw new HttpsError('failed-precondition', 'Employee login profile is incomplete.');
  return user.email;
}

async function registerCompany(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const p = await getProfile(request.auth.uid);
  if (p?.organization_id) throw new HttpsError('already-exists', 'This account is already attached to a company.');
  const b = request.data?.body || {};
  if (request.auth.uid !== b.firebaseUid) throw new HttpsError('permission-denied', 'Registration session mismatch.');
  const name = clean(b.companyName);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  if (!name || !slug) throw new HttpsError('invalid-argument', 'Company name is required.');
  const existing = await db.collection('organizations').where('slug', '==', slug).limit(1).get();
  if (!existing.empty) throw new HttpsError('already-exists', 'A company with that workspace name already exists.');
  const orgId = id('org');
  const tenantDomain = `${slug}.zenora.com`;
  const org = {
    name, slug, tenant_domain: tenantDomain, custom_domain: '', domain_status: 'SYSTEM_SUBDOMAIN',
    industry: b.industry || 'Technology & Software', company_size: b.companySize || '25-100',
    status: 'ACTIVE', subscription_plan: 'GROWTH', subscription_status: 'ACTIVE', created_at: now(), updated_at: now(),
  };
  await tenantRef(orgId).set(org);
  await db.collection('users').doc(request.auth.uid).set({
    email: email(b.email), role: 'ORG_OWNER', organization_id: orgId, first_name: clean(b.firstName), last_name: clean(b.lastName), is_active: true, created_at: now(), updated_at: now(),
  });
  await notifySlack('New Zenora company registered', { Company: name, Workspace: slug, Owner: email(b.email) });
  return { success: true, tenantUrl: `https://${tenantDomain}`, tenantDomain, tenantSlug: slug };
}

async function getMe(request) {
  const p = await authContext(request);
  let employee = null;
  if (p.organization_id && p.employee_id) {
    const snap = await col('employees', p.organization_id).doc(p.employee_id).get();
    if (snap.exists) employee = { id: snap.id, ...snap.data() };
  }
  let organizationName = '';
  if (p.organization_id) { const orgSnap = await tenantRef(p.organization_id).get(); organizationName = orgSnap.exists ? (orgSnap.data().name || '') : ''; }
  return { success: true, user: { ...publicUser({ ...p, organization_name: organizationName }), employee } };
}

async function forgotPassword(request) {
  const b = request.data?.body || {};
  const identifier = clean(b.identifier);
  const companySlug = clean(b.companySlug);
  let targetEmail = identifier.includes('@') ? email(identifier) : await resolveLogin(identifier, companySlug);
  let record = null;
  const users = await db.collection('users').where('email', '==', targetEmail).limit(1).get();
  if (!users.empty) record = { id: users.docs[0].id, ...users.docs[0].data() };
  // Deliberately generic response for privacy.
  if (!record) return { success: true, message: 'If the account exists, a reset link has been sent to the registered email.' };
  const userRecord = await adminAuth.getUserByEmail(targetEmail);
  const firebaseLink = await adminAuth.generatePasswordResetLink(targetEmail, {
    url: `${APP_BASE_URL.value()}/reset-password`,
    handleCodeInApp: true,
  });
  const parsed = new URL(firebaseLink);
  const oobCode = parsed.searchParams.get('oobCode');
  const link = `${APP_BASE_URL.value()}/reset-password?mode=resetPassword&oobCode=${encodeURIComponent(oobCode || '')}`;
  const org = record.organization_id ? await tenantRef(record.organization_id).get() : null;
  await sendEmailJs({ toEmail: targetEmail, toName: `${record.first_name || ''} ${record.last_name || ''}`.trim(), resetLink: link, companyName: org?.data()?.name || 'Zenora' });
  await db.collection('password_reset_requests').add({
    organization_id: record.organization_id || null, user_id: userRecord.uid, email: targetEmail, status: 'SENT', requested_at: now(), created_at: now(),
  });
  await notifySlack('Zenora password reset requested', { User: targetEmail, Company: org?.data()?.name || 'Platform' });
  return { success: true, message: 'If the account exists, a reset link has been sent to the registered email.' };
}

async function createEmployee(request, profile) {
  assertCompanyRole(profile, ['ORG_OWNER', 'HR_ADMIN']);
  const b = request.data?.body || {};
  if (!b.firstName || !b.lastName || !b.email || !b.joiningDate) throw new HttpsError('invalid-argument', 'First name, last name, email, and joining date are required.');
  const orgId = profile.organization_id;
  const employeeCode = clean(b.employeeCode) || `EMP-${String((await col('employees', orgId).count().get()).data().count + 1).padStart(3,'0')}`;
  const duplicate = await col('employees', orgId).where('employee_code', '==', employeeCode).limit(1).get();
  if (!duplicate.empty) throw new HttpsError('already-exists', 'That employee ID already exists in your company. Employee IDs may be reused by other companies.');
  let userId = null;
  if (b.createLoginAccount) {
    try {
      const authUser = await adminAuth.createUser({ email: email(b.email), password: `Z${crypto.randomUUID()}a1!`, displayName: `${b.firstName} ${b.lastName}` });
      userId = authUser.uid;
      await db.collection('users').doc(userId).set({ email: email(b.email), role: b.role || 'EMPLOYEE', organization_id: orgId, employee_id: null, first_name: b.firstName, last_name: b.lastName, is_active: true, created_at: now(), updated_at: now() });
    } catch (err) {
      if (err.code === 'auth/email-already-exists') throw new HttpsError('already-exists', 'That email is already used by a Zenora login.');
      throw err;
    }
  }
  const employeeId = id('emp');
  const employee = {
    employee_code: employeeCode, user_id: userId, first_name: clean(b.firstName), last_name: clean(b.lastName), email: email(b.email), phone: b.phone || '', gender: b.gender || '', date_of_birth: b.dateOfBirth || '', joining_date: b.joiningDate,
    department_id: b.departmentId || '', designation_id: b.designationId || '', location_id: b.locationId || '', shift_id: b.shiftId || '', reporting_manager_id: b.reportingManagerId || '', team_head_id: b.teamHeadId || b.reportingManagerId || '', employment_type: b.employmentType || 'FULL_TIME', employment_status: b.employmentStatus || 'ACTIVE', base_salary: Number(b.baseSalary || 0), bank_name: b.bankName || '', bank_account_no: b.bankAccountNo || '', bank_ifsc: b.bankIfsc || '', pan_tax_id: b.panTaxId || '', pf_uan_number: b.pfUanNumber || '', created_at: now(), updated_at: now(),
  };
  await col('employees', orgId).doc(employeeId).set(employee);
  if (userId) await db.collection('users').doc(userId).update({ employee_id: employeeId });
  await notifySlack('Employee registered in Zenora', { Company: profile.organization_id, Employee: `${employee.first_name} ${employee.last_name}`, 'Employee ID': employeeCode });
  return { success: true, employee: { id: employeeId, ...employee } };
}

const simpleCollections = {
  '/expenses': 'expenses',
  '/ops/recruitment/jobs': 'recruitment_jobs',
  '/ops/recruitment/candidates': 'recruitment_candidates',
  '/ops/performance/cycles': 'performance_cycles',
  '/ops/performance/goals': 'performance_goals',
  '/ops/onboarding/tasks': 'onboarding_tasks',
  '/ops/helpdesk/tickets': 'helpdesk_tickets',
  '/ops/announcements': 'announcements',
  '/ops/notifications': 'notifications',
  '/services/documents': 'documents',
  '/services/assets': 'assets',
};

async function listOrgCollection(profile, collection, params = {}) {
  assertCompanyRole(profile);
  let q = col(collection, profile.organization_id);
  const snap = await q.limit(500).get();
  let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (params.search) {
    const s = clean(params.search).toLowerCase();
    rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(s));
  }
  return rows;
}

async function dispatch(request) {
  const method = String(request.data?.method || 'GET').toUpperCase();
  const path = String(request.data?.path || '');
  const body = request.data?.body || {};
  const params = request.data?.params || {};

  if (path === '/auth/resolve-login' && method === 'POST') return { success: true, email: await resolveLogin(body.identifier, body.companySlug) };
  if (path === '/auth/forgot-password' && method === 'POST') return await forgotPassword(request);

  if (path === '/auth/register' && method === 'POST') return await registerCompany(request);

  const profile = await authContext(request);
  if (path === '/auth/me' && method === 'GET') return await getMe(request);

  if (profile.role === 'PLATFORM_OWNER') {
    const allowed = path.startsWith('/ops/platform/') || path === '/auth/me';
    if (!allowed) throw new HttpsError('permission-denied', 'Platform administrators can only access dashboard, companies, helpdesk, password-reset requests, and platform settings.');
  }

  if (path === '/auth/register' && method === 'POST') return await registerCompany(request);
  if (path === '/employees' && method === 'GET') {
    assertCompanyRole(profile);
    let employees = await listOrgCollection(profile, 'employees', params);
    if (params.departmentId) employees = employees.filter(e => e.department_id === params.departmentId);
    if (params.status) employees = employees.filter(e => e.employment_status === params.status);
    return { success: true, employees };
  }
  if (path === '/employees' && method === 'POST') return await createEmployee(request, profile);
  if (path.startsWith('/employees/') && method === 'GET') {
    assertCompanyRole(profile);
    const employeeId = path.split('/')[2]; const snap = await col('employees', profile.organization_id).doc(employeeId).get();
    if (!snap.exists) throw new HttpsError('not-found', 'Employee not found in your organization.');
    const employee = { id: snap.id, ...snap.data() };
    const directSnap = await col('employees', profile.organization_id).where('reporting_manager_id','==',employeeId).get();
    return { success:true, employee, directReports: directSnap.docs.map(d=>({id:d.id,...d.data()})), leaveBalances:[], assets:[], documents:[], recentAttendance:[] };
  }
  if (path.startsWith('/employees/meta/')) {
    assertCompanyRole(profile); const key=path.split('/').pop(); const map={departments:'departments',designations:'designations',locations:'locations',shifts:'shifts'}; const rows=await listOrgCollection(profile,map[key]||key,{}); return {success:true,[key]:rows};
  }

  if (path === '/organizations/current' && method === 'GET') { assertCompanyRole(profile); const s=await tenantRef(profile.organization_id).get(); const o={id:s.id,...s.data()}; return {success:true,organization:{...o,tenant_url:o.custom_domain||`https://${o.tenant_domain}`}}; }
  if (path === '/organizations/current' && method === 'PUT') { assertCompanyRole(profile,['ORG_OWNER','HR_ADMIN']); await tenantRef(profile.organization_id).update({...body, updated_at:now()}); const s=await tenantRef(profile.organization_id).get(); return {success:true,organization:{id:s.id,...s.data()}}; }
  if (path === '/organizations/stats') { if (profile.role === 'PLATFORM_OWNER') { const s=await db.collection('organizations').get(); return {success:true,stats:{company_count:s.size,employee_count:0,active_employee_count:0,attendance_today:0,pending_leave_count:0,pendingApprovals:{total:0}}}; } assertCompanyRole(profile); const [e,a,l]=await Promise.all([col('employees',profile.organization_id).get(),col('attendance_records',profile.organization_id).get(),col('leave_applications',profile.organization_id).get()]); return {success:true,stats:{employee_count:e.size,active_employee_count:e.docs.filter(d=>d.data().employment_status==='ACTIVE').length,attendance_today:a.docs.filter(d=>d.data().date===new Date().toISOString().slice(0,10)).length,pending_leave_count:l.docs.filter(d=>d.data().status==='PENDING').length}}; }

  if (simpleCollections[path]) {
    const collection=simpleCollections[path];
    if (method==='GET') { const rows=await listOrgCollection(profile,collection,params); const responseKey={expenses:'expenses',helpdesk_tickets:'tickets',recruitment_jobs:'jobs',recruitment_candidates:'candidates',performance_cycles:'cycles',performance_goals:'goals',onboarding_tasks:'tasks',announcements:'announcements',notifications:'notifications',documents:'documents',assets:'assets'}[collection]||collection; return {success:true,[responseKey]:rows}; }
    if (method==='POST') { assertCompanyRole(profile); const ref=col(collection,profile.organization_id).doc(id(collection)); const row={...body,created_at:now(),updated_at:now(),created_by:profile.id}; await ref.set(row); if(collection==='helpdesk_tickets') await notifySlack('New Zenora company helpdesk ticket',{Company:profile.organization_id,Subject:body.subject||'New ticket'}); return {success:true,[collection==='expenses'?'expense':collection==='helpdesk_tickets'?'ticket':collection.slice(0,-1)]:{id:ref.id,...row}}; }
  }

  if (path === '/attendance/today') { assertCompanyRole(profile); const emp=profile.employee_id; const date=new Date().toISOString().slice(0,10); const s=emp?await col('attendance_records',profile.organization_id).where('employee_id','==',emp).where('date','==',date).limit(1).get():{empty:true}; return {success:true,record:s.empty?null:{id:s.docs[0].id,...s.docs[0].data()}}; }
  if (path === '/attendance/history') { assertCompanyRole(profile); let s=await col('attendance_records',profile.organization_id).where('employee_id','==',profile.employee_id).limit(180).get(); return {success:true,records:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path === '/attendance/check-in' && method==='POST') { assertCompanyRole(profile); const date=new Date().toISOString().slice(0,10); const ref=col('attendance_records',profile.organization_id).doc(`${profile.employee_id}_${date}`); await ref.set({employee_id:profile.employee_id,date,check_in_time:now(),status:'PRESENT',updated_at:now()},{merge:true}); return {success:true,message:'Checked in successfully.'}; }
  if (path === '/attendance/check-out' && method==='POST') { assertCompanyRole(profile); const date=new Date().toISOString().slice(0,10); const ref=col('attendance_records',profile.organization_id).doc(`${profile.employee_id}_${date}`); await ref.set({employee_id:profile.employee_id,date,check_out_time:now(),updated_at:now()},{merge:true}); return {success:true,message:'Checked out successfully.'}; }

  if (path === '/leaves/types') { assertCompanyRole(profile); return {success:true,types:await listOrgCollection(profile,'leave_types',{})}; }
  if (path === '/leaves/balances') { assertCompanyRole(profile); return {success:true,balances:await listOrgCollection(profile,'leave_balances',{})}; }
  if (path === '/leaves/applications') { assertCompanyRole(profile); return {success:true,applications:await listOrgCollection(profile,'leave_applications',{})}; }
  if (path === '/leaves/apply' && method==='POST') { assertCompanyRole(profile); const ref=col('leave_applications',profile.organization_id).doc(id('leave')); const row={...body,employee_id:profile.employee_id,status:'PENDING',created_at:now(),updated_at:now()}; await ref.set(row); await notifySlack('New Zenora leave request',{Company:profile.organization_id,Employee:profile.employee_id,Dates:`${body.startDate||body.start_date} to ${body.endDate||body.end_date}`}); return {success:true,message:'Leave request submitted.'}; }
  if (path === '/leaves/pending-approvals') { assertCompanyRole(profile,['MANAGER','ORG_OWNER','HR_ADMIN']); const s=await col('leave_applications',profile.organization_id).where('approver_id','==',profile.employee_id).where('status','==','PENDING').get(); return {success:true,pendingLeaves:s.docs.map(d=>({id:d.id,...d.data()}))}; }

  if (path === '/biometric/devices' && method==='GET') { assertCompanyRole(profile,['ORG_OWNER','HR_ADMIN']); return {success:true,devices:await listOrgCollection(profile,'biometric_devices',{})}; }
  if (path === '/biometric/mappings' && method==='GET') { assertCompanyRole(profile,['ORG_OWNER','HR_ADMIN']); return {success:true,mappings:await listOrgCollection(profile,'biometric_employee_mappings',{})}; }
  if (path.startsWith('/biometric/team/') && method==='GET') { assertCompanyRole(profile,['MANAGER']); const employeeId=path.split('/')[3]; const direct=await col('employees',profile.organization_id).doc(employeeId).get(); if(!direct.exists || direct.data().reporting_manager_id!==profile.employee_id) throw new HttpsError('permission-denied','You can only view biometric logs for your direct reports.'); const s=await col('biometric_events',profile.organization_id).where('employee_id','==',employeeId).limit(200).get(); return {success:true,logs:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path === '/biometric/team' && method==='GET') { assertCompanyRole(profile,['MANAGER']); const s=await col('employees',profile.organization_id).where('reporting_manager_id','==',profile.employee_id).get(); return {success:true,employees:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path === '/biometric/my-logs' && method==='GET') { assertCompanyRole(profile); const s=await col('biometric_events',profile.organization_id).where('employee_id','==',profile.employee_id).limit(200).get(); return {success:true,logs:s.docs.map(d=>({id:d.id,...d.data()}))}; }

  if (path === '/ops/audit-logs') { assertCompanyRole(profile); return {success:true,logs:await listOrgCollection(profile,'audit_logs',{})}; }
  if (path === '/ops/notifications') { assertCompanyRole(profile); return {success:true,notifications:await listOrgCollection(profile,'notifications',{})}; }
  if (path === '/ops/notifications/mark-all-read' && method==='PUT') { assertCompanyRole(profile); const s=await col('notifications',profile.organization_id).where('user_id','==',profile.id).get(); const batch=db.batch(); s.docs.forEach(d=>batch.update(d.ref,{is_read:1})); await batch.commit(); return {success:true}; }

  if (path === '/ops/platform/organizations') { if(profile.role!=='PLATFORM_OWNER') throw new HttpsError('permission-denied','Platform admin only.'); const s=await db.collection('organizations').limit(500).get(); return {success:true,organizations:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path === '/ops/platform/helpdesk') { if(profile.role!=='PLATFORM_OWNER') throw new HttpsError('permission-denied','Platform admin only.'); const s=await db.collectionGroup('helpdesk_tickets').limit(500).get(); return {success:true,tickets:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path === '/ops/platform/password-reset-requests') { if(profile.role!=='PLATFORM_OWNER') throw new HttpsError('permission-denied','Platform admin only.'); const s=await db.collection('password_reset_requests').orderBy('created_at','desc').limit(500).get(); return {success:true,requests:s.docs.map(d=>({id:d.id,...d.data()}))}; }
  if (path.startsWith('/ops/platform/organizations/') && path.endsWith('/status') && method==='PUT') { if(profile.role!=='PLATFORM_OWNER') throw new HttpsError('permission-denied','Platform admin only.'); const parts=path.split('/'); const orgId=parts[4]; await tenantRef(orgId).update({status:body.status,updated_at:now()}); return {success:true,message:`Company status changed to ${body.status}.`}; }

  return {success:true, message:'This Firebase endpoint is configured, but this operation has not been migrated yet.'};
}

export const zenoraApi = onCall({ region: 'asia-south1', secrets: [EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY, SLACK_WEBHOOK_URL, APP_BASE_URL], cors: true }, async (request) => {
  try { return await dispatch(request); }
  catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error(err);
    throw new HttpsError('internal', err.message || 'Zenora Firebase operation failed.');
  }
});
