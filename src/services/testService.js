import api from './api';

export const testService = {
  getTestTypes: async () => {
    const response = await api.get('/tests/types');
    return response.data;
  },

  getTemplates: async () => {
    const response = await api.get('/tests/templates');
    return response.data;
  },

  startTest: async (type, templateId, langId) => {
    const response = await api.post('/tests/start', {
      type,
      templateId,
      langId,
    });
    return response.data;
  },

  submitAnswer: async (questionId, langId, answerId) => {
    const response = await api.post('/tests/submit-answer', {
      questionId,
      langId,
      answerId,
    });
    return response.data;
  },

  finishTest: async (testData) => {
    const response = await api.post('/tests/finish', testData);
    return response.data;
  },

  getTestHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/tests/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getTestResult: async (id) => {
    const response = await api.get(`/tests/result/${id}`);
    return response.data;
  },

  changeLanguage: async (questionIds, langId) => {
    const response = await api.post('/tests/change-language', {
      questionIds,
      langId,
    });
    return response.data;
  },
};
