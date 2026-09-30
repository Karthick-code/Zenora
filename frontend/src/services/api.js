import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const client = httpsCallable(functions);

const request = async (method, path, body = {}, params = {}) => {
  try {
    const [cleanPath, queryString] = String(path).split('?');
    const queryParams = { ...params };
    if (queryString) new URLSearchParams(queryString).forEach((value, key) => { queryParams[key] = value; });
    const result = await client({ method, path: cleanPath, body, params: queryParams });
    return { data: result.data };
  } catch (error) {
    const payload = error?.details || {};
    const message = payload.message || error?.message || 'Request failed';
    const wrapped = new Error(message);
    wrapped.response = { status: error?.code === 'unauthenticated' ? 401 : 400, data: payload };
    throw wrapped;
  }
};

const api = {
  get: (path, config = {}) => request('GET', path, {}, config.params || {}),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path, config = {}) => request('DELETE', path, {}, config.params || {}),
};

export default api;
