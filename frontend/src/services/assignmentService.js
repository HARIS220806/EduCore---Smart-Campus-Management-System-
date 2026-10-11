import api from './api';

export const assignmentService = {
  list: async (params) => (await api.get('/assignments', { params })).data,
  submissions: async (id) => (await api.get(`/assignments/${id}/submissions`)).data,
  create: async (payload) => (await api.post('/assignments', payload)).data,
  update: async (id, payload) => (await api.put(`/assignments/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/assignments/${id}`)).data,
  submit: async (id, payload) => (await api.post(`/assignments/${id}/submit`, payload)).data,
  grade: async (id, studentId, payload) => (await api.post(`/assignments/${id}/grade/${studentId}`, payload)).data,
};

export default assignmentService;
