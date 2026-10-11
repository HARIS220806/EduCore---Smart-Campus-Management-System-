import api from './api';

export const announcementService = {
  list: async () => (await api.get('/announcements')).data,
  create: async (payload) => (await api.post('/announcements', payload)).data,
  update: async (id, payload) => (await api.put(`/announcements/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/announcements/${id}`)).data,
};

export default announcementService;
