import api from './api';

export const marksService = {
  list: async (params) => (await api.get('/marks', { params })).data,
  summary: async (studentId) => (await api.get(`/marks/summary${studentId ? `/${studentId}` : ''}`)).data,
  save: async (payload) => (await api.post('/marks', payload)).data,
  remove: async (id) => (await api.delete(`/marks/${id}`)).data,
};

export default marksService;
