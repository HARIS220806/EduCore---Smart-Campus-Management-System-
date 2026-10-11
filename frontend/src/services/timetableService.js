import api from './api';

export const timetableService = {
  list: async (params) => (await api.get('/timetable', { params })).data,
  create: async (payload) => (await api.post('/timetable', payload)).data,
  remove: async (id) => (await api.delete(`/timetable/${id}`)).data,
};

export default timetableService;
