import api from './api';

export const getCleaningConfig = async categoryId => {
  try {
    const response = await api.get(`/categories/${categoryId}/cleaning-config`);
    return response.data;
  } catch (error) {
    throw error;
  }
};