const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => ({})) : {};
  if (!isJson) throw new Error('API returned a non-JSON response');
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
};

export const getCurrentUser = () => request('/auth/me');
export const login = (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const logout = () => request('/auth/logout', { method: 'POST' });
export const getUsers = () => request('/users');
export const getUser = (id) => request(`/users/${id}`);
export const getUserProfile = (id) => request(`/users/${id}/profile`);
export const getMyProfile = () => request('/me/profile');
export const updateMyProfile = (data) => request('/me/profile', { method: 'PATCH', body: JSON.stringify(data) });
export const saveMyAssessment = (data) => request('/me/assessment', { method: 'PUT', body: JSON.stringify(data) });
export const getConversations = () => request('/conversations');
export const getConversation = (id) => request(`/conversations/${id}`);
export const getMessages = (conversationId) => request(`/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, body) => request(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ body }) });
export const editMessage = (id, body) => request(`/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ body }) });
export const deleteMessage = (id) => request(`/messages/${id}`, { method: 'DELETE' });
export const createConversation = (data) => request('/conversations', { method: 'POST', body: JSON.stringify(data) });
