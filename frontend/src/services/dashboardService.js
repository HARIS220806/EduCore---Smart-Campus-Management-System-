import api from './api';

export const dashboardService = {
  admin: async () => (await api.get('/dashboard/admin')).data,
  faculty: async () => (await api.get('/dashboard/faculty')).data,
  student: async () => (await api.get('/dashboard/student')).data,
};

export default dashboardService;
