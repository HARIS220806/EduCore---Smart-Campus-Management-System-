import api from './api';

export const courseService = {
  list: async (params) => (await api.get('/courses', { params })).data,
  students: async (id) => (await api.get(`/courses/${id}/students`)).data,
  create: async (payload) => (await api.post('/courses', payload)).data,
  update: async (id, payload) => (await api.put(`/courses/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/courses/${id}`)).data,
};

export default courseService;
