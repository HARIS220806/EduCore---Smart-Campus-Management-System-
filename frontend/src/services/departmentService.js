import api from './api';

export const departmentService = {
  list: async () => (await api.get('/departments')).data,
  create: async (payload) => (await api.post('/departments', payload)).data,
  update: async (id, payload) => (await api.put(`/departments/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/departments/${id}`)).data,
};

export default departmentService;
