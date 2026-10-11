import api from './api';

export const attendanceService = {
  list: async (params) => (await api.get('/attendance', { params })).data,
  summary: async (studentId) => (await api.get(`/attendance/summary${studentId ? `/${studentId}` : ''}`)).data,
  mark: async (payload) => (await api.post('/attendance', payload)).data,
};

export default attendanceService;
