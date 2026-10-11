import api from './api';

export const reportService = {
  academicSummary: async () => (await api.get('/reports/academic-summary')).data,
};

export default reportService;
