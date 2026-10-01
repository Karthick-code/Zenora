import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  addDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth, db, createSecondaryAuth } from './firebase';

const clean = (value) => String(value ?? '').trim();
const email = (value) => clean(value).toLowerCase();
const now = () => new Date().toISOString();
const makeId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

const response = (data) => ({ data });
const fail = (message, status = 400) => {
  const error = new Error(message);
  error.response = { status, data: { message } };
  throw error;
};

const userRef = (uid) => doc(db, 'users', uid);
const orgRef = (orgId) => doc(db, 'organizations', orgId);
const orgCollection = (orgId, name) => collection(db, 'organizations', orgId, name);

async function profile() {
  if (!auth.currentUser) fail('Authentication required.', 401);
  const snap = await getDoc(userRef(auth.currentUser.uid));
  if (!snap.exists()) fail('Your Zenora account profile is not configured.', 403);
  const data = { id: snap.id, ...snap.data() };
  if (data.is_active === false) fail('Your Zenora account is inactive.', 403);
  return data;
}

const assertCompany = (p, roles = []) => {
  if (p.role === 'PLATFORM_OWNER') fail('Platform administrators cannot access company workforce records.', 403);
  if (roles.length && !roles.includes(p.role)) fail('You are not authorized for this action.', 403);
  if (!p.organization_id) fail('Your account is not attached to a company.', 403);
};

const rows = async (ref, params = {}) => {
  const snap = await getDocs(query(ref, limit(500)));
  let result = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (params.search) {
    const search = clean(params.search).toLowerCase();
    result = result.filter((item) => JSON.stringify(item).toLowerCase().includes(search));
  }
  return result;
};

