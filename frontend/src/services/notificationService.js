import api from './api';

export const notificationService = {
  list: async () => (await api.get('/notifications')).data,
  markRead: async (id) => (await api.post(`/notifications/${id}/read`)).data,
  markAllRead: async () => (await api.post('/notifications/read-all')).data,
};

export default notificationService;