async function findOrganization(companySlug = '', tenantDomain = '') {
  const slug = clean(companySlug).toLowerCase();
  const domain = clean(tenantDomain).toLowerCase();
  if (slug) {
    const snap = await getDocs(query(collection(db, 'organizations'), where('slug', '==', slug), limit(1)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }
  if (domain) {
    const snap = await getDocs(query(collection(db, 'organizations'), where('tenant_domain', '==', domain), limit(1)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  }
  return null;
}

async function resolveLogin(identifier, companySlug) {
  const value = clean(identifier);
  if (value.includes('@')) return email(value);
  const org = await findOrganization(companySlug);
  if (!org) fail('Company workspace is required when using an employee ID.', 404);
  const snap = await getDocs(query(orgCollection(org.id, 'employees'), where('employee_code', '==', value), limit(1)));
  if (snap.empty) fail('Employee ID or company workspace was not found.', 404);
  const employee = snap.docs[0].data();
  if (!employee.user_id) fail('This employee does not have a login account yet.', 400);
  const user = await getDoc(userRef(employee.user_id));
  if (!user.exists() || !user.data().email) fail('Employee login profile is incomplete.', 400);
  return user.data().email;
}

async function registerCompany(body) {
  if (!auth.currentUser) fail('Authentication required.', 401);
  const name = clean(body.companyName);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  if (!name || !slug) fail('Company name is required.');

  // Use the normalized workspace slug as the organization document ID. This avoids
  // requiring a pre-registration organization query, which would otherwise need
  // public Firestore reads before the new user has a profile. A duplicate slug
  // naturally fails the Firestore create rule because the document already exists.
  const orgId = slug;
  const tenantDomain = `${slug}.zenora.com`;
  const timestamp = now();
  const org = {
    name,
    slug,
    tenant_domain: tenantDomain,
    custom_domain: '',
    domain_status: 'SYSTEM_SUBDOMAIN',
    industry: body.industry || 'Technology & Software',
    company_size: body.companySize || '25-100',
    status: 'ACTIVE',
    created_by_uid: auth.currentUser.uid,
    subscription_plan: 'GROWTH',
    subscription_status: 'ACTIVE',
    created_at: timestamp,
    updated_at: timestamp,
  };
  const user = {
    email: email(body.email),
    role: 'ORG_OWNER',
    organization_id: orgId,
    first_name: clean(body.firstName),
    last_name: clean(body.lastName),
    is_active: true,
    created_at: timestamp,
    updated_at: timestamp,
  };

  const batch = writeBatch(db);
  batch.set(orgRef(orgId), org);
  batch.set(userRef(auth.currentUser.uid), user);
  await batch.commit();
  return { success: true, tenantUrl: `https://${tenantDomain}`, tenantDomain, tenantSlug: slug };
}

async function getMe() {
  const p = await profile();
  let employee = null;
  if (p.organization_id && p.employee_id) {
    const snap = await getDoc(doc(db, 'organizations', p.organization_id, 'employees', p.employee_id));
    if (snap.exists()) employee = { id: snap.id, ...snap.data() };
  }
  let organizationName = '';
  if (p.organization_id) {
    const org = await getDoc(orgRef(p.organization_id));
    if (org.exists()) organizationName = org.data().name || '';
  }
  return { success: true, user: {
    id: p.id, uid: p.id, organization_id: p.organization_id || null, email: p.email,
    role: p.role, first_name: p.first_name || '', last_name: p.last_name || '',
    employee_id: p.employee_id || null, employee_code: p.employee_code || null,
    is_active: p.is_active ?? true, firstName: p.first_name || '', lastName: p.last_name || '',
    organizationName, employeeId: p.employee_id || null, employeeCode: p.employee_code || null,
    avatarUrl: p.avatar_url || '', employee,
  }};
}

async function forgotPassword(body) {
  const identifier = clean(body.identifier);
  const targetEmail = identifier.includes('@') ? email(identifier) : await resolveLogin(identifier, body.companySlug);
  // Firebase Auth owns the password-reset flow; no privileged server or secret is required.
  await sendPasswordResetEmail(auth, targetEmail, {
    url: `${window.location.origin}/reset-password`,
    handleCodeInApp: true,
  });
  if (auth.currentUser) {
    const p = await profile();
    await addDoc(collection(db, 'password_reset_requests'), {
      organization_id: p.organization_id || null,
      user_id: auth.currentUser.uid,
      email: targetEmail,
      status: 'REQUESTED',
      requested_at: now(),
      created_at: now(),
    });
  }
  return { success: true, message: 'If the account exists, a reset link has been sent to the registered email.' };
}

async function createEmployee(body, p) {
  assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']);
  if (!body.firstName || !body.lastName || !body.email || !body.joiningDate) fail('First name, last name, email, and joining date are required.');
  const orgId = p.organization_id;
  const existingRows = await rows(orgCollection(orgId, 'employees'));
  const employeeCode = clean(body.employeeCode) || `EMP-${String(existingRows.length + 1).padStart(3, '0')}`;
  if (existingRows.some((e) => e.employee_code === employeeCode)) fail('That employee ID already exists in your company.', 409);

  let userId = null;
  let secondaryAuth = null;
  if (body.createLoginAccount) {
    secondaryAuth = createSecondaryAuth();
    const tempPassword = `Z${crypto.randomUUID()}a1!`;
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email(body.email), tempPassword);
      userId = credential.user.uid;
      await setDoc(userRef(userId), {
        email: email(body.email), role: body.role || 'EMPLOYEE', organization_id: orgId, employee_id: null,
        first_name: clean(body.firstName), last_name: clean(body.lastName), is_active: true, created_at: now(), updated_at: now(),
      });
      await signOut(secondaryAuth);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') fail('That email is already used by a Zenora login.', 409);
      throw err;
    }
  }

  const employeeId = makeId('emp');
  const employee = {
    employee_code: employeeCode, user_id: userId, first_name: clean(body.firstName), last_name: clean(body.lastName),
    email: email(body.email), phone: body.phone || '', gender: body.gender || '', date_of_birth: body.dateOfBirth || '', joining_date: body.joiningDate,
    department_id: body.departmentId || '', designation_id: body.designationId || '', location_id: body.locationId || '', shift_id: body.shiftId || '',
    reporting_manager_id: body.reportingManagerId || '', team_head_id: body.teamHeadId || body.reportingManagerId || '', employment_type: body.employmentType || 'FULL_TIME',
    employment_status: body.employmentStatus || 'ACTIVE', base_salary: Number(body.baseSalary || 0), bank_name: body.bankName || '',
    bank_account_no: body.bankAccountNo || '', bank_ifsc: body.bankIfsc || '', pan_tax_id: body.panTaxId || '', pf_uan_number: body.pfUanNumber || '',
    created_at: now(), updated_at: now(),
  };
  await setDoc(doc(db, 'organizations', orgId, 'employees', employeeId), employee);
  if (userId) await updateDoc(userRef(userId), { employee_id: employeeId });
  return { success: true, employee: { id: employeeId, ...employee } };
}

const simpleCollections = {
  '/expenses': ['expenses', 'expenses'],
  '/ops/recruitment/jobs': ['recruitment_jobs', 'jobs'],
  '/ops/recruitment/candidates': ['recruitment_candidates', 'candidates'],
  '/ops/performance/cycles': ['performance_cycles', 'cycles'],
  '/ops/performance/goals': ['performance_goals', 'goals'],
  '/ops/onboarding/tasks': ['onboarding_tasks', 'tasks'],
  '/ops/helpdesk/tickets': ['helpdesk_tickets', 'tickets'],
  '/ops/announcements': ['announcements', 'announcements'],
  '/ops/notifications': ['notifications', 'notifications'],
  '/services/documents': ['documents', 'documents'],
  '/services/assets': ['assets', 'assets'],
};

async function simpleCollection(path, method, body, params, p) {
  const [collectionName, key] = simpleCollections[path];
  assertCompany(p);
  if (method === 'GET') return { success: true, [key]: await rows(orgCollection(p.organization_id, collectionName), params) };
  if (method === 'POST') {
    const id = makeId(collectionName);
    const row = { ...body, created_at: now(), updated_at: now(), created_by: p.id };
    await setDoc(doc(orgCollection(p.organization_id, collectionName), id), row);
    return { success: true, [collectionName === 'expenses' ? 'expense' : collectionName === 'helpdesk_tickets' ? 'ticket' : collectionName.slice(0, -1)]: { id, ...row } };
  }
  fail('Unsupported operation.');
}

async function dispatch(method, path, body, params) {
  if (path === '/auth/resolve-login' && method === 'POST') return { success: true, email: await resolveLogin(body.identifier, body.companySlug) };
  if (path === '/auth/register' && method === 'POST') return registerCompany(body);
  if (path === '/auth/forgot-password' && method === 'POST') return forgotPassword(body);
  if (path === '/auth/me' && method === 'GET') return getMe();

  const p = await profile();
  if (p.role === 'PLATFORM_OWNER' && !(path.startsWith('/ops/platform/') || path === '/auth/me')) fail('Platform administrators can only access platform administration.', 403);

  if (path === '/employees' && method === 'GET') {
    assertCompany(p);
    let employees = await rows(orgCollection(p.organization_id, 'employees'), params);
    if (params.departmentId) employees = employees.filter((e) => e.department_id === params.departmentId);
    if (params.status) employees = employees.filter((e) => e.employment_status === params.status);
    return { success: true, employees };
  }
  if (path === '/employees' && method === 'POST') return createEmployee(body, p);
  if (path.startsWith('/employees/') && method === 'GET') {
    assertCompany(p);
    const employeeId = path.split('/')[2];
    const snap = await getDoc(doc(db, 'organizations', p.organization_id, 'employees', employeeId));
    if (!snap.exists()) fail('Employee not found in your organization.', 404);
    const employee = { id: snap.id, ...snap.data() };
    const direct = await getDocs(query(orgCollection(p.organization_id, 'employees'), where('reporting_manager_id', '==', employeeId)));
    return { success: true, employee, directReports: direct.docs.map((d) => ({ id: d.id, ...d.data() })), leaveBalances: [], assets: [], documents: [], recentAttendance: [] };
  }
  if (path.startsWith('/employees/meta/')) {
    assertCompany(p);
    const key = path.split('/').pop();
    const map = { departments: 'departments', designations: 'designations', locations: 'locations', shifts: 'shifts' };
    return { success: true, [key]: await rows(orgCollection(p.organization_id, map[key] || key), {}) };
  }

  if (path === '/organizations/current' && method === 'GET') {
    assertCompany(p);
    const snap = await getDoc(orgRef(p.organization_id));
    const o = { id: snap.id, ...snap.data() };
    return { success: true, organization: { ...o, tenant_url: o.custom_domain || `https://${o.tenant_domain}` } };
  }
  if (path === '/organizations/current' && method === 'PUT') {
    assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']);
    await updateDoc(orgRef(p.organization_id), { ...body, updated_at: now() });
    const snap = await getDoc(orgRef(p.organization_id));
    return { success: true, organization: { id: snap.id, ...snap.data() } };
  }
  if (path === '/organizations/stats') {
    if (p.role === 'PLATFORM_OWNER') {
      const snap = await getDocs(query(collection(db, 'organizations'), limit(500)));
      return { success: true, stats: { company_count: snap.size, employee_count: 0, active_employee_count: 0, attendance_today: 0, pending_leave_count: 0, pendingApprovals: { total: 0 } } };
    }
    assertCompany(p);
    const [e, a, l] = await Promise.all([rows(orgCollection(p.organization_id, 'employees')), rows(orgCollection(p.organization_id, 'attendance_records')), rows(orgCollection(p.organization_id, 'leave_applications'))]);
    const today = new Date().toISOString().slice(0, 10);
    return { success: true, stats: { employee_count: e.length, active_employee_count: e.filter((x) => x.employment_status === 'ACTIVE').length, attendance_today: a.filter((x) => x.date === today).length, pending_leave_count: l.filter((x) => x.status === 'PENDING') .length } };
  }

  if (simpleCollections[path]) return simpleCollection(path, method, body, params, p);

  if (path === '/attendance/today') {
    assertCompany(p); const date = new Date().toISOString().slice(0, 10);
    if (!p.employee_id) return { success: true, record: null };
    const snap = await getDocs(query(orgCollection(p.organization_id, 'attendance_records'), where('employee_id', '==', p.employee_id), where('date', '==', date), limit(1)));
    return { success: true, record: snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } };
  }
  if (path === '/attendance/history') {
    assertCompany(p); if (!p.employee_id) return { success: true, records: [] };
    const snap = await getDocs(query(orgCollection(p.organization_id, 'attendance_records'), where('employee_id', '==', p.employee_id), limit(180)));
    return { success: true, records: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }
  if (path === '/attendance/check-in' && method === 'POST') {
    assertCompany(p); const date = new Date().toISOString().slice(0, 10);
    const id = `${p.employee_id}_${date}`;
    await setDoc(doc(orgCollection(p.organization_id, 'attendance_records'), id), { employee_id: p.employee_id, date, check_in_time: now(), status: 'PRESENT', updated_at: now() }, { merge: true });
    return { success: true, message: 'Checked in successfully.' };
  }
  if (path === '/attendance/check-out' && method === 'POST') {
    assertCompany(p); const date = new Date().toISOString().slice(0, 10);
    const id = `${p.employee_id}_${date}`;
    await setDoc(doc(orgCollection(p.organization_id, 'attendance_records'), id), { employee_id: p.employee_id, date, check_out_time: now(), updated_at: now() }, { merge: true });
    return { success: true, message: 'Checked out successfully.' };
  }

  if (path === '/leaves/types') { assertCompany(p); return { success: true, types: await rows(orgCollection(p.organization_id, 'leave_types')) }; }
  if (path === '/leaves/balances') { assertCompany(p); return { success: true, balances: await rows(orgCollection(p.organization_id, 'leave_balances')) }; }
  if (path === '/leaves/applications') { assertCompany(p); return { success: true, applications: await rows(orgCollection(p.organization_id, 'leave_applications'), params) }; }
  if (path === '/leaves/apply' && method === 'POST') {
    assertCompany(p); const id = makeId('leave'); const row = { ...body, employee_id: p.employee_id, status: 'PENDING', created_at: now(), updated_at: now() };
    await setDoc(doc(orgCollection(p.organization_id, 'leave_applications'), id), row);
    return { success: true, message: 'Leave request submitted.' };
  }
  if (path === '/leaves/pending-approvals') {
    assertCompany(p, ['MANAGER', 'ORG_OWNER', 'HR_ADMIN']);
    const snap = await getDocs(query(orgCollection(p.organization_id, 'leave_applications'), where('approver_id', '==', p.employee_id), where('status', '==', 'PENDING')));
    return { success: true, pendingLeaves: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }

  if (path === '/biometric/devices' && method === 'GET') { assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']); return { success: true, devices: await rows(orgCollection(p.organization_id, 'biometric_devices')) }; }
  if (path === '/biometric/mappings' && method === 'GET') { assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']); return { success: true, mappings: await rows(orgCollection(p.organization_id, 'biometric_employee_mappings')) }; }
  if (path === '/biometric/devices' && method === 'POST') { assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']); const id = makeId('device'); const row = { ...body, created_at: now(), updated_at: now() }; await setDoc(doc(orgCollection(p.organization_id, 'biometric_devices'), id), row); return { success: true, device: { id, ...row } }; }
  if (path === '/biometric/mappings' && method === 'POST') { assertCompany(p, ['ORG_OWNER', 'HR_ADMIN']); const id = makeId('mapping'); const row = { ...body, created_at: now(), updated_at: now() }; await setDoc(doc(orgCollection(p.organization_id, 'biometric_employee_mappings'), id), row); return { success: true, mapping: { id, ...row } }; }
  if (path.startsWith('/biometric/team/') && method === 'GET') {
    assertCompany(p, ['MANAGER']); const employeeId = path.split('/')[3];
    const direct = await getDoc(doc(db, 'organizations', p.organization_id, 'employees', employeeId));
    if (!direct.exists() || direct.data().reporting_manager_id !== p.employee_id) fail('You can only view biometric logs for your direct reports.', 403);
    const snap = await getDocs(query(orgCollection(p.organization_id, 'biometric_events'), where('employee_id', '==', employeeId), limit(200)));
    return { success: true, logs: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }
  if (path === '/biometric/team' && method === 'GET') { assertCompany(p, ['MANAGER']); const snap = await getDocs(query(orgCollection(p.organization_id, 'employees'), where('reporting_manager_id', '==', p.employee_id))); return { success: true, employees: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }; }
  if (path === '/biometric/my-logs' && method === 'GET') { assertCompany(p); const snap = await getDocs(query(orgCollection(p.organization_id, 'biometric_events'), where('employee_id', '==', p.employee_id), limit(200))); return { success: true, logs: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }; }

  if (path === '/ops/audit-logs') { assertCompany(p); return { success: true, logs: await rows(orgCollection(p.organization_id, 'audit_logs')) }; }
  if (path === '/ops/notifications') { assertCompany(p); return { success: true, notifications: await rows(orgCollection(p.organization_id, 'notifications')) }; }
  if (path === '/ops/notifications/mark-all-read' && method === 'PUT') {
    assertCompany(p); const snap = await getDocs(query(orgCollection(p.organization_id, 'notifications'), where('user_id', '==', p.id)));
    const batch = writeBatch(db); snap.docs.forEach((d) => batch.update(d.ref, { is_read: 1 })); await batch.commit(); return { success: true };
  }

  if (path === '/ops/platform/organizations') {
    if (p.role !== 'PLATFORM_OWNER') fail('Platform admin only.', 403);
    const snap = await getDocs(query(collection(db, 'organizations'), limit(500)));
    return { success: true, organizations: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }
  if (path === '/ops/platform/helpdesk') {
    if (p.role !== 'PLATFORM_OWNER') fail('Platform admin only.', 403);
    const snap = await getDocs(query(collectionGroup(db, 'helpdesk_tickets'), limit(500)));
    return { success: true, tickets: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }
  if (path === '/ops/platform/password-reset-requests') {
    if (p.role !== 'PLATFORM_OWNER') fail('Platform admin only.', 403);
    const snap = await getDocs(query(collection(db, 'password_reset_requests'), orderBy('created_at', 'desc'), limit(500)));
    return { success: true, requests: snap.docs.map((d) => ({ id: d.id, ...d.data() })) };
  }
  if (path.startsWith('/ops/platform/organizations/') && path.endsWith('/status') && method === 'PUT') {
    if (p.role !== 'PLATFORM_OWNER') fail('Platform admin only.', 403);
    const orgId = path.split('/')[4]; await updateDoc(orgRef(orgId), { status: body.status, updated_at: now() });
    return { success: true, message: `Company status changed to ${body.status}.` };
  }

  // The original Cloud Function did not implement these routes either. Keep the UI stable while they are migrated.
  const empty = {
    '/payroll/runs': 'runs', '/ops/reports/workforce': 'report', '/attendance/corrections': 'corrections',
  };
  if (empty[path]) return { success: true, [empty[path]]: [] };
  return { success: true, message: 'This Zenora operation is not implemented yet.' };
}

const request = async (method, path, body = {}, params = {}) => {
  try {
    const [cleanPath, queryString] = String(path).split('?');
    const queryParams = { ...params };
    if (queryString) new URLSearchParams(queryString).forEach((value, key) => { queryParams[key] = value; });
    return response(await dispatch(method.toUpperCase(), cleanPath, body, queryParams));
  } catch (error) {
    if (error.response) throw error;
    console.error('Zenora Firebase request failed:', error);
    const message = error?.message || 'Request failed';
    fail(message, error?.code === 'permission-denied' ? 403 : 400);
  }
};

const api = {
  get: (path, config = {}) => request('GET', path, {}, config.params || {}),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path, config = {}) => request('DELETE', path, {}, config.params || {}),
};

export default api;
